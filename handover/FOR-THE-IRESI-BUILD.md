# Notes for whoever builds the IRESI site

Written 12 August 2026, after the ADFLEX review meeting of the same day.

You are reading this because the ADFLEX repository was handed to you as a
starting point. This says what is in it, what to take, what to leave, and the
decisions that are **not yours or mine to make**.

Read `AGENTS.md` first — it is short and it matters. This is Next.js 16.2.12,
and its APIs differ from what you may expect. The guides in
`node_modules/next/dist/docs/` are the authority, not memory.

---

## 1. What was agreed, and what it means for you

IRESI is the parent platform. ADFLEX is one project underneath it. Other
projects will follow, and some of those will keep their own external websites
and only need a page on IRESI linking out.

The instruction from the meeting was **build once, configure per project** — one
admin, one login, one set of components. Not one codebase per project.

So the useful question about any file in this repository is not "does it work?"
but **"is it about ADFLEX, or is it about running a project website?"** The
second kind is what you want.

### The priority order, which was explicit

> Finish → structure → integrate → test → document.

Not features. If you find yourself building a booking flow or a nicer pop-up
before the common structure holds, you are working on the wrong thing.

---

## 2. What is not decided — do not decide it

These need Adarsh, Paolo and the technical team. The meeting was explicit that
they are open:

- **Database architecture.** One central database for all IRESI-hosted projects,
  or one per project. Leaning central, not settled.
- **Hosting**, and where the existing IRESI WordPress site lives.
- **SSO.** Agreed as the direction. Nothing about the mechanism is fixed.
- **How ADFLEX sits under IRESI** — subdomain, subpath, or separate deployment.

Write code that does not care about the answers. Concretely:

- Keep every table name and query in one module (`src/lib/repo.ts` here) so a
  schema change is one file, not forty call sites.
- Do not put the project's identity in a URL, a table name, or a component name
  if a column or a config value would do.
- Do not add a `tenant_id` to everything on the assumption that central storage
  wins. If it does win, adding it later is a migration; if it loses, removing it
  is a mess.

---

## 3. Take these more or less as they are

These are about running a website, not about ADFLEX. They have been through a
security review and are the most valuable thing in the repository.

| File | What it gives you |
| --- | --- |
| `src/lib/db.ts` | Pool, `withTransaction`, `safeReadStatus` |
| `src/lib/auth.ts` | scrypt password hashing, signed session cookie, session revocation, login rate limiting |
| `src/lib/upload.ts` | Image resize and EXIF stripping on upload |
| `src/lib/mail.ts` | SMTP send with header injection guarded |
| `scripts/db-setup.mjs` | Migration runner |
| `scripts/db-user.mjs` | Creating an admin account from the command line |
| `src/app/admin/ConfirmSubmit.tsx` | Confirm dialogue built on `<dialog>` |

Four of them are worth explaining, because the reasoning is not obvious from the
code and re-deriving it is expensive.

**`withTransaction` uses `AsyncLocalStorage`.** It puts one connection in
async-local storage and `query()` prefers it. The alternative was threading a
client parameter through around forty repository functions. This way existing
code is unchanged, and code someone writes next year is automatically correct
inside a transaction without knowing this exists. Keep it.

**`safeReadStatus` returns `{ data, degraded }`.** A failed read used to return
an empty list, and an empty list is also what a page shows when nothing has been
published — so a database that blinked told visitors an SEAI-funded project had
no news, no events and no outputs. Every public read must be able to tell "there
is nothing" from "I could not find out". This was the most damaging bug found in
the review; do not reintroduce it by writing `catch { return [] }`.

**The login limiter counts three keys, not one.** Per account, per IP, and per
IP+account pair. The original counted only `<ip>:<account>` as a single string,
which meant a different account name gave you a fresh counter and the per-IP
limit did not exist. A successful sign-in clears the account and pair counters
but deliberately **not** the IP one — otherwise anyone with a valid account of
their own has a reset button.

**Assets are served through a route that checks publication.**
`src/app/media/[id]/route.ts` serves an image only if it is attached to
something published, or the requester is signed in. IDs are sequential, so
without this anyone could page through drafts. It returns **404, not 403** —
"forbidden" confirms something exists at that id. Cache headers follow the
permission: public and immutable when published, `private, no-store` when it is
only visible because an editor is signed in.

---

## 4. Take the pattern, not the file

These solve the right problem in an ADFLEX-shaped way. Read them, then write the
general version.

**The content model.** `findings`, `publications`, `news_items`. A project page
on IRESI needs a title, an image, a description and a link — the same shape with
different words. Somewhere between "one table per content type" and "one generic
`content` table with a JSON blob" is the answer, and it depends on the database
decision above. Do not guess in a hurry.

**The admin forms** (`src/app/admin/forms.tsx`). The *pieces* generalise well —
`Required`, `FieldError`, `keep` (which puts a rejected submission's values back
in the fields instead of blanking them), the image chooser, the confirm
dialogue. The *forms* do not: they name findings and publications. Lift the
pieces into something shared and build each form from them.

**Publish as a flag, not a state machine.** Every content table has a boolean
`published` and nothing appears publicly until it is set. It is easy to explain,
which matters when the person using it is not technical.

