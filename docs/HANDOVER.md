# ADFLEX website — handover

This document is for the next developer or agency. It describes what exists today, why it is
shaped this way, and how to extend it without breaking the parts that matter.

## 1. Current architecture

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, ESLint. Created with
  `create-next-app`, `src/` directory, no Tailwind, no UI library.
- **Rendering:** every route is fully static. `npm run build` prerenders `/`, `/about`,
  `/outputs`, `/contact`, `/news`, `/events`, the three `/legal/[slug]` pages and
  `/design-system`; there is no server logic, no API route and no data fetching.

### Routes that exist but have no content

`/news`, `/events` and the three legal pages are **structure without content**, on purpose. Each
renders a visible empty state saying nothing is published yet.

Do not fill them with sample entries. A placeholder news post, a specimen privacy policy or an
invented event date reads as real the moment someone lands on it, and on an EU-funded project
site that is a false statement rather than a design detail — the legal pages especially, since a
specimen policy would be a claim about how personal data is handled. Add real content by editing
`src/content/adflex.ts`; the empty state disappears when there is something to show.

The same rule governs the contact form and the newsletter button, both of which are **disabled**.
A form that looks live but discards messages loses real enquiries silently, and a sign-up that
collected addresses would be doing so with no privacy policy published.
- **Styling:** one global token file plus one CSS Module per component. No CSS-in-JS, no
  preprocessor, no utility framework.
- **Client JavaScript:** two client components — `AdflexHeader` for the mobile menu toggle and
  `GlossaryTerm` for the inline definition in the hero. Everything else is a server component.
- **Dependencies:** only `next`, `react` and `react-dom` in production. Nothing was added for
  icons, animation, carousels or components.

## 2. Component responsibilities

| Component | Responsibility |
| --- | --- |
| `AdflexHeader` | Sticky header. Logo on a white surface, navigation on the right, current route marked with `aria-current="page"`. Collapses behind an `aria-expanded` button below 1080px — a width set by the nine-item count, see below. |
| `AdflexHero` | Hero block: tags, `h1`, tagline, explainer, CTA, then the full-width system diagram, its caption and a text list of the diagram's concepts. |
| `SectionShell` | Standard section wrapper: `<section>` landmark, stable id, `h2` via `aria-labelledby`, optional lead paragraph, `scroll-margin-top`, and a `soft` background variant. |
| `TechnologyCard` | One technology: an optional illustrative image in a 16:9 frame, then a decorative number, name and description. |
| `PartnerCard` | One partner: its official logo (or decorative initials as a fallback) and the organisation name. Nothing else, because nothing else has been supplied. |
| `PilotSection` | The pilot: composes `SectionShell` with the place name, a 16:9 image paired beside the narrative, and the list of assets named in it as a full-width grid — each with an optional icon. |
| `EmptyState` | An intentional "nothing here yet" block. Used by `/outputs`. |
| `FigureText` | Renders a paragraph with one phrase given typographic emphasis — the figure a sentence turns on. **Highlights numbers already in approved copy; never a way to introduce one.** |
| `ContactBlock` | Contact details as a definition list with a `mailto:` link. No form. Used by `/contact` and shown as an example on `/design-system`. |
| `AdflexFooter` | Footer on a white surface, deliberately small: logo and LinkedIn on one row, then a bottom row with the year and the three legal links. Between them sits a **reserved funding row** that renders nothing while `footer.funding` is `null`. Takes only a `logo` prop and reads the rest from content. |
| `DesignSystemNav` | Section navigation for `/design-system`: sticky sidebar on desktop, wrapping anchor list on mobile. |
| `GlossaryTerm` | A term inside running text that reveals its definition. A real `<button>`, so it works by hover, focus and tap; the definition is always in the accessibility tree via `aria-describedby`. Client component. |
| `AwaitingContent` | Body for a route that exists but has no approved content yet — News, Events and the three legal pages. States plainly that nothing is published rather than showing sample entries. |
| `ContactForm` | Contact form template. **Every control is `disabled`** — there is no backend, and a form that silently discards messages is worse than no form. |
| `NewsletterSignup` | Sign-up block on the home page. **Button disabled** — no mailing list exists, and collecting addresses with no privacy policy published would be worse still. |
| `PageHero` | Opening emphasis band for the simple routes — About, Contact, Project Outputs. Carries the page's single `h1`. Shared so the three cannot drift apart, and a band rather than the plain page colour so a visitor landing on a sub-page arrives in the same site rather than on a blank white page. |
| `ThemeScript` | The inline script that sets `data-adflex-theme` before first paint. Not a visual component. Must stay tiny — it is parsed and run on every request ahead of everything else. |
| `ThemeToggle` | The light/dark control in the header. Client component, but deliberately holds no state — see the Dark mode section. |
| `NavLink` | Small internal helper, not a UI-library component. Renders a plain `<a>` for same-page anchors so the browser's scroll behaviour and the reduced-motion rules still apply, and `next/link` for real routes. Shared by the header and footer. |

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
- The file has an **opaque white background** — no alpha channel at all. It must sit on white or
  a very light surface, never directly on a dark colour. The header and footer therefore give it
  a white plate with padding: invisible in the light theme, a deliberate badge in dark mode. Do
  the same anywhere else it appears (see the Logo & Imagery section of the design system).
