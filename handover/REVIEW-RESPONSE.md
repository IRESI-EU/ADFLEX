# Response to the website review

Every point from `ADFLEX-website_review.pdf` (9 August 2026), what was done, and
where to check it.

Three points were **not** done, and the reasons are at the bottom. Nothing was
quietly skipped.

---

## Done

### 1. Contact form had no notification at all

**Fixed, before the review arrived.** A submission is now emailed to the project.

The architecture differs from the one suggested, deliberately — see
[Not done](#not-done) below.

Sending is not configured yet: it needs SMTP credentials from IRESI. See
`handover/EMAIL-SETUP.md`. Until then every message lands in **Admin →
Messages**, which says so plainly.

*`src/lib/mail.ts`, `src/app/contact/actions.ts`*

### 2. Contact form had no rate limiting

**Fixed.** Five submissions per IP per hour, on top of the existing honeypot. The
sixth is refused with an explanation rather than a silent failure, because a real
person who has genuinely sent five deserves to know why the sixth did not go.

*`tooManySubmissions` in `src/lib/auth.ts`*

### 3. Login limiter could be bypassed by changing the account name

**Fixed, and the review's diagnosis was exactly right.** The old key was
`<ip>:<account>` — one string, so a different account name meant a fresh counter
and the per-IP limit did not exist in practice.

There are now three independent counters, and a request is refused if **any** is
over:

| Counter | Ceiling per 15 min | Why |
| --- | --- | --- |
| account | 8 | Guessing one account is the attack that matters |
| IP | 30 | Looser: a university NAT puts a building behind one address |
| IP + account | 8 | The cheapest signal that one machine is working on one account |

A successful sign-in clears the account and pair counters but **not** the IP one —
otherwise an attacker with any valid account of their own would have a reset
button.

*`src/lib/auth.ts`. Verified: blocked at attempt 31 using 31 different usernames.*

### 4. Changing a password did not revoke sessions

**Fixed.** Accounts carry a `session_version`; the cookie carries the version it
was issued under; a request whose versions disagree is signed out. `npm run
db:user` bumps it whenever it sets a password, so a reset ends every session on
every device on the next request.

*`migrations/002_session_revocation.sql`, `src/lib/auth.ts`, `scripts/db-user.mjs`*

### 5. Draft images were publicly readable, and IDs are sequential

**Fixed.** `/media/[id]` and `/files/[id]` now serve an asset only if it is
attached to something **published**, or the requester is a signed-in editor.

Two details worth knowing:

- A refusal returns **404, not 403**. "Forbidden" would confirm something exists
  at that id, which sequential numbering already makes easy to probe.
- Caching follows the permission. A published image keeps its long immutable
  cache; one served only because an editor is signed in gets `private, no-store`,
  so it cannot be left in a shared cache for the next person.

### 6. Deleting an entry left its images publicly reachable

**Fixed by the same test.** An orphaned image is attached to nothing, so it
matches nothing published and stops being served the moment the entry goes. No
cleanup job to run and nothing to remember.

### 7. Saves could partially succeed

**Fixed.** Uploads and the entry they belong to are now one transaction: it all
lands or none of it does.

Implemented with `AsyncLocalStorage` rather than by threading a client through
every repository function — `withTransaction` puts one connection in async-local
storage and `query` prefers it, so existing code is unchanged and automatically
correct inside a transaction, and the next function someone writes is too.

*`withTransaction` in `src/lib/db.ts`. Verified by forcing a failure after the
image upload: no entry, and no orphaned image.*

### 8. Images were served at full size, with metadata intact

**Fixed.** On upload, anything wider than 1600px is scaled down and re-encoded in
the same format, which also strips EXIF — including GPS coordinates and the
device. Animated GIFs are left alone, because re-encoding one would flatten it to
a single frame.

`sharp` is now a direct dependency; it was already present as a Next dependency.

*`processImage` in `src/lib/upload.ts`. Verified: a 3000px test image with GPS
EXIF stored at 1600px, smaller, with no EXIF.*

### 9. Schema management was not fit for production

**Fixed.** Numbered files in `migrations/`, a `schema_migrations` ledger, and each
file applied **inside a transaction**.

The review's point about the hand-written SQL parser no longer applies: each file
is handed to Postgres whole, so Postgres does the parsing — dollar-quoted bodies
included. The homemade statement splitter is gone.

### 10. A database outage claimed nothing had been published

**Fixed, and this was the most damaging one.** A failed read returned an empty
list, and an empty list is what the page shows when the project genuinely has
published nothing — so a database that blinked told visitors an SEAI-funded
project had no news, no events and no outputs.

Reads now report whether the answer is real. `/news` and `/outcomes` say
**"Temporarily unavailable"** when they cannot reach the database, and keep
"nothing published yet" for when that is true.

*`safeReadStatus` in `src/lib/db.ts`, `src/components/TemporarilyUnavailable.tsx`*

---

## Not done

### Storing every message before emailing it

The review proposes: store, then queue a notification, then retry on failure. The
site does the opposite — email first, store **only if the email could not be
sent**.

This is the client's decision, made deliberately and re-confirmed. The reasoning:

- The review's concern is that an outage must not lose an enquiry. It does not:
  a failed send falls back to the dashboard, so nothing disappears.
- Storing every message means keeping a second copy of someone's name, address
  and free text on a server indefinitely. Not keeping it is better under GDPR,
  and the privacy policy names Maynooth University as controller.

**The residual gap is real and worth stating:** a message that SMTP accepts but
that later bounces leaves no record. Adding a delivery-status record without
storing message bodies would close it, and would be a small change.

### Institutional SSO for the admin

Agreed as the right answer, not possible yet. It needs an Azure AD app
registration, MU IT approval, and a redirect URL on a real domain — and the
project has no production domain yet. Raise it alongside the SMTP request.

### Rate limits in a shared store

Both limiters are in-memory, therefore per-instance: they resist one machine
hammering one server, not a distributed attempt, and they reset on redeploy.

Moving them to Redis or edge rate limiting is right, and needs the hosting
decision first. **The shape does not change when it happens** — the same keys,
read and written somewhere shared. Both are commented to say so.

---

## Still open

These predate the review and are waiting on the project, not on code:

- **No production domain.** Until `NEXT_PUBLIC_SITE_URL` is set there is no
  canonical link, no Open Graph URL and an empty sitemap. A guessed domain would
  be worse than none.
- **The legal pages are still drafts** while the site collects real contact data.
- **The Cookies Policy describes Matomo, a cookie banner and LinkedIn embeds**
  that the site does not have.
- **No favicon**, which is the only console error on the home page.
- **The admin password is a demo string.** Change it with `npm run db:user`
  before the site is public.
- **`npm audit` reports 6 high advisories**, all inside Next's own dependency
  tree (`postcss`, and a nested `sharp@0.34.5`). Clearing them means upgrading
  Next from 16.2.12 to 16.3.0 — a framework bump that should be a deliberate
  decision with a full re-test, not something slipped into a handover.

---

**Since this was written**, on 11 August 2026 the admin login moved from an
email address to a **username**. Nothing was ever sent to that address — there
is no reset by email, no notification, no verification — so it looked like a
promise the site does not keep, and it tangled the login together with the
project mailbox. `info@iresi.eu` now does exactly one job: receiving contact
form messages.

---

*Written 9 August 2026, revised 11 August 2026.*
