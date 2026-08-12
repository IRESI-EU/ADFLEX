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
| `/outcomes` | The "not final" empty state | Published findings and publications |
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
npm run db:user -- ann "Ann McKeon"           # asks for a password
```

`db:setup` applies any migration in `migrations/` the database has not seen
yet, in filename order, and records it in a `schema_migrations` table. Safe to
re-run: applied files are skipped. **Each file runs inside a transaction**, so a
migration that fails part-way is rolled back rather than leaving the schema in a
state no version describes.

To change the schema, add `migrations/00N_short_name.sql`. Never edit a file that
has already been applied anywhere — the ledger records filenames, so an edited
file will not run again.

`db:user` asks for the password interactively rather than taking it as an
argument, so it never lands in shell history or a process list. Running it again
for an existing username **resets that person's password** — that is also the
password reset flow, because there deliberately isn't one on the web.

### 2.4 Deploying

Set `DATABASE_URL` and `SESSION_SECRET` in the host's environment settings, then
run `npm run db:setup` once against the production database from your machine.

**The site is no longer a static export.** `/admin/*`, `/outcomes`, `/news`,
`/contact` and `/media/[id]` are server-rendered on demand, so the host needs to
run Node — on Netlify that means its Next.js runtime rather than a plain static
deploy. Check `docs/DEPLOYMENT-NETLIFY.md` alongside this.

---

## 3. What an editor can do

Sign in at `/admin/login`.

| Section | Contents |
| --- | --- |
| **Overview** | Counts of what is live and what is still a draft |
| **Outcomes** | Project findings (with images) and publications (with a link) |
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

### When a save is refused

A failed save **keeps everything else you typed**. The action hands the
submitted text back with the response, so a mistyped DOI no longer costs an
editor the body they had just written.

The one field that caused the problem comes back **empty**, marked
`aria-invalid`, with its message directly underneath it rather than only in a
banner at the top of the form. That is deliberate: the message says what was
wrong with *that* field, and clearing it makes the thing to retype obvious.

**Chosen files are the exception and cannot be restored.** No browser lets a
page set the value of a file input — that would let a site read arbitrary files
off your disk — so images have to be chosen again after a refused save. Nothing
that was already attached to the entry is lost.

### Date posted

**There is no date field.** An entry's posting date is stamped by the database
when it is first saved, and editing it later does not move it, so an entry
cannot drift to the top of the list because someone fixed a typo in it three
weeks on.

An **event date** is a different thing and is still a field: it is when the
event happens, which only the editor knows. It is required for an event and
ignored for a news post.

### Events

An entry is one of three types, chosen at the top of the form:

| Type | Shows | Extra fields |
| --- | --- | --- |
| **News** | Under *News*, dated when it was posted | — |
| **Upcoming event** | Under *Events*, at the top, and announced on the home page with a countdown | Date, start **and end time** (both required), location, booking link, *no places left* |
| **Event (already held)** | Under *Events*, below the upcoming ones, as a record | Date, start and end time (both optional), location |

**The type is fixed once an entry is saved.** Editing shows it as text rather
than a menu: changing it would silently discard the fields the other types do
not have. Delete and re-add if it really was the wrong type.

**Upcoming events always come first** in the Events list, soonest first;
events already held follow, most recent first. That is not a setting — "what is
happening next" and "what has happened" want opposite orders, and sorting the
whole list one way makes one half read backwards.

**Times are on a 24-hour clock, with no timezone**: an event at 14:30 is at
14:30 where it happens. An event cannot run past midnight — the end time belongs
to the same day as the start, and one that appears to finish earlier than it
begins is refused rather than accepted and treated as already over.

**An upcoming event needs both times.** The start is what the home-page
countdown runs to. The end is when it becomes a past event — see below. An event
already held needs neither: it is a record of something that happened, and the
project has events going back before anyone was writing the hour down.

### An upcoming event becomes a past event when it finishes

At its end time, an upcoming event moves by itself from the top of the page down
to the events already held. **It stays on the page.** It keeps its
announcement, its date, its location and its pictures; it stops offering a
booking link; and it is labelled *Past event* instead of *Upcoming*.

Nothing has to be changed by hand, and there is no window where the site is
advertising something that is over.

> **This changed on 12 August 2026.** Until then the entry disappeared from the
> public page entirely. It was never deleted — it sat in the admin marked
> *Expired* — but for a visitor the week after, there was no evidence the event
> had ever happened. The review meeting asked for the opposite, and the
> announcement, the poster and the date are exactly what makes a past event
> worth keeping.

The **home page announcement does still expire**, which is the part that should:
it exists to get somebody to book, and a countdown to something finished is
just wrong. The entry it was announcing stays on News & Events.

Three things follow:

- It happens **on the clock, not on the next deploy**. The public page is built
  per request, so an event that ended a minute ago has already moved.
- It uses **Irish time**, not the server's. The database runs in UTC and would
  otherwise hold an event open an extra hour every summer.
- **Nothing is stored and nothing is scheduled.** Which state an event is in is
  worked out from its end time every time the page is read, so it is never out
  of date and there is no job that can fail to run.

You do not need to switch the entry to *Event (already held)* afterwards — it is
already being shown as a past event. That type is for an event you are adding
to the site after the fact, one the website never announced.

### Adding photos and a write-up afterwards

Open the event and look for **After the event** at the bottom of the form.

| Field | What it is for |
| --- | --- |
| **How it went** | What took place, who attended, what came out of it |
| **Video or recording** | A YouTube link, or any other page with the recording |
| *(the pictures above)* | Photographs from the day — add as many as you like |

Two things worth knowing:

- **They stay hidden until the event is over**, so you can write them whenever
  you like — including before the event, which is what usually happens when you
  are adding an event that was held last year and typing it all in one sitting.
- **There is no rush.** Photographs often arrive several days after the event.
  The original announcement stays on the page in the meantime, so a visitor
  always sees something.

### Arranging entries

The page order is fixed: **upcoming events, then events already held, then
news**. There was briefly a switch for putting News above Events; it was removed
on 9 August 2026, because the thing worth arranging turned out to be the entries
themselves.

Every entry has an **Order** field — the same one findings and publications
already have. Lower numbers first, everything at 0 by default, so an untouched
site is entirely date-ordered and stays that way. Set one entry to `-1` to pin it
above the rest of its list.

**It arranges entries within their own list, never between lists.** A news post
numbered `-999` goes to the top of *News*; it does not climb above the Events
section, and it does not overtake an upcoming event. Group first, then your
number, then the date:

| | Order within the group |
| --- | --- |
| Upcoming events | soonest first |
| Events already held | most recent first |
| News | most recently posted first |

Set orders show in the entries list as `· order -1`, so you can see the
arrangement without opening each entry. Entries left at 0 say nothing.

**A booking link belongs to an upcoming event only.** An event that has already
been held has nothing to book, so the field is not offered for it. The link
becomes a *Book your place* button on the News & Events page and in the home-page
announcement. It is checked for `http://` or `https://` so a typo cannot become
a button that goes nowhere.

**The date has the final word.** An upcoming event whose date has passed stops
offering its booking link on its own, with nobody editing anything.

### When an event is full

Tick **no places left** in the form, or use the **Mark full** button on the row,
which is quicker and reversible in one click. Then:

- The News & Events page says *Fully booked* in place of the booking button.
- **The home page stops announcing it.** The announcement exists to get someone
  to book; interrupting a reader to tell them a thing is full is an
  advertisement for a disappointment. If another upcoming event still has
  places, that one is announced instead.

The event is not hidden — it stays on News & Events, marked full, for anyone who
wants to know it is happening.

### Text is text

Body fields are plain text. Blank lines start a new paragraph, and nothing else
is interpreted — no Markdown, no HTML. This is a deliberate ceiling: editors get
paragraphs, and in exchange there is no injection surface and no half-supported
syntax leaking onto the public site. Adding rich text means a real editor and a
real sanitiser, not a `dangerouslySetInnerHTML`.

### Links and DOIs

A publication has a **Link** and a **DOI**, and **neither is required**. A paper
can be listed before it is online, and plenty of outputs — a report, a
deliverable, a dataset, a conference talk — have a web address and no DOI at
all.

**Link** is the ordinary way to reach the publication: a publisher page, a
repository copy or a PDF. It must start with `http://` or `https://`, and it is
shown to readers as *Read the paper*.

**DOI** is optional and secondary. Paste either a bare DOI (`10.1234/abcd`) or a
full `https://doi.org/…` link — both are normalised down to the bare identifier
and stored that way, then rendered as a short `DOI: 10.1234/abcd` link. Anything
that is not a DOI is rejected rather than stored and shown as a link that goes
nowhere.

This order was reversed on 6 August 2026. The DOI used to lead, with the URL
offered only as a fallback "when there is no DOI", and the public page printed
the whole doi.org URL as its own link text.

### Images

PNG, JPEG, WebP or GIF, up to 5 MB each. **Several can be attached to one
entry** — choose them all at once, then reorder or remove them individually.

**SVG is deliberately not accepted.** It can carry script, and uploads are
served back from our own origin at `/media/[id]`.

The format is checked from the file's leading bytes, not from its extension or
the `Content-Type` the browser claimed — both of which are just text a client
supplies. A `.png` containing HTML is rejected.

#### Uploads are resized and stripped before they are stored

Anything wider than 1600 pixels is scaled down to it, and the file is
re-encoded in the same format. Two reasons, both raised in the external review:
a 5 MB photograph was previously downloaded by every visitor at 5 MB even in a
small box, and a photograph off a phone carries EXIF — including **GPS
coordinates** and the device. Re-encoding removes all of it. Animated GIFs are
left untouched, because re-encoding one would flatten it to a single frame.

You do not have to resize anything yourself. The 5 MB limit is still there, but
it is a limit on what you can send, not on what gets stored.

#### Draft images are private

An image is only reachable at its public `/media/[id]` address once it is
attached to something **published**. Before that, only a signed-in editor can
open it.

Two things follow, and they are the point:

- A draft's photographs are not visible to anyone who guesses the number.
- **Deleting or unpublishing an entry takes its images offline in the same
  moment.** There is nothing to remember to tidy up, and a picture you retract
  is genuinely retracted.

The same rule covers documents at `/files/[id]`.

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

**The editor no longer chooses a size.** Every entry is saved as `medium` —
images beside the text at about half the page width — at the client's request on
6 August 2026. The column, the three-way `ImageSize` type and the rendering for
all three values stay, because rows saved before that date may hold `small` or
`large` and still render correctly; only the choice has gone. Putting it back
means restoring the select in `ImagesField` and reading it again in
`saveFinding`/`saveNewsItem` instead of the `IMAGE_SIZE` constant.

The content row is 1112px at desktop width, and these are the widths the three
values produce:

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

**The arrangement is not configured** — it follows from the number of images and
the width available.

`columnsFor()` in `src/components/Gallery.tsx` picks how many go across, chosen
so a gallery never ends with one stranded image:

| Images | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Rows | 1 | 2 | 3 | 2+2 | 3+2 | 3+3 | 4+3 | 4+4 | 3+3+3 | 4 across |

A **shorter last row is centred**, which is why the gallery is flexbox rather
than grid — CSS grid has no way to centre a partial final row. `flex-grow` is
off for the same reason: with it on, the last row's images stretch to fill the
width and end up larger than every row above them.

That count is then **capped by how wide the column actually is**, using CSS
container queries — the gallery measures the column it sits in, not the browser
window. That distinction matters: the same component sits in a 300px column at
`small` and an 800px block at `large`, and a viewport media query cannot tell
those apart. The first version used one and put three images side by side inside
the narrow column on a desktop screen, at about 60px each. Everything stacks on
a phone.

#### Expanding an image

Every image carries a small expand control and opens full size in a viewer, with
previous/next, arrow-key navigation, a counter, and the description as a caption.

The control is a **link to the image file**, not a button. With JavaScript
unavailable it still opens the full-size image rather than doing nothing; the
click handler takes over when JavaScript is there. Modified clicks are left
alone, so "open in new tab" still works.

The viewer is a native `<dialog>` opened with `showModal()` — focus trapping, an
inert page behind, Escape-to-close and a real backdrop, none of it reimplemented.
Closing returns focus to the thumbnail that opened it, whether it was closed by
the button, the backdrop or Escape; **all three paths go through `onClose`** for
exactly that reason, because Escape does not pass through a click handler.

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

### Where a submission goes

**It is emailed to the project.** It is written to the Messages page in the
admin **only when that email could not be sent** — so that page is a failure
queue, not an archive: anything on it did not reach the mailbox and still needs
answering.

### Signing in

**The admin uses a username and a password. Not an email address.**

Nothing is ever sent to the account: there is no password reset by email, no
notification and no verification. An address there would have looked like a
promise the site does not keep, and it would have tangled the login up with the
project's real mailbox — change one and you would have changed the other.

Add or change an account:

```
npm run db:user -- <username> "<full name>"
```

A username is 3 to 64 characters: letters, digits, dot, underscore or hyphen. It
is compared without case, so `ADFLEX` and `adflex` are the same account.

The command asks for a password, creates the account if it is new, and **signs
out every existing session for that account** if it is not. That is also the
password reset, because there deliberately is not one on the web.

Accounts live in the database, not in a file — a password belongs with its hash,
and neither belongs in source control.

### Changing where contact messages go

Two settings, both in `src/lib/site.ts`, and each does exactly one job:

| Setting | What it is |
| --- | --- |
| `CONTACT_EMAIL` | **Where messages are delivered.** The project address, and the one published on the contact page. |
| `MAIL_SENDER` | **The mailbox the site signs into to send them**, plus its server and port. Appears as the `From:` address. |

**`CONTACT_EMAIL` is used for nothing else.** Not the login, not the sender. It
stood in for all three at one point, which made changing where enquiries go
silently change who could sign in.

`MAIL_SENDER.address` has to be filled in even when it is the same address as
`CONTACT_EMAIL`. There is no "leave it blank and it defaults" shortcut, on
purpose — a default is how one value quietly starts doing two jobs again.

The `From:` header follows `MAIL_SENDER.address` because a message has to be
sent as an address its mailbox is authorised to send as. That is what SPF and
DMARC check, and getting it wrong is how mail is silently dropped or filed as
spam. The visitor goes in `Reply-To`, so replying answers them directly.

### What still lives in the environment

**`SMTP_PASSWORD`, and nothing else.** The addresses, the mail server host and
the port all sit in `src/lib/site.ts`; only the password is in `.env.local`,
because that file is gitignored and a credential in a source file is a credential
in the git history for good.

Gmail and Microsoft 365 both reject the ordinary account password over SMTP — it
has to be an app password, or an account with SMTP AUTH switched on.

**With the mail server or the password unset, every message falls back to the
dashboard**, which is exactly how the site behaved before email existed. Nothing
breaks and nothing is lost; it just needs someone to check the dashboard. The
Messages page says which of the two states it is in.

Three details worth knowing:

- **The email comes from the project, not the sender.** The visitor's address
  goes in `Reply-To`, so replying in any mail client answers them. Sending *as*
  the visitor would fail SPF and DMARC and the message would be dropped.
- **It is plain text**, like everything else editors touch on this site, so
  there is no HTML to escape on the one endpoint an anonymous visitor can reach.
- **Newlines are stripped** from the name and subject before they reach a mail
  header. That is the header-injection defence; it is what stops a form like this
  being used to send mail to addresses nobody at ADFLEX chose.

**A message that is emailed successfully is not stored on the site at all.**
That is deliberate — fewer copies of personal data, which is what GDPR asks for —
but it does mean the mailbox is the only record, and deleting it there deletes
it entirely.

### Handling requests

- Deleting a message really deletes the row. That is what an erasure request
  needs, so it must not become a soft "archived" flag.
- An erasure request now has to cover **the mailbox too**, not just this page.
  Most enquiries will only ever exist as email.
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

**Ids are sequential, so the route checks permission rather than relying on the
id being unguessable.** An image is served only if it is attached to something
published, or the requester is signed in; anything else gets a 404, not a 403,
because "forbidden" would confirm that something exists at that id. Cache
headers follow the permission — public and immutable when published, `private,
no-store` when it is visible only because an editor is signed in, so it cannot
be left in a shared cache for the next person.

**Uploads are swept when nothing points at them.** Deleting an entry used to
leave its images in the table for ever: the join rows cascaded but the `media`
row, carrying the whole file, did not. `deleteOrphanedUploads` in
`src/lib/repo.ts` now runs after every delete and after any edit that detaches
something. It removes only what **nothing at all** refers to, so an image used
by two entries survives losing one of them.

That is safe because an upload cannot exist before it is attached — there is no
media-library page, and `createMedia` is called mid-save inside the same
transaction that attaches the row. **If a library is ever added**, so that an
editor can upload a picture in advance, this sweep would delete their work
before they used it. It would then need a grace period on `created_at`, or a
flag separating "not attached yet" from "no longer attached".

---

## 8. Verifying a change here

```bash
npm run lint
npm run typecheck
npm run build          # with NO DATABASE_URL — this must pass
```

The SQL and the browser flows were both exercised for real when this was built:
16 checks over the schema and every query in `src/lib/repo.ts` against a real
Postgres engine, and 33 end-to-end browser checks covering sign-in, each content
type, upload rejection, DOI normalisation, the public pages, the contact form
and the message list. Neither harness is committed — they lived in a scratch
directory — so a future change here needs its own.

**`PGPOOL_MAX`** overrides the connection pool size (default 5) for a host with
a tighter connection limit.