- Do not recolour, distort, rotate or crop it. Do not add shadows, borders or effects.
- Do not trace it into SVG or present the raster file as a vector asset.
- Do not rebuild the wordmark with text. Do not create monochrome or reversed variants.
- Do not extract the logo from the system diagram — the separate official file exists.

### Partner logos

Third-party trademarks, in `public/images/partners/`. Only ever use a file supplied by the
partner or the project coordinator — never one from a search result or a logo aggregator.

Each card fits its logo into a shared plate with `object-fit: contain`, so every lockup keeps its
own aspect ratio.

**The plate is taller than the wordmarks need, on purpose.** The three supplied logos are 4.25:1,
2.21:1 and 0.69:1 — a wide wordmark and a portrait crest cannot both fill one box. Constrain by
width alone and the crest ends up at roughly a third of the others' visual area. The extra height
is headroom the crest uses and the wordmarks simply ignore. If you swap in a logo of a very
different proportion, check the row optically rather than trusting the numbers.

The card name reserves two lines' worth of height whether it needs them or not, so a partner
whose name wraps does not push its card taller than the rest. The grid also goes straight from
three columns to one — a two-column stage would strand the third partner alone on a row.

Two more things to preserve if you touch this:

- **The box must be definite.** With `width: auto` the rendered size follows whichever srcset
  variant the browser happens to pick, so identical markup renders at different sizes on
  different viewports. That was a real bug here.
- **`sizes` must match the box.** It is `200px`, the same as the CSS. The optimizer caps its
  output at the source width, so a high-DPI screen still gets every pixel the source file has.

> A debugging note, because it will mislead you too: for `srcset`/`sizes` images, `naturalWidth`
> reports the **density-corrected** size, not the pixel size of the file that was fetched. An
> image can report `naturalWidth: 375` while the browser actually downloaded a 750px file. To
> check what was really served, read the `w=` parameter on `img.currentSrc`, or request the
> `/_next/image` URL directly and measure the response.

Trim blank canvas from any new logo before adding it — see
[CONTENT-SOURCE.md](CONTENT-SOURCE.md) for what was done to the current three.

### Pilot section layout

Two sizing decisions that look arbitrary but are not:

- **The image sits beside the narrative, not full width.** Full width it rendered 626px tall and
  swamped the section; in a `1.3fr / 1fr` split it is 341px. The ratio is a balance — widening
  the image narrows the text column, which makes it taller. At the current copy length the two
  columns finish within about 24px of each other. **Re-check that if the pilot copy changes
  length.**
