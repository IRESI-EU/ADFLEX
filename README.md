# ADFLEX Project Website

The public website for **ADFLEX — Advanced Demonstrators for Flexibility and Local Energy
Exchange in Sustainable Energy Communities**, plus a small design-system page that documents
how the site is built.

The site is a Next.js 16 App Router application with no UI framework and no component
library — CSS Modules over a single token file. Alongside the public pages it carries a
small editor admin at `/admin`, backed by PostgreSQL, through which the project team
publishes findings, publications, news and events, and reads contact-form messages.

**The public site does not need the database.** With `DATABASE_URL` unset every public
page still builds and renders: the database-backed lists show their empty states and the
contact form is hidden. Only `/admin` requires it.

## Routes

| Route                | What it is                                                       | Status |
| -------------------- | ---------------------------------------------------------------- | ------ |
| `/`                  | The ADFLEX public website — one scrolling page of sections        | Live |
| `/about`             | The full About ADFLEX content                                     | Live |
| `/outcomes`          | Project Outcomes — findings and publications from the database    | Live (awaiting content) |
| `/contact`           | Contact details and a working contact form                        | Live |
| `/news`              | News & Events — one route since 30 July 2026, merged from two     | Live (awaiting content) |
| `/legal/privacy`     | Privacy Policy                                                    | Live (draft text) |
| `/legal/cookies`     | Cookies Policy                                                    | Live (draft text) |
| `/legal/terms`       | Terms of Use                                                      | Live (draft text) |
| `/design-system`     | Documentation of the tokens, components and rules used by the site | Live (`noindex`) |
| `/admin`             | Editor admin — findings, publications, news, events, messages     | Live (sign-in required) |
| `/admin/login`       | Sign-in for the admin                                             | Live |
| `/media/[id]`        | Serves an uploaded image out of the database                      | Live |

**"Awaiting content" means the route, layout and components exist and are
reviewable, but nothing has been published through the admin yet** — the page says so
plainly instead of showing sample entries. See
[docs/OPEN-ITEMS.md](docs/OPEN-ITEMS.md).

`/robots.txt` and `/sitemap.xml` are generated from
[src/app/robots.ts](src/app/robots.ts) and [src/app/sitemap.ts](src/app/sitemap.ts). The
sitemap is empty until `NEXT_PUBLIC_SITE_URL` is set — see **Environment** below.

## Requirements

- Node.js 20.9 or newer (Next.js 16 minimum)
- npm
- PostgreSQL 14 or newer — **only for `/admin`**. Skip it to work on the public site.

## Environment

Copy [.env.example](.env.example) to `.env.local` and fill it in. That file documents
each variable in full; in short:

| Variable               | Needed for                    | Unset means |
| ---------------------- | ----------------------------- | ----------- |
| `DATABASE_URL`         | `/admin` and published content | Public pages render their empty states; the contact form is hidden |
| `SESSION_SECRET`       | Signing the admin session cookie | `/admin` shows the login page and cannot sign anyone in |
| `NEXT_PUBLIC_SITE_URL` | Canonical links, Open Graph URLs, the sitemap | No canonical tag, no Open Graph URL, an empty sitemap. Nothing else changes |

`NEXT_PUBLIC_SITE_URL` is deliberately unset: no production domain has been supplied,
and a canonical link pointing at a guessed host is worse than none at all. Set it at
launch.

## Installation

```bash
npm install
```

Use `npm ci` in CI or on a clean checkout, so the lockfile is honoured exactly.

## Commands

```bash
npm run dev        # development server on http://localhost:3000
npm run lint       # ESLint (eslint-config-next)
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run start      # serve the production build
npm run check      # lint + typecheck + build

npm run db:setup   # create the tables — safe to re-run, see docs/ADMIN.md
npm run db:user    # create or update an admin user, prompting for the password
```

The two `db:` commands read `DATABASE_URL` from `.env.local` and are only needed for
`/admin`.

## Folder structure