**Ordering.** `sort_order` arranges entries *within* their own group; it cannot
lift an entry out of its group. There was briefly a switch in the admin for
which list led the page. It was removed the next day. The useful thing to
arrange turned out to be entries within a list.

**Two kinds of content, and say which is which.** Some things an editor changes
in the admin; some things a developer changes in a file. Documenting the split
plainly is most of what makes a handover work. `src/content/adflex.ts` is the
whole of the second kind for this site — one file, so the answer to "where do I
change the About text?" is one sentence.

---

## 5. Leave these behind

- `src/content/adflex.ts` — ADFLEX's words. IRESI has its own.
- The `Adflex*` components (`AdflexHeader`, `AdflexHero`, `AdflexFooter`). The
  structure is worth reading; the identity is not IRESI's.
- The `--adflex-*` design tokens in `src/app/globals.css`. **Take the idea** —
  every colour, space and font size is a token, so a theme is one block of CSS —
  and rename them. If IRESI and ADFLEX are to sit under one platform, this is
  the seam where a project's look gets applied, and it is worth getting right
  early. Retrofitting theming is much worse than starting with it.

---

## 6. Things that cost me time. Do not pay for them twice.

**`npm run check` is `lint && build && typecheck`, in that order.** Typecheck
must run *after* build, because Next generates `RouteContext` types during the
build. Run typecheck first on a clean checkout and it fails with
`Cannot find name 'RouteContext'`.

**Dates are `to_char`-ed to strings in SQL, never returned as `Date`.** `pg` maps
a `DATE` to a JavaScript Date at midnight in the server's zone, so an event on
the 1st renders as the 31st for anyone west of it.

**Time comparisons use the project's zone explicitly.** The database container
runs UTC; the project runs in Ireland. `event_date` and `event_time` are naive —
14:30 means 14:30 where the event is — so the *present* gets converted, never
the event. See `PROJECT_NOW` in `src/lib/repo.ts`. A bare `now()` held Irish
events open an extra hour every summer.

**Do not compute the same thing in SQL and again in JavaScript.** There was an
`isUpcoming()` helper comparing dates in the browser while SQL compared end
times. They disagreed: a morning event kept offering bookings until midnight. It
was deleted on 12 August 2026 and everything now reads one server-computed flag.

**The email address that receives contact messages does exactly one job.** It is
`CONTACT_EMAIL` in `src/lib/site.ts` and it is not the login, not the sender, not
a default for anything. It was all three once, and changing where enquiries went
changed who could sign in. The sending mailbox is a separate setting that must be
filled in explicitly even when it is the same address — the "leave it blank and
it defaults" shortcut is how one value quietly starts doing two jobs again.

**The admin login is a username, not an email address.** Nothing is ever sent to
it: no reset, no notification, no verification. An email address there is a
promise the site does not keep. Use `type="text"` — an email input refuses to
submit anything without an `@`, which tells an editor their correct username is
malformed.

**Deleting a row does not delete its uploads.** The join tables cascade, so the
*attachments* go, but each `media` row carries the whole file in a `BYTEA`
column and those rows stayed — seven had accumulated here. `deleteOrphanedUploads`
in `src/lib/repo.ts` sweeps anything **nothing at all** points at, so an image
shared by two entries survives losing one of them. Note the comment on it: it is
safe only because there is no media-library page, so an upload cannot exist
before it is attached. If you build a library, that assumption breaks and the
sweep becomes a reaper of editors' work.

**A statically rendered page will not show new content until something
revalidates it.** The home page here is static and the admin actions call
`revalidate("/")`. A test that wrote rows straight into the database and then
read the home page reported a bug that did not exist.

---

## 7. What changed in ADFLEX on 12 August 2026

So you are not reading a stale repository:

- **An event that has happened stays on the public page.** It used to disappear
  at its end time, so a visitor the following week saw no evidence it had
  happened. It now becomes a past event, keeps its announcement and pictures,
  stops taking bookings, and the home page announcement expires on its own.
  Nothing is scheduled: which state an event is in is computed from its end time
  on every read.
- **Editors can add a write-up and a recording afterwards**, in an "After the
  event" section of the form. Both are accepted before the event and shown only
  after it — an event typed up weeks late is entered in one sitting.
- **Uploads are swept when nothing points at them**, as above.

Both were meeting requests. Migration `004_past_events.sql` carries them.

---

## 8. The bits that are still open here

Do not assume ADFLEX has solved these — it has not, and the answers will
probably be shared:

- **SMTP is not configured.** The contact form emails, and falls back to the
  admin dashboard when it cannot. Nobody has tested a real delivery, and the
  meeting was clear that documented instructions do not count as done. See
  `handover/EMAIL-SETUP.md` and `handover/ACCESS-NEEDED.md`.
- **Rate limits are in memory**, so per-instance, and they reset on redeploy.
  They resist one machine hammering one server, not a distributed attempt. The
  shape does not change when they move to a shared store — the same keys, read
  and written somewhere shared.
- **There is no production domain**, so no canonical link and an empty sitemap.
- **The Cookies Policy describes tracking that does not exist** — Matomo, a
  cookie banner, LinkedIn embeds. If IRESI has real legal text, use theirs.
