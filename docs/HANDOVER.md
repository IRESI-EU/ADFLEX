# ADFLEX website — handover

This document is for the next developer or agency. It describes what exists today, why it is
shaped this way, and how to extend it without breaking the parts that matter.

## 1. Current architecture

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, ESLint. Created with
  `create-next-app`, `src/` directory, no Tailwind, no UI library.
- **Rendering:** both routes are fully static. `npm run build` prerenders `/` and
  `/design-system`; there is no server logic, no API route and no data fetching.
- **Styling:** one global token file plus one CSS Module per component. No CSS-in-JS, no
  preprocessor, no utility framework.
- **Client JavaScript:** exactly one client component, `AdflexHeader`, for the mobile menu
  toggle. Everything else is a server component.
- **Dependencies:** only `next`, `react` and `react-dom` in production. Nothing was added for
  icons, animation, carousels or components.

## 2. Component responsibilities

| Component | Responsibility |
| --- | --- |
| `AdflexHeader` | Sticky header. Logo on a white surface, navigation on the right. Collapses behind an `aria-expanded` button below 940px. The only client component. |
| `AdflexHero` | Hero block: tags, `h1`, tagline, explainer, CTA, then the full-width system diagram, its caption and a text list of the diagram's concepts. |
| `SectionShell` | Standard section wrapper: `<section>` landmark, stable id, `h2` via `aria-labelledby`, optional lead paragraph, `scroll-margin-top`, and a `soft` background variant. |
| `TechnologyCard` | One technology: decorative number, name, description. |
| `PartnerCard` | One partner: decorative initials and the organisation name. Nothing else, because nothing else has been supplied. |
| `PilotSection` | The pilot: composes `SectionShell` with the pilot narrative and the list of assets named in it. |
| `EmptyState` | An intentional "nothing here yet" block. Used by Results & Publications. |
| `ContactBlock` | Contact details as a definition list with a `mailto:` link. No form. |
| `AdflexFooter` | Footer on a white surface: logo, email, anchor navigation, design-system link, current year, and a reserved row for funding and legal content. |
| `DesignSystemNav` | Section navigation for `/design-system`: sticky sidebar on desktop, wrapping anchor list on mobile. |

Shared interactive styles are CSS classes rather than components, because they are single
elements: `.adflex-cta`, `.adflex-link`, `.adflex-tag`, `.adflex-tag-list`, `.adflex-container`
and `.adflex-skip-link`, all defined in `src/app/globals.css`.

## 3. Content flow

```
src/content/adflex.ts   →  page.tsx  →  props  →  components
   (typed, `as const`)      (routes)              (presentational only)
```

- `adflexContent` is declared `as const satisfies AdflexContent`, so the types are enforced but
  the literal values stay narrow and readonly.
- Pages destructure the content object and pass it down as props. Components import types from
  the content module, never the data.
- `src/content/design-system.ts` holds only documentation copy. It contains no ADFLEX project
  facts, so there is one place to look when project copy changes.

**Adding a technology or a partner is a one-item data change.** Changing contact details is a
one-object change. Navigation labels and section ids are controlled by one array.

## 4. Asset usage

Two production assets live under `public/images/adflex/`. They are copies of files supplied in
`project-inputs/`, which is git-ignored and must never be referenced at runtime.

Both are rendered with `next/image`, with the intrinsic pixel dimensions passed as `width` and
`height` and the display size set in CSS as a `width` with `height: auto`. No fixed heights, no
`object-fit` cropping.

### Logo restrictions

These are hard constraints, not preferences. They are also documented on `/design-system`.

- Use the supplied full-colour PNG. Preserve its aspect ratio.
- Keep the symbol, the wordmark and the "LOCAL ENERGY FLEXIBILITY" line all visible.
- The file has an **opaque white background**. It must sit on white or a very light surface —
  never directly on dark teal or charcoal. If it must appear on a coloured panel, put it inside
  an intentional white surface with padding (see the Logo & Imagery section of the design
  system for the pattern in use).
- Do not recolour, distort, rotate or crop it. Do not add shadows, borders or effects.
- Do not trace it into SVG or present the raster file as a vector asset.
- Do not rebuild the wordmark with text. Do not create monochrome or reversed variants.
- Do not extract the logo from the system diagram — the separate official file exists.

### System diagram

- Show it complete, at full width with automatic height. Every label must stay visible.
- Never place text or UI over it; it carries its own labels.
- Red arrows mean power flow, blue arrows mean data and control signals. This is stated in the
  visible caption and in the alt text, and those two colours are never reused as UI colours.
- The surrounding HTML repeats the diagram's concepts as text, so nothing depends on pixels.

## 5. Styling strategy