```
public/
  images/adflex/
    adflex-logo.png              official logo (production copy)
    adflex-system-concept.png    supplied 3D system diagram (production copy)
src/
  app/
    layout.tsx                   root layout, .adflex-scope wrapper, skip link, site metadata
    globals.css                  minimal reset + shared .adflex-* utility classes
    page.tsx                     the public website (/)
    home.module.css              home page layout grids
    not-found.tsx                the 404 page, in the same shell as every other route
    robots.ts                    generates /robots.txt
    sitemap.ts                   generates /sitemap.xml
    about/
      page.tsx                   About ADFLEX (/about)
      about.module.css
    outcomes/
      page.tsx                   Project Outcomes (/outcomes)
      outcomes.module.css
    contact/
      page.tsx                   the contact page (/contact)
      contact.module.css
    news/page.tsx                News & Events (/news)
    legal/[slug]/page.tsx        privacy, cookies and terms — one route for all three
    design-system/
      page.tsx                   the design-system page (/design-system)
      design-system.module.css
    media/[id]/route.ts          serves an uploaded image out of the database
    admin/                       the editor admin — see docs/ADMIN.md
      layout.tsx                 the admin shell and its section tabs
      AdminTabs.tsx              the tabs, client-side only so they know the current page
      actions.ts                 every Server Action, each guarded by requireEditor()
      forms.tsx                  the editor forms
      ConfirmSubmit.tsx          a submit button that opens a real <dialog> first
      admin.module.css
      login/ outcomes/ news/ messages/
  components/                    the production components (one CSS module each)
  content/
    adflex.ts                    all ADFLEX project copy — single source of truth
    design-system.ts             explanatory copy for the design-system page
  lib/
    auth.ts                      password hashing, the signed session cookie, login throttling
    db.ts                        the Postgres pool and the read-with-fallback helper
    repo.ts                      every SQL query, and the types the pages read
    mail.ts                      sending the contact form by SMTP
    site.ts                      the configured site URL, and the canonical-link helper
    image-size.ts                reads pixel dimensions out of an upload's header bytes
    upload.ts, upload-limits.ts  upload validation and the size ceilings
migrations/                      numbered SQL files, applied once each and recorded
  proxy.ts                       what Middleware was called before Next 16 — an optimistic
                                 /admin redirect, NOT the security boundary
  styles/
    adflex-tokens.css            all design tokens, scoped to .adflex-scope
scripts/
  db-setup.mjs                   npm run db:setup
  db-user.mjs                    npm run db:user
  load-env.mjs                   reads .env.local for the two scripts above
docs/
  HANDOVER.md                    architecture and how to extend it safely
  ADMIN.md                       running, seeding and operating the admin
  OPEN-ITEMS.md                  what has not been supplied or decided yet
  CONTENT-SOURCE.md              where every fact on the site came from
  DEPLOYMENT-NETLIFY.md          the team-review deployment
.env.example                     every environment variable, documented
project-inputs/                  supplied source material — git-ignored, never loaded at runtime
```

## How to update content

Content comes from two places, and they do not overlap:

- **The site's own copy** — headings, section text, contact details, the legal pages, the
  navigation — lives in [`src/content/adflex.ts`](src/content/adflex.ts). Components receive it
  through props and contain no project paragraphs of their own. Editing that one file changes
  the site, and it needs a commit and a deploy.
- **Published entries** — findings, publications, news items and events, with their images —
  are created by an editor at `/admin` and stored in the database. They need no code change.
  See [docs/ADMIN.md](docs/ADMIN.md).

Everything below this heading is about the first kind.

**Do not add ADFLEX facts, statistics, partner details, publications or funding claims that
have not been supplied and approved.** See [docs/CONTENT-SOURCE.md](docs/CONTENT-SOURCE.md).

### Replace the contact details

Edit the `contact` object in `src/content/adflex.ts`:

```ts
contact: {
  title: "Contact",
  intro: "For questions about ADFLEX, please get in touch.",
  pageDescription: "Contact details for the ADFLEX project at Maynooth University.",
  email: "info@iresi.eu",
  organisation: "Maynooth University",
  addressLines: ["Maynooth, Co. Kildare", "Ireland"],
},
```

The `/contact` page and the "nothing published yet" pages all read from here — there is nothing
else to change. The footer no longer shows contact details; it carries identity, the legal links
and LinkedIn only.

### Add a technology

Append one item to `technologies.items`:

```ts
{
  id: "unique-slug",
  name: "Technology name",
  description: "Description from approved source material.",
  image: {                                        // optional
    src: "/images/technologies/unique-slug.png",
    alt: "",                                      // see below
    width: 1672,                                  // the file's real pixel size
    height: 941,                                  // — not read from the file
  },
}
```

The card, its number and the responsive grid follow automatically. `image` is optional, so a
technology can be added before its artwork exists — the card simply renders without one.

Notes on technology images:

- 16:9 works best; the card reserves a 16:9 frame and uses `object-fit: cover`, so another
  ratio will be cropped rather than distorted.
- Keep them around 1400px wide. The card never renders wider than about 560 CSS px, so anything
  larger is wasted bytes. Re-encode to JPEG — the supplied PNGs were ~2 MB each.
- `alt` is empty because these illustrate a concept the card's own heading and description
  already state in full. If a future image carries information that is **not** in the text, give
  it real alt text instead.

### Add a partner

Append one item to `consortium.partners`:

