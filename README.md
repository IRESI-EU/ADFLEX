# ADFLEX Project Website

The public website for **ADFLEX — Advanced Demonstrators for Flexibility and Local Energy
Exchange in Sustainable Energy Communities**, plus a small design-system page that documents
how the site is built.

This is a deliberately small first release: a static marketing site and its design
documentation. There is no CMS, no backend and no database.

## Routes

| Route             | What it is                                                        |
| ----------------- | ----------------------------------------------------------------- |
| `/`               | The ADFLEX public website — one scrolling page                     |
| `/design-system`  | Documentation of the tokens, components and rules used by `/`      |

## Requirements

- Node.js 20.9 or newer (Next.js 16 minimum)
- npm

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
```

## Folder structure

```
public/
  images/adflex/
    adflex-logo.png              official logo (production copy)
    adflex-system-concept.png    supplied 3D system diagram (production copy)
src/
  app/
    layout.tsx                   root layout, .adflex-scope wrapper, skip link
    globals.css                  minimal reset + shared .adflex-* utility classes
    page.tsx                     the public website (/)
    home.module.css              home page layout grids
    design-system/
      page.tsx                   the design-system page (/design-system)
      design-system.module.css
  components/                    the nine production components (one CSS module each)
  content/
    adflex.ts                    all ADFLEX project copy — single source of truth
    design-system.ts             explanatory copy for the design-system page
  styles/
    adflex-tokens.css            all design tokens, scoped to .adflex-scope
docs/
  HANDOVER.md                    architecture and how to extend it safely
  OPEN-ITEMS.md                  what has not been supplied or decided yet
  CONTENT-SOURCE.md              where every fact on the site came from
project-inputs/                  supplied source material — git-ignored, never loaded at runtime
```

## How to update content

All ADFLEX project copy lives in [`src/content/adflex.ts`](src/content/adflex.ts). Components
receive it through props and contain no project paragraphs of their own. Editing that one file
changes the site.

**Do not add ADFLEX facts, statistics, partner details, publications or funding claims that
have not been supplied and approved.** See [docs/CONTENT-SOURCE.md](docs/CONTENT-SOURCE.md).

### Replace the contact details

Edit the `contact` object in `src/content/adflex.ts`:

```ts
contact: {
  title: "Contact",
  intro: "For questions about ADFLEX, please get in touch.",
  email: "info@iresi.eu",
  organisation: "Maynooth University",
  addressLines: ["Maynooth, Co. Kildare", "Ireland"],
},
```

The contact section and the footer email both read from here — there is nothing else to change.

### Add a technology

Append one item to `technologies.items`:

```ts
{
  id: "unique-slug",
  name: "Technology name",
  description: "Description from approved source material.",
}
```

The card, its number and the responsive grid follow automatically.

### Add a partner

Append one item to `consortium.partners`:

```ts
{ id: "unique-slug", name: "Organisation name", initials: "XX" }
```

`initials` are a decorative placeholder, not an official logo. Partner roles, descriptions,
logos, URLs and countries must not be invented — see
[docs/OPEN-ITEMS.md](docs/OPEN-ITEMS.md).

### Update the results section

Today `results` renders an intentional `EmptyState`, because findings are not final. When real
publications exist, replace the empty state in `src/app/page.tsx` with a list rendered from a
new `results.items` array in the content file. Until then, do not add placeholder publications,
dates, DOIs or download buttons.

### Add or change a navigation item

Navigation and section ids are centrally controlled by the `navigation` array in
`src/content/adflex.ts`. Each entry's `id` must match the `id` given to its section in
`src/app/page.tsx`, and the array order must match the visible order of the sections.

## Official assets

| Asset          | Production path                                  |
| -------------- | ------------------------------------------------ |
| Logo           | `public/images/adflex/adflex-logo.png`           |
| System diagram | `public/images/adflex/adflex-system-concept.png` |

Both are copies of files supplied in `project-inputs/`. The originals are git-ignored and are
never referenced at runtime.

The logo is a raster PNG with an opaque white background. It must keep its aspect ratio, keep
all of its parts visible, and sit on a white or very light surface. The full rules — and the
things that must not be done to it — are on `/design-system` under **Logo & Imagery**.

## Design tokens

All tokens live in [`src/styles/adflex-tokens.css`](src/styles/adflex-tokens.css) and are
declared on the `.adflex-scope` class, not on `:root`, so the ADFLEX brand cannot leak into
anything else later hosted in the same application. The root layout wraps both routes in that
class.

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

WordPress or any CMS, a database, authentication, user accounts, an admin area, a backend or
APIs, contact-form processing, newsletter integration, analytics, a cookie banner, multilingual
support, a news or events system, search, dark mode, Storybook, a token generator, a separate
design-system application, a UI component library, an external icon package, complex animation,
video, social embeds, external stock imagery, deployment infrastructure and Docker.

None of these were requested for this release. See [docs/OPEN-ITEMS.md](docs/OPEN-ITEMS.md) for
what is still undecided.