- `src/styles/adflex-tokens.css` declares every token on `.adflex-scope`. Nothing ADFLEX-branded
  is on `:root`, so the brand cannot leak into another site later hosted alongside this one.
- `src/app/globals.css` holds a minimal reset, the `.adflex-scope` base typography and the
  shared utility classes. Heading defaults are written with `:where()` so they carry **zero
  specificity** — a component's own class always wins without `!important`. Keep it that way.
- Every component has its own CSS Module. Components use token variables, not literal colours
  or pixel spacing. If you find yourself typing a hex value in a module, add a token instead.
- Breakpoints in use: **940px** (header navigation collapses), **900px** (three-column and
  two-column page layouts collapse), **720px** (everything to a single column), **620px** and
  **420px** for small refinements. Reuse these rather than inventing new ones.

## 6. Website and design system

`/design-system` is a route of this application, not a separate project. It imports the real
components and the real tokens. That is deliberate: documentation that renders the production
component cannot drift from it.

Two consequences to keep in mind:

1. If you change a component's appearance, the design-system page updates with it. Check both
   routes after a visual change.
2. If you add a component that appears on `/`, add a live example to the Components section of
   `/design-system` and, if it introduces new tokens, to Brand & Foundations.

Page-level layout patterns are documented in prose rather than re-rendered, so that no second
copy of the layout exists.

## 7. Extending the website safely

- **New copy** goes in `src/content/adflex.ts` and only there, and only from approved source
  material.
- **New component**: create `src/components/Name.tsx` plus `Name.module.css`, take data through
  props, use tokens, then add a live example to `/design-system`.
- **New tokens**: add to `src/styles/adflex-tokens.css` under the right category and document
  them in `src/content/design-system.ts`. Check contrast before using a colour for text.
- **Do not** add a dependency for something CSS can do. There is no icon package, no animation
  library and no UI kit here by design.
- **Do not** invent ADFLEX facts, partner details, publications, funding statements or links.

### Adding a future route

1. Create `src/app/<route>/page.tsx`. The root layout already provides `.adflex-scope` and the
   skip link, so the new page only needs its own `<main id="main-content">`.
2. Reuse `AdflexHeader` and `AdflexFooter`. On a route other than `/`, pass `homeHref="/"` to
   the header and `hrefPrefix="/"` to the footer, so the section anchors resolve back to the
   home page — `/design-system` does exactly this.
3. If the new route has its own in-page sections, give the header a navigation array for those
   sections, or pass an empty array and a `trailingLink` (again as `/design-system` does).
4. Export a `metadata` object with a page-specific title and description.

### Keeping navigation ids aligned

There is one rule and it is easy to break:

> Every `id` in `adflexContent.navigation` must match the `id` passed to a section in
> `src/app/page.tsx`, and the array order must match the visible order of those sections.

Today: `home → technologies → consortium → pilot → results → contact`, with the About section
sitting between `home` and `technologies` without a navigation entry. If you add a section that
should be navigable, add it to the array in the position it appears on the page. If you add a
section that should not be navigable, give it an id but leave the array alone.

`SectionShell` applies `scroll-margin-top: calc(var(--adflex-header-height) + space)`. If you
change the header height, change the token — do not hard-code a new offset.

## 8. Verification commands

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run start        # then check http://localhost:3000/ and /design-system
```

`npm run check` runs lint, typecheck and build in sequence.

There is no test suite in this release. The checks above plus a manual pass at 375px, 768px and
1440px are the current gate.

## 9. Accessibility guardrails

Keep these true when you change anything:

- One `h1` per route; heading levels descend without skipping.
- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`. Each section is labelled by
  its own heading with `aria-labelledby`.
- The skip link stays the first focusable element and targets `#main-content`.
- The mobile menu stays a real `<button>` with `aria-expanded`, closes on Escape and closes
  after a link is chosen.
- Focus stays visible — a 3px `--adflex-color-primary` outline with a 2px offset.
- Interactive elements keep at least a 44 × 44 CSS-pixel internal target size. `.adflex-link` is
  `inline-flex` with a `min-height` for exactly this reason; do not use it for a link written
  inside a sentence.
- No horizontal page overflow at any width. Grids use `minmax(0, 1fr)`; images use
  `width: 100%; height: auto`.
- Smooth scrolling is opted into only under `prefers-reduced-motion: no-preference`. Do not
  introduce motion that ignores that query.
- Browser zoom must stay enabled; do not add `maximum-scale` or `user-scalable=no`.
- Alt text must describe what an image conveys. Nothing may be communicated by colour alone.

No independent accessibility audit has been carried out on this release, so the site should not
be described as WCAG conformant.
