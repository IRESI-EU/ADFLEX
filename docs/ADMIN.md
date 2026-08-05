# The ADFLEX admin

An editor surface at `/admin` for project findings, publications, news and
events, plus a record of everything sent through the contact form.

Built 31 July 2026. Before it, every word on the site was committed to
`src/content/adflex.ts` and released by deploying. **That is still true of
almost all of it** — see *What the admin does not control* below.

---

## 1. The one thing to understand first

**The public site does not need a database.**

With no `DATABASE_URL` set, every public page still builds and renders:

| Route | With no database | With a database |
| --- | --- | --- |
| `/`, `/about`, `/design-system`, `/legal/*` | Unchanged, still prerendered | Unchanged, still prerendered |
| `/outputs` | The "not final" empty state | Published findings and publications |
| `/news` | The "nothing published" empty state | Published news and events |
| `/contact` | Form disabled, with the note saying so | Form live, submissions stored |
| `/admin/*` | A setup notice explaining what to configure | The editor surface |

This is enforced, not incidental. `npm run build` is run with no `DATABASE_URL`
as part of verifying any change here, and every public read goes through
`safeRead()` in `src/lib/db.ts`, which returns an empty list rather than
throwing if the database is missing or unreachable.

**Writes are deliberately not wrapped that way.** A save that silently fails is
worse than an error, so a failing write surfaces its message to the editor.

---

## 2. Setting it up

### 2.1 Create a database

Any Postgres will do. The two hosted options this was built against:

- **Neon** — `https://neon.tech`. Create a project, copy the **pooled**
  connection string.
- **Supabase** — `https://supabase.com`. Project settings → Database → copy the
  **connection pooler** string (port 6543).

Use the **pooled** string on both. The direct one opens a connection per
serverless instance and exhausts the limit under any real load.

### 2.2 Configure

```bash
cp .env.example .env.local
```

Fill in:

```
DATABASE_URL=postgresql://…
SESSION_SECRET=…            # at least 32 characters
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env.local` is gitignored and must stay that way — it holds a database
password. `.env.example` is committed on purpose, via a `!.env.example`
negation in `.gitignore`, because otherwise the setup instructions point at a
file that is not in the repository.

### 2.3 Create the tables and an account

```bash
npm run db:setup                              # creates the tables
npm run db:user -- ann@mu.ie "Ann McKeon"     # asks for a password
```

`db:setup` is safe to re-run: every statement in `src/lib/schema.sql` is
`IF NOT EXISTS`, and it applies them one at a time so a failure names the
statement that failed.

`db:user` asks for the password interactively rather than taking it as an
argument, so it never lands in shell history or a process list. Running it again
for an existing email **resets that person's password** — that is also the
password reset flow, because there deliberately isn't one on the web.

### 2.4 Deploying

Set `DATABASE_URL` and `SESSION_SECRET` in the host's environment settings, then
run `npm run db:setup` once against the production database from your machine.

**The site is no longer a static export.** `/admin/*`, `/outputs`, `/news`,
`/contact` and `/media/[id]` are server-rendered on demand, so the host needs to
run Node — on Netlify that means its Next.js runtime rather than a plain static
deploy. Check `docs/DEPLOYMENT-NETLIFY.md` alongside this.

---

## 3. What an editor can do

Sign in at `/admin/login`.

| Section | Contents |
| --- | --- |
| **Overview** | Counts of what is live and what is still a draft |
| **Outputs** | Project findings (with an image) and publications (with a DOI) |
| **News & Events** | Both, in one list, because they are one public route |
| **Messages** | Contact form submissions |

**Nothing is public until it is published.** Saving stores a draft; the public
page ignores it. That is the safety net that lets a half-written finding sit in
the database without appearing on a publicly funded project site.

There are two ways to publish, and they do the same thing:

- The **checkbox in the form**, which reads *Publish* while unticked and
  *Published* once ticked — the tense follows the state, so it never describes
  the entry as something it is not.
- The **Publish / Unpublish button on each row**, for changing visibility
  without opening the editor.

**Publishing, unpublishing and deleting all ask for confirmation**, naming the
entry and saying what will happen. Unpublishing is reversible and says so;
deleting is not, and says that too.