- **The assets are a full-width grid, not a sidebar.** They were previously a column beside the
  narrative, but a seven-item list and a 700-character paragraph are never the same height, so
  one always ran past the other. Full width also gives the icons room to read.

### Illustrative imagery

Two sets: the technology card images in `public/images/technologies/`, and the pilot banner in
`public/images/pilot/`. Both use a 16:9 `aspect-ratio` frame with `object-fit: cover`, so space
is reserved before the image loads and the layout never shifts.

**None of it is evidence.** These are illustrations, not photographs of the Ringsend pilot and
not diagrams of the ADFLEX architecture. The pilot banner deserves particular care: its skyline
reads as Ringsend and it sits directly above the real pilot description, so it is the one most
likely to be mistaken for a photograph of the site. Nothing on the site describes it as one —
keep it that way.

Their `alt` is empty because the surrounding heading and description already carry the meaning.
Give an image real alt text only if it adds information the text does not have.

The pilot asset icons in `public/images/pilot-icons/` follow the same thinking at small scale.
They sit in a fixed 56px tile with `object-fit: contain`, so each keeps its own aspect ratio and
the rows line up. The tile is dark on purpose: these icons are drawn as luminous marks and their
glows wash out on white. Two of them illustrate ESB Networks and Arden Energy — **neither is that
organisation's logo**, and neither may be presented as one.

Sizing rule of thumb: match the source to how wide the image actually renders. Technology cards
top out around 560 CSS px, so ~1400px sources are ample; the pilot banner spans the full
container, so its source is kept at full width. Re-encode to JPEG — the supplied PNGs were
roughly 2 MB each. See [CONTENT-SOURCE.md](CONTENT-SOURCE.md) for what the supplied files went
through.

### System diagram

The current file is a dark-treatment redraw supplied on 29 July 2026, replacing the original
light version — same labels, same legend, different styling. It sits directly on the hero with
rounded corners rather than inside a white frame, because a dark image defines its own edges.

**Replacing it again:** drop the new file at the same path, update `width`/`height` in
`hero.diagram`, and **clear `.next` before checking**. The image optimizer caches by URL, so a
same-named replacement will keep serving the old file and you will think nothing happened. That
has caught me out twice on this project.

- Show it complete, at full width with automatic height. Every label must stay visible.
- Never place text or UI over it; it carries its own labels.
- Red arrows mean power flow, blue arrows mean data and control signals. This is stated in the
  visible caption and in the alt text, and those two colours are never reused as UI colours.
- **The alt text is the only place the diagram's parts are named.** A visible list of its labels
  used to sit beneath it; it was removed at the client's request on 29 July 2026. The labels
  inside the image are legible at desktop width but not at phone width, so if you replace the
  diagram, write its alt text as full content rather than a token description.

## 5. Styling strategy

### One set of token names, four things that rebind them

The single most important thing to understand before changing any CSS.

Components only ever use the semantic `--adflex-color-*` names. Four things rebind them, and
nothing else should:

| | |
|---|---|
| `[data-adflex-theme="dark"]` | the whole page, when dark mode is on |
| `.adflex-band` | an emphasis band inside the page |
| `.adflex-accent` | the single saturated call-to-action band |
| `.adflex-light` | a forced-light island |

```css
.adflex-band {
  --adflex-color-surface: var(--adflex-band-surface);
  --adflex-color-text:    var(--adflex-band-text);
  --adflex-color-primary: var(--adflex-band-primary);
  /* …and the rest */
}
```

So a card written as `background: var(--adflex-color-surface)` works in all four with no extra
CSS, no conditional class and no duplicated component. `.adflex-cta` needs no dark variant: its
background and its text colour both rebind, turning a green-on-white button into a light-green
button with dark text.

Note that `.adflex-band` carries **no theme logic of its own**. It points at `--adflex-band-*`,
and dark mode changes what those mean — so the band is a soft green-grey tint in the light theme
and a deeper shade of the page in the dark one, from one rule.