```ts
{ id: "unique-slug", name: "Organisation name", initials: "XX" }
```

`initials` are a decorative placeholder shown while no official logo is available — they are not
a logo. Partner roles, descriptions, URLs and countries must not be invented.

### Add or replace a partner logo

All three current partners have logos. `PartnerCard` renders a logo when one is present and
falls back to the initials when it is not, so a new partner can be added before its artwork
arrives. Put the supplied file in `public/images/partners/` and add a `logo` to that partner:

```ts
{
  id: "unique-slug",
  name: "Organisation name",
  initials: "XX",
  logo: {
    src: "/images/partners/organisation-name.png",
    alt: "",       // empty on purpose — the name is already rendered as text
    width: 1200,   // the file's intrinsic pixel size, so the ratio is preserved
    height: 400,
  },
}
```

Notes:

- Trim any blank canvas around the mark before adding the file. Logos arrive with wildly
  different amounts of built-in margin, which makes them render at inconsistent visual sizes in
  the same row.
- `width`/`height` must be the file's real pixel size — the card fits the logo into a shared
  200 × 64 box with `object-fit: contain`, so every lockup keeps its own aspect ratio.
- Supply the largest version you can. The image optimizer caps its output at the source width,
  so the source resolution is the ceiling on how sharp a logo can look on a high-DPI screen.

Use only files supplied by the partner or the project coordinator. Never take a partner logo
from a web search or a logo aggregator site — see [docs/OPEN-ITEMS.md](docs/OPEN-ITEMS.md) for
each partner's rules.

### Edit the About content

`/about` shows every item in `about.items` in full. The home page shows a glimpse of **one** of
them and links through.

Each item has two text fields:

- `summary` — the glimpse.
- `body` — the full paragraph shown on `/about`.

**`summary` must stay a verbatim prefix of `body`.** Shorten by cutting, never by rewriting.
That keeps the home page and the About page from drifting apart and stops unapproved wording
creeping in. Watch the punctuation at the cut — ending a glimpse with a full stop where the
source has a comma already breaks it. To confirm, check that each `body` starts with its own
`summary`.

What the home page shows is controlled by `about.home`:

```ts
home: { heading: "Objective of ADFLEX", itemId: "objective" },
```

- `heading` — the section heading on the home page. It is deliberately separate from
  `about.title` ("About ADFLEX"), which heads the `/about` page.
- `itemId` — which item to glimpse. Point it at a different item and the home page follows; no
  code changes. Every item keeps a `summary` so this stays a one-word change.

The item's own title is not rendered on the home page, because the section heading already names
it.

### Add a pilot asset

Append one item to `pilot.assets`. Only list assets and programmes that the supplied pilot
description actually names:

```ts
{
  id: "unique-slug",
  label: "Asset name",
  icon: {                                   // optional
    src: "/images/pilot-icons/unique-slug.png",
    alt: "",                                // the label sits beside it
    width: 160,
    height: 120,
  },
}
```

Icons sit in a fixed 56px dark tile with `object-fit: contain`, so each keeps its own aspect
ratio. Trim transparent canvas and scale the longest side to about 160px before adding a new one
— untrimmed icons render at visibly different sizes in the same list.

### Update Project Outcomes

The content object is still keyed `results` in `src/content/adflex.ts`, but it is displayed as
"Project Outcomes" (page heading) and "Outcomes" (navigation). Its `body` is supplied copy and
still reads "Results and publications from ADFLEX…" — left verbatim on purpose.


The findings and publications themselves are **not** in the content file — they are
published through `/admin` and read from the database. `/outcomes` renders whatever is
published and falls back to an `EmptyState` when nothing is, which is what it shows today.
The surrounding page copy (`results.title`, `results.body`) does live in the content file.

Do not add placeholder publications, dates or DOIs to either place.

The hero's "See Pilot Results" call to action points at this page — its target is
`hero.cta.href` in the content file.

### Add or change a navigation item

Navigation is centrally controlled by the `navigation` array in `src/content/adflex.ts`. Each
entry declares what kind of destination it is:

```ts
{ id: "technologies",  label: "Technologies",           kind: "section", href: "#technologies" }
{ id: "publications",  label: "Outcomes",                kind: "route",   href: "/outcomes" }
```

- `kind: "section"` — an anchor on the home page. Its `id` must match the `id` given to that
  section in `src/app/page.tsx`, and its position in the array must match the visible order of
  the sections.
- `kind: "route"` — a page of its own.

Pages call `resolveNavigation(navigation, { onHome })` and pass the result to the header. That
prefixes section anchors with `/` on every route other than `/`, so the same array drives the
navigation everywhere without each page knowing the rules. The footer does not repeat these
links — see [HANDOVER.md](docs/HANDOVER.md).