The dialogue is a native `<dialog>` opened with `showModal()`. That is worth
knowing before anyone replaces it with a div: it gives focus trapping, an inert
page behind, Escape-to-close and a real `::backdrop` without a line of code, and
none of that is reimplemented here. It replaced `window.confirm`, which worked
but could not be styled and read as a browser error.

The confirm button is `type="button"`, so it cannot submit on its own —
confirming calls `requestSubmit()` on the form. With JavaScript off the button
does nothing at all, rather than deleting something without asking. The
confirmation guards against a mis-click; it is not authorisation, which is
`requireEditor()` inside the action.

### Text is text

Body fields are plain text. Blank lines start a new paragraph, and nothing else
is interpreted — no Markdown, no HTML. This is a deliberate ceiling: editors get
paragraphs, and in exchange there is no injection surface and no half-supported
syntax leaking onto the public site. Adding rich text means a real editor and a
real sanitiser, not a `dangerouslySetInnerHTML`.

### DOIs

Paste either a bare DOI (`10.1234/abcd`) or a full `https://doi.org/…` link.
Both are normalised down to the bare identifier and stored that way, then
rendered as a doi.org link. Anything that is not a DOI is rejected rather than
stored and shown as a link that goes nowhere.

### Images

PNG, JPEG, WebP or GIF, up to 5 MB each. **Several can be attached to one
entry** — choose them all at once, then reorder or remove them individually.

**SVG is deliberately not accepted.** It can carry script, and uploads are
served back from our own origin at `/media/[id]`.

The format is checked from the file's leading bytes, not from its extension or
the `Content-Type` the browser claimed — both of which are just text a client
supplies. A `.png` containing HTML is rejected.

#### Nothing is cropped or letterboxed

The real pixel dimensions are read straight out of each file's header on upload
(`src/lib/image-size.ts` — header parsing, not decoding, so no `sharp` and no
native module to compile on a deploy target). Every image is then drawn at its
own aspect ratio.

That is what replaced the fixed 3:2 frame, which had to either crop the image —
so a chart lost its axis labels — or pad it, so a portrait photograph sat in a
wide grey field. Space is still reserved before the bytes arrive, so the page
does not shift as images load.

Rows uploaded before this existed have no stored size and fall back to the old
3:2 frame. Nothing needs migrating; they just look as they did.

#### Size, and how the layout adapts

Each entry carries an **image size** the editor picks. The content row is 1112px
at desktop width, and these are the widths that produces:

| Size | Width | Share of the row | Reads as |
| --- | --- | --- | --- |
| `small` | ~300px | 26% | A listing thumbnail — a logo, a portrait, a detail |
| `medium` | ~510px | 44% | A genuine half-and-half with the text |
| `large` | 800px | 69% | A wide lead image, with the text beneath |

Those numbers are the point, and they were wrong first time round. `small` was
200px and `medium` 320px — 18% and 29% of the row — which next to a full-width
heading and paragraph read as thumbnails rather than as part of the entry. For
comparison, an inline image in a Guardian or BBC article runs the full ~640px
text column, and a university news listing card sits around 340–400px.

The two side-by-side sizes are written as `min(px, %)` rather than a fixed
width, so the column shrinks with the page instead of holding its width until it
squeezes the text. Everything goes full width on a phone.

`large` is a wide column, **not** the whole row. It ran the full 1112px for a
while and that was too much: on a listing page where several entries follow one
another, a full-bleed image per entry is most of a screen each.

It is also **left-aligned rather than centred**, which is the part that took two
attempts to get right. An earlier version capped it at 900px and centred it; the
heading and body beneath a large image start at the left margin, so the image
sat visibly inset from its own copy on both sides. The width was never the
problem — the centring was.

**The arrangement is not configured** — it follows from the width available and
the number of images. The gallery is a CSS *container query* context, so it
measures the column it is in rather than the browser window. That matters: the
same component sits in a 200px column at `small` and across the whole page at
`large`, and a viewport media query cannot tell those apart. The first version
used one and put three images side by side inside the narrow column on a desktop
screen, at about 60px each.

Very tall images are capped by height and scaled down — never cropped — so one
portrait photograph cannot bury the text beside it.

#### Two limits, and they have to stay in step

| Limit | Where | Value |
| --- | --- | --- |
| Our own file limit | `MAX_UPLOAD_BYTES` in `src/lib/upload-limits.ts` | 5 MB |
| Next's Server Action body limit | `serverActions.bodySizeLimit` in `next.config.ts` | 6 MB |