`.adflex-accent` is a saturated brand green, used once, for the newsletter block that closes the
home page. It inverts two tokens, `primary` to white and `surface` to the green, which turns
`.adflex-cta` into a white button with green text with no variant needed.

**Rules that follow from this:**

1. Style components with the **semantic** tokens (`--adflex-color-*`). Never a literal colour.
2. A few things must stay fixed whatever the theme, because the supplied artwork is fixed. They
   use the `--adflex-plate-*` tokens, which never rebind:
   - the **logo** always gets a white plate — the file is opaque and has no alpha channel at all
   - the **pilot icon tiles** stay light — that artwork is dark navy line art
   - the **image placeholders** stay dark — they sit behind dark photography
3. The **partner cards** carry `.adflex-light`, which pins the whole palette to the fixed
   `--adflex-l-*` values. That is what keeps them light in dark mode. Pinning only the background
   would leave dark-theme text on a white ground.
4. If you find yourself reaching for a fixed value anywhere else, you probably want a semantic
   token instead.
5. Adding an emphasis section is `tone="band"` on `SectionShell`. Nothing else.

The trap: `--adflex-color-ink` follows the theme. Using it for something that must stay dark — as
the pilot icon tiles once did — inverts it exactly when you don't want it to.

### Dark mode

Restored on 30 July 2026 at the team's request, alongside the move to the lighter palette. (It
had been built once before and removed on 29 July.) The mechanism:

- The theme lives in **one place**: a `data-adflex-theme` attribute on the document element.
- `ThemeScript` inlines a small raw script into `<head>`. It runs during parse, **before the
  first paint**, so the first frame is already correct. An effect or a deferred `next/script`
  strategy would run after the page had drawn — the flash is exactly what this prevents.
- `ThemeToggle` holds **no React state**. It reads the attribute at click time, and its two
  labels are shown and hidden by CSS off that same attribute. There is therefore nothing for the
  server and the client to disagree about: no hydration mismatch and no flash of the wrong label.
- `<html>` carries `suppressHydrationWarning` because that script writes to it before React
  hydrates. It is scoped to that one element and does not extend to children.
- The toggle is hidden until the script adds an `adflex-js` class, so a reader without JavaScript
  is never shown a control that cannot do anything.
- `color-scheme` is set alongside the palette, so scrollbars and native controls follow too.

**The old blocker, and what changed.** Dark mode was previously rejected because the ADFLEX logo
and the partner logos are raster files with opaque light backgrounds and render as pale
rectangles on a dark surface. That is still true of the files. It is now handled rather than
avoided: the logo is given a deliberate white plate (a badge, not an accident), and the partner
cards keep `.adflex-light`. Transparent logo files would let the plate go away — see
[OPEN-ITEMS.md](OPEN-ITEMS.md).

### Typography

Two faces, self-hosted by `next/font` at build time: **Sora** for headings
(`--adflex-font-display`, weights 600/700 only) and **Inter** for everything else
(`--adflex-font-sans`). No external requests, no CDN, no runtime dependency. Both stacks fall
back to system faces.

### The rest

- `src/styles/adflex-tokens.css` declares every token on `.adflex-scope`. Nothing ADFLEX-branded
  is on `:root`, so the brand cannot leak into another site later hosted alongside this one.
- `src/app/globals.css` holds a minimal reset, the `.adflex-scope` base typography and the
  shared utility classes. Heading defaults are written with `:where()` so they carry **zero
  specificity** — a component's own class always wins without `!important`. Keep it that way.
- Every component has its own CSS Module. Components use token variables, not literal colours
  or pixel spacing. If you find yourself typing a hex value in a module, add a token instead.