## Official assets

| Asset          | Production path                                  |
| -------------- | ------------------------------------------------ |
| Logo           | `public/images/adflex/adflex-logo.png`           |
| System diagram | `public/images/adflex/adflex-system-concept.png` |
| Partner logos  | `public/images/partners/`                        |
| Technology images | `public/images/technologies/`                 |
| Pilot image    | `public/images/pilot/`                           |
| Pilot asset icons | `public/images/pilot-icons/`                  |

Both are copies of files supplied in `project-inputs/`. The originals are git-ignored and are
never referenced at runtime.

The logo is a raster PNG with an opaque white background. It must keep its aspect ratio, keep
all of its parts visible, and sit on a white or very light surface. The full rules — and the
things that must not be done to it — are on `/design-system` under **Logo & Imagery**.

## Design tokens

All tokens live in [`src/styles/adflex-tokens.css`](src/styles/adflex-tokens.css) and are
declared on the `.adflex-scope` class, not on `:root`, so the ADFLEX brand cannot leak into
anything else later hosted in the same application. The root layout wraps every route in that
class.

**The palette is white, mild grey and the green from the logo.** `#08867a` is the dominant
colour of the supplied logo file, sampled from the file itself rather than picked by eye;
`--adflex-color-primary` is a darkened version of it, because the raw logo green only reaches
4.47:1 on white and interactive text needs 4.5:1.

**One set of semantic token names, two things that rebind them** — the emphasis band
(`.adflex-band`) and the forced-light island (`.adflex-light`). Nothing else should. One
component therefore serves both with no conditional styling:

```css
/* This card is correct in every band. Nothing else is needed. */
.card {
  background: var(--adflex-color-surface);
  border: 1px solid var(--adflex-color-border);
}
```

Style components with the semantic `--adflex-color-*` tokens, never a literal colour. The
exceptions — grounds that must stay fixed because the artwork on them is fixed — use the
`--adflex-plate-*` values. See [docs/HANDOVER.md](docs/HANDOVER.md) for the full rules.

Typography is **Sora** for headings and **Inter** for body, self-hosted by `next/font` at build
time — no external requests and no CDN.

Source values are kept separate from the semantic tokens that bind to them — `--adflex-l-*` is
the fixed palette, `--adflex-color-*` is what components use. That is what lets a whole palette
be rebound in one block. `.adflex-light` uses it to pin the light values on the partner cards,
whose logos cannot sit on a dark colour; because it points at the fixed values rather than the
semantic ones, no enclosing band can reach into it.

The site is **light-only**. A dark mode has been built and removed twice at the client's
request — see [docs/HANDOVER.md](docs/HANDOVER.md) before building a third one.

Components use the token variables rather than repeating literal colours and spacing. There is
no token generator, JSON pipeline or separate token package — this one CSS file is the source
of truth.

## How the design-system page works

`/design-system` imports the same production components (`TechnologyCard`, `PartnerCard`,
`EmptyState`, `ContactBlock`, `AdflexHeader`, `AdflexFooter`) and the same CSS classes
(`.adflex-cta`, `.adflex-link`, `.adflex-tag`) that `/` uses, and renders them with real ADFLEX
content. Nothing is duplicated for documentation, so the documentation cannot drift from the
implementation.

Page-level layout patterns (the container, `SectionShell`, the hero structure, the sticky
header) are described in words rather than re-rendered inside the documentation column, because
reproducing them out of context would mean building a second copy of the production layout.

## Deliberately out of scope

WordPress or any third-party CMS, newsletter integration, analytics, a cookie banner,
multilingual support, site search, dark mode, Storybook, a token generator, a separate
design-system application, a UI component library, an external icon package, an animation
library, video, social embeds, external stock imagery and Docker.

None of these were requested. See [docs/OPEN-ITEMS.md](docs/OPEN-ITEMS.md) for what is still
undecided.

**This list shrank on 5 August 2026.** A database, authentication, an admin area,
contact-form processing and a news and events system were all on it, and were all
subsequently requested and built — see [docs/ADMIN.md](docs/ADMIN.md). Nothing on the list
above has been built; if you are adding something that is on it, that is a scope change and
belongs in a conversation before a commit.

**There is motion, but no animation dependency.** The scroll reveals, the hero network and the
hover states are CSS plus one `IntersectionObserver` — no Framer Motion, no GSAP, nothing added to
`package.json`. Everything sits behind `prefers-reduced-motion` and behind a JavaScript check, so
the site degrades to a normal static page rather than a blank one. See the *Motion and figures*
section of [docs/HANDOVER.md](docs/HANDOVER.md).