**The framework limit must stay comfortably above the file limit.** Next defaults
to 1 MB, and at that default an editor attaching any ordinary photograph got a
runtime error page — *"Body exceeded 1 MB limit"* — because the request was
rejected before our validator ever ran. The limit applies to the raw HTTP body,
so it also carries multipart boundaries, part headers and every other field in
the form; the extra megabyte is that headroom.

Raise one, raise the other.

An oversized file is now caught twice: once in the browser as soon as it is
picked, so the editor is told immediately rather than after a long upload, and
again on the server, which is the check that counts.

---

## 4. What the admin does *not* control

Everything else. `src/content/adflex.ts` is still the single source of truth for
the hero, About, Technologies, Consortium, the Pilot, contact details, the
footer and all three legal pages. Those change by editing that file and
deploying, exactly as before, and the rules in `HANDOVER.md` about them all
still apply — particularly that the legal wording is transcribed verbatim and is
not yours to edit.

---

## 5. Security

| Layer | What it does |
| --- | --- |
| `src/proxy.ts` | Bounces visitors with no session cookie away from `/admin`. **Optimistic only** — it does not verify the signature. |
| `requireUser()` | On every admin page. Verifies the cookie's HMAC *and* re-reads the account, so deleting a user takes effect immediately. |
| `requireEditor()` | First line of **every** Server Action. |

The third one is the real boundary. Server Actions compile to POST endpoints
reachable without ever loading the page that renders the form, so a guard on the
page protects the page and nothing else. Next's own documentation is explicit
about this, and it is why the check looks duplicated and is not.

**Passwords** are scrypt (`node:crypto`, no native dependency), compared with
`timingSafeEqual`. A sign-in attempt for an address that does not exist still
runs a verification against a dummy hash, so a missing account and a wrong
password take the same time — skipping that work is how a login endpoint tells
an attacker which addresses are real.

**Sessions** are a signed, stateless cookie: `httpOnly`, `sameSite=lax`,
`secure` in production, 8 hours. Changing `SESSION_SECRET` signs everyone out
immediately, which is how you revoke every session at once.

**Login throttling** is in-memory, so it is per-instance and resets on redeploy.
It slows guessing at one server; it does not stop a distributed attempt. It is a
speed bump, not a lockout — if this ever faces more than a handful of editors,
move it to the database or to the host's rate limiting.

---

## 6. The contact form holds personal data

It collects **name, email address and message content** from members of the
public. Maynooth University is the controller named in the privacy policy.

- Deleting a message really deletes the row. That is what an erasure request
  needs, so it must not become a soft "archived" flag.
- There is no bulk export, on purpose. A CSV of enquiries is the easiest way for
  personal data to end up somewhere nobody is tracking.
- Message bodies are rendered as text, never as HTML.

**The privacy policy is still a draft** (`ADFLEX_Legal_Pages_Draft_v2.docx`).
Turning this form on made the policy *more* accurate — it already claimed the
site collects contact form data, which `OPEN-ITEMS.md` listed as a mismatch —
but a draft policy now describes live collection. That is a question for whoever
carries the liability.

---

## 7. Storage: images live in Postgres

`media.data` is a `BYTEA` column, served by `src/app/media/[id]/route.ts`.

This keeps `DATABASE_URL` the only secret the deployment needs, which is the
whole reason for it at this scale — a project site with tens of images. It is
the wrong choice past roughly a few hundred megabytes: database storage costs
more than object storage, and every backup carries the images.

The swap point is `src/lib/repo.ts`; nothing else reads `data` directly.

`/media/[id]` is **public and its ids are sequential**, so an unpublished item's
image is guessable. Do not put anything confidential through it.

---

## 8. Verifying a change here

```bash
npm run lint
npm run typecheck
npm run build          # with NO DATABASE_URL — this must pass
```

The SQL and the browser flows were both exercised for real when this was built:
16 checks over `schema.sql` and every query in `src/lib/repo.ts` against a real
Postgres engine, and 33 end-to-end browser checks covering sign-in, each content
type, upload rejection, DOI normalisation, the public pages, the contact form
and the message list. Neither harness is committed — they lived in a scratch
directory — so a future change here needs its own.

**`PGPOOL_MAX`** overrides the connection pool size (default 5) for a host with
a tighter connection limit.