- Breakpoints in use: **1080px** (header navigation collapses), **900px** (three-column and
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
   skip link, so the new page only needs its own `<main id="main-content">`. Open it with
   `PageHero`, which carries the page's single `h1` and gives it the same opening band as
   the other sub-pages — do not hand-roll a page heading.
2. Reuse `AdflexHeader` and `AdflexFooter`. On a route other than `/`, pass `homeHref="/"` to
   the header and give both the result of
   `resolveNavigation(navigation, { onHome: false })`. `/contact` and `/outputs` are the
   smallest examples to copy from.
3. If the new route has its own in-page sections, give the header a navigation array for those
   sections, or pass an empty array and a `trailingLink` (as `/design-system` does).
4. Export a `metadata` object with a page-specific title and description.
5. If the route belongs in the site navigation, add it to `adflexContent.navigation` with
   `kind: "route"`.

### Keeping navigation aligned

Navigation lives in one array, `adflexContent.navigation`, and each item declares its `kind`:

- **`kind: "section"`** — an anchor on the home page. Its `id` must match the `id` passed to a
  section in `src/app/page.tsx`, and its position in the array must match the visible order of
  those sections.
- **`kind: "route"`** — its own page. `href` is absolute, e.g. `/contact`.

Today `home`, `technologies`, `consortium` and `pilot` are sections on the home page, while
`about`, `outputs`, `news`, `events` and `contact` are routes of their own — nine items in all.

**The navigation collapses at 1080px, not at a smaller width, because of that count.** Measured:
nine items still fit on one line at 1100px and wrap the header to double height by 1024px. If you
add a tenth, re-measure and raise the breakpoint in `AdflexHeader.module.css` — nothing warns you
otherwise, the header just silently doubles in height at some widths.

The News and Events labels are deliberately short ("News", "Events") while their pages are headed
"News & Updates" and "Events", for the same reason.

**The footer does not repeat the navigation.** It once carried all nine items plus a
design-system link, which at the site's 44px minimum target height was a 480px tower and made the
footer 697px tall. On 29 July 2026 the client cut it back to identity, the legal links and
LinkedIn. Every section is reachable from the header, so nothing became unreachable — **except
`/design-system`, which is now only reachable by typing the URL.** That is fine for an internal
reference page; if it should be linked from the site again, the footer's legal row is the natural
place.

**The footer's two waiting slots.** Both live in `footer` in `src/content/adflex.ts` and both are
filled in without touching a component:

- `funding` is `null`. Set `{ statement, emblem? }` and the funding row appears between the logo
  row and the legal row, already styled. Use the **approved wording verbatim** — most funding
  programmes mandate exact text — and only an approved emblem file.
- `linkedin.href` is `null`. While it is null the block renders as muted, dashed, non-interactive
  text rather than a link, so no dead link ever ships. Set the URL and it becomes a real link.

`AdflexFooter` reads these through `adflexContent.footer as AdflexContent["footer"]`, and the
assertion is load-bearing: TypeScript narrows a `const` to its initialiser, so read straight off
the `as const` literal both values type as `null`, both branches become `never`, and the file
**stops compiling the moment someone fills either one in**. Do not remove it.

**The LinkedIn glyph is drawn inline** in `AdflexFooter.tsx`, not taken from an icon package —
an external icon dependency is out of scope. It is a rendition of the mark, not LinkedIn's own
artwork; LinkedIn publishes official brand assets and usage rules, so swap it if the project wants
to follow them exactly.

**Current-page marking.** The header sets `aria-current="page"` on the link matching the route,
drawn as a green underline. Only `route` items qualify — the in-page anchors (Technologies,
Consortium, Pilot) all live on the home page, so marking by pathname would flag four links at
once. Highlighting the section actually in view would need scroll tracking, which is a separate
feature and not built. "Home" is the one exception: it is an anchor, but it is also what `/`
means. If you add a section that should
be navigable, add it to the array in the position it appears on the page. If it should not be
navigable, give it an id but leave the array alone.

### Figures in running text

There is **no statistics block on this site, and that is deliberate.** An earlier build had one;
it was removed because a strip of big numbers is exactly where invented impact metrics get
added later — emissions saved, flexibility delivered, participation rates — none of which
ADFLEX has produced yet.

Instead, `FigureText` picks out the number a sentence already contains:

```ts
intro:       "ADFLEX brings together three partners spanning research…",
introFigure: "three partners",
```

The rules:

- **`figure` must appear verbatim in the text.** It is found with `indexOf`, and a phrase that
  does not match degrades to plain prose rather than throwing or losing the sentence.
- The emphasis is a plain `<span>`, **not `<strong>`**. It is typographic, and the supplied copy
  does not mark those figures as important — wrapping them in `<strong>` would put emphasis into
  the sentence that the author never wrote.
- It highlights numbers that are **already in approved copy**. It is not a way to introduce one.

Currently used in three places: the technologies intro ("Four building blocks"), the consortium
intro ("three partners") and the pilot narrative ("around 9,000 residents" — the only hard
number ADFLEX has supplied).

### The About glimpse

`/about` renders every item in `about.items` in full. The home page renders a glimpse of a
single item — the one named by `about.home.itemId` — under its own heading
(`about.home.heading`, currently "Objective of ADFLEX"), followed by a link to `/about`.

Two things to keep straight:

- **`about.title` and `about.home.heading` are different on purpose.** The first heads the
  `/about` page ("About ADFLEX"); the second heads the home page section. Changing one should
  not change the other.
- **`summary` must remain a verbatim prefix of `body`** — shorten by cutting, never by
  rewriting. That keeps the two pages consistent and stops unapproved wording entering the site.
  Punctuation at the cut matters: ending a glimpse with a full stop where the source has a comma
  breaks it. Verify with `body.startsWith(summary)` for every item.

Every item carries a `summary` even though only one is shown today, so re-pointing
`about.home.itemId` never requires new copy.

The home section takes its `id` from `about.home.itemId`, so the anchor matches what is actually
on the page. Nothing links to it today — "About" in the navigation is a `route` item pointing at
`/about` — but keep them consistent if that changes.

The hero call to action also goes through this model — `hero.cta.href` is `/outputs`, and
`AdflexHero` renders it with `NavLink`, so it works whether a future CTA points at a section or
a route.

**Never hard-code navigation hrefs in a page.** Call
`resolveNavigation(navigation, { onHome })` and pass the result down. It prefixes section
anchors with `/` on every route other than the home page, so `#technologies` becomes
`/#technologies` on `/contact` and `/design-system`. Without it, those links would silently do
nothing.

`SectionShell` applies `scroll-margin-top: calc(var(--adflex-header-height) + space)`. If you
change the header height, change the token — do not hard-code a new offset.

## 8. Verification commands

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run start        # then check /, /about, /outputs, /contact and /design-system
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
  inside a sentence. The one exception is `GlossaryTerm`, which is a word inside a sentence and
  cannot be padded without breaking the line — this is the recognised inline exception to the
  target-size rule, not an oversight.
- **Nothing important may be hover-only.** `GlossaryTerm` sets the pattern to copy: it opens on
  hover, on focus and on click; it closes on Escape; the popup sits inside the hovered element so
  moving the pointer onto it does not dismiss it; and the text is always present for assistive
  technology through `aria-describedby`, whether or not the popup is on screen. A plain `title`
  attribute or a CSS-only `:hover` reveal would fail all of that.
- No horizontal page overflow at any width. Grids use `minmax(0, 1fr)`; images use
  `width: 100%; height: auto`.
- Smooth scrolling is opted into only under `prefers-reduced-motion: no-preference`. Do not
  introduce motion that ignores that query.
- Browser zoom must stay enabled; do not add `maximum-scale` or `user-scalable=no`.
- Alt text must describe what an image conveys. Nothing may be communicated by colour alone.

No independent accessibility audit has been carried out on this release, so the site should not
be described as WCAG conformant.
