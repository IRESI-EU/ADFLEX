# ADFLEX website — handover

This document is for the next developer or agency. It describes what exists today, why it is
shaped this way, and how to extend it without breaking the parts that matter.

## 1. Current architecture

- **Framework:** Next.js 16 (App Router), React 19, TypeScript, ESLint. Created with
  `create-next-app`, `src/` directory, no Tailwind, no UI library.
- **Rendering:** mixed since 31 July 2026, when the admin was added. `/`, `/about`,
  `/design-system` and the three `/legal/[slug]` pages are still prerendered with no server logic.
  `/outcomes`, `/news`, `/contact`, `/media/[id]` and everything under `/admin` are server-rendered
  on demand, because their content now lives in Postgres rather than in the repository.
  **The site is therefore no longer a static export**, and its host has to run Node.

### The admin

`/admin` lets an editor publish project findings, publications, news and events, and read contact
form submissions. It is documented on its own in **[ADMIN.md](ADMIN.md)** — read that before
touching anything under `src/lib/db.ts`, `src/lib/auth.ts`, `src/lib/repo.ts`, `src/app/admin/`
or `src/proxy.ts`.

Two things from it are load-bearing enough to repeat here:

1. **The public site must keep building and rendering with no database.** `npm run build` is run
   with no `DATABASE_URL` as part of verifying any change. Every public read goes through
   `safeRead()`, which falls back to the empty state rather than throwing.
2. **`requireEditor()` at the top of every Server Action is the security boundary**, not
   `src/proxy.ts`. Server Actions are POST endpoints reachable without loading the page that
   renders the form.

### Routes that exist but have no content

`/news` and `/outcomes` are **structure without content** until an editor publishes something. Both
render a visible empty state saying so.

Do not fill them with sample entries. A placeholder news post, an invented event date or a made-up
DOI reads as real the moment someone lands on it, and on a publicly funded project site that is a
false statement rather than a design detail. **This rule survived the admin unchanged** — the only
difference is that real content now arrives from an editor instead of a commit.

News and Events were two routes until 30 July 2026, when they were merged. Both were empty, so
the navigation offered a visitor two dead ends instead of one.

The contact form followed the same rule and was **disabled** until 31 July 2026, because a form
that looks live but discards messages loses real enquiries silently. It is live now that
submissions land in a table someone reads — and it goes back to disabled automatically on any
deployment with no database, which is the same rule still doing its job.

### The legal pages

`/legal/privacy`, `/legal/cookies` and `/legal/terms` carry the wording supplied in
`ADFLEX_Legal_Pages_Draft_v2.docx`, transcribed **verbatim** into `legal.pages` in
`src/content/adflex.ts` on 30 July 2026.

**That wording is not yours to edit.** Do not shorten it, re-word it, fix its grammar or fill in
its square-bracketed placeholders. If something in it is wrong, out of date or does not match the
site, that is a question for whoever carries the liability — see [OPEN-ITEMS.md](OPEN-ITEMS.md),
which lists the specific mismatches already found.

Three decisions worth knowing:

1. **Structured blocks, not markup.** Each document is a list of typed blocks — `heading`,
   `paragraph`, `list`, `table` — so the wording stays plain data that can be diffed against the
   source line by line. Nothing parses Markdown or HTML, which also means there is no injection
   surface in the one place on the site where exact wording matters most.
2. **Linking is deliberately narrow.** `LegalDocument` links email addresses and bare `www.`
   domains and nothing else, and **never inside a square-bracket placeholder**. Linking
   `[www.adflex.ie / adflex domain TBC]` would publish a live link to a domain that is explicitly
   unconfirmed.
3. **Every page says it is a draft**, above the text, via `page.status`. The documents are marked
   `Draft_v2` and still end "version 1.0", so no reader should mistake them for settled policy.
- **Styling:** one global token file plus one CSS Module per component. No CSS-in-JS, no
  preprocessor, no utility framework.
- **Client JavaScript:** four client components — `AdflexHeader` for the mobile menu toggle,
  `GlossaryTerm` for the inline definition in the hero, `ContactForm`, and the admin's `forms.tsx`.
  The last two are client components only because `useActionState` has to be; everything they
  submit to is a Server Action, so there is no fetch layer and no API surface of our own.
  Everything else is a server component.
- **Dependencies:** `next`, `react`, `react-dom`, plus `pg` and `server-only` added on
  31 July 2026 for the admin. **Still nothing for icons, animation, carousels, components, forms,
  validation or authentication** — the schema is hand-written SQL, passwords use `node:crypto`
  scrypt, and sessions are an HMAC-signed cookie.

## 2. Component responsibilities

| Component | Responsibility |
| --- | --- |
| `AdflexHeader` | Sticky header. Logo on a white surface, navigation on the right, current route marked with `aria-current="page"`. Collapses behind an `aria-expanded` button below 1080px — a width set by the nine-item count, see below. |
| `AdflexHero` | Hero block: tags, `h1`, tagline, explainer, CTA, then the full-width system diagram, its caption and a text list of the diagram's concepts. |
| `SectionShell` | Standard section wrapper: `<section>` landmark, stable id, `h2` via `aria-labelledby`, optional lead paragraph, `scroll-margin-top`, and a `soft` background variant. |
| `TechnologyCard` | One technology: an optional illustrative image in a 16:9 frame, then a decorative number, name and description. |
| `PartnerCard` | One partner: its official logo (or decorative initials as a fallback) and the organisation name. Nothing else, because nothing else has been supplied. |
| `PilotSection` | The pilot: composes `SectionShell` with the place name, a 16:9 image paired beside the narrative, and the list of assets named in it as a full-width grid — each with an optional icon. |
| `EmptyState` | An intentional "nothing here yet" block. Used by `/outcomes`. |
| `FigureText` | Renders a paragraph with one phrase given typographic emphasis — the figure a sentence turns on. **Highlights numbers already in approved copy; never a way to introduce one.** |
| `ContactBlock` | Contact details as a definition list with a `mailto:` link. No form. Used by `/contact` and shown as an example on `/design-system`. |
| `AdflexFooter` | Footer on a white surface, deliberately small: logo and LinkedIn on one row, then a bottom row with the year and the three legal links. Between them sits a **reserved funding row** that renders nothing while `footer.funding` is `null`. Takes only a `logo` prop and reads the rest from content. |
| `DesignSystemNav` | Section navigation for `/design-system`: sticky sidebar on desktop, wrapping anchor list on mobile. |
| `GlossaryTerm` | A term inside running text that reveals its definition. A real `<button>`, so it works by hover, focus and tap; the definition is always in the accessibility tree via `aria-describedby`. Client component. |
| `AwaitingContent` | Body for a route that exists but has no approved content yet — News & Events. States plainly that nothing is published rather than showing sample entries. |
| `LegalDocument` | Renders one legal document from structured blocks. Handles the draft notice, headings, lists and the cookies table, and does the narrow email/URL linking. See *The legal pages*. |
| `HeroCommunity` | The hero illustration — a small energy community with one shared arc of energy passing over it. Decorative inline SVG: no JavaScript, `aria-hidden`, CSS-only motion. See *The hero illustration*. |
| `MotionScript` | Inline script adding `adflex-js` before first paint, so the reveal styles are safe. Not a visual component. |
| `RevealObserver` | One IntersectionObserver for every `[data-reveal]` on the page. Mounted once in the root layout. |
| `ContactForm` | Contact form. Live since 31 July 2026; submissions go to a Server Action and land in the `messages` table. Falls back to every control `disabled` when there is no database, because a form that silently discards messages is worse than no form. |
| `PublishedList` | Renders editor-managed content on `/outcomes` and `/news` — findings, publications, news and events. **Everything is text, never markup**: bodies are split into paragraphs on blank lines and rendered as text nodes, with no `dangerouslySetInnerHTML` anywhere. |
| `PageHero` | Opening emphasis band for the simple routes — About, Contact, Project Outcomes. Carries the page's single `h1`. Shared so the three cannot drift apart, and a band rather than the plain page colour so a visitor landing on a sub-page arrives in the same site rather than on a blank white page. |
| `NavLink` | Small internal helper, not a UI-library component. Renders a plain `<a>` for **any href containing a fragment** and `next/link` only for fragment-less routes. Shared by the header and footer. The fragment rule is load-bearing — see *Why anchors are never `next/link`*. |

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
  a white plate with padding, which is invisible against their white surface but guarantees the
  mark never lands on a colour. Do the same anywhere else it appears (see the Logo & Imagery
  section of the design system).
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
  one always ran past the other. The grid takes its column count from `minmax` alone — four at
  desktop, two at tablet, one on a phone — so there is no breakpoint to keep in step with it.

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
They sit in a **104px-wide 3:2 thumbnail beside the label**, not above it and not in a square
glyph tile. Two constraints fix that shape:

- The supplied files are 1536×1024 artworks on their own opaque grounds. Three of the seven are
  wide scenes — the dashboard, the charger and car, the pylon and demand curve — and a square
  centre crop cuts the subject off at both ends.
- Set across the full card width, as they were until 31 July 2026, each card stood about 300px
  tall and a seven-item labelled list carried as much visual weight as the pilot narrative above
  it. The artwork is supporting detail; it names the asset faster than the words do and is not
  worth a third of the section.

The tile ground is dark on purpose: these icons are drawn as luminous marks and their glows wash
out on white. Two of them illustrate ESB Networks and Arden Energy — **neither is that
organisation's logo**, and neither may be presented as one.

Sizing rule of thumb: match the source to how wide the image actually renders. Technology cards
top out around 560 CSS px, so ~1400px sources are ample; the pilot banner spans the full
container, so its source is kept at full width. Re-encode to JPEG — the supplied PNGs were
roughly 2 MB each. See [CONTENT-SOURCE.md](CONTENT-SOURCE.md) for what the supplied files went
through.

### System diagram

The current file was supplied on 30 July 2026, the third version of the same content — same
labels, same legend, different styling. It went dark on 29 July and light again on 30 July, so
**check the file before assuming anything about its treatment.**

**It is mounted on a white plate, not placed on the band.** Its artwork ground is a pale mint
within a few percent of `--adflex-band-background` behind it, so sitting directly on the section
the only thing separating a 1672px-wide illustration from the page was a single hairline — it
read as a screenshot dropped onto the band. The mat gives it an edge on all four sides, the
caption lives inside the same plate so the two read as one object, and the image's radius is one
step tighter than the plate's so the curves nest. All three step down together at 720px.

If a future version goes dark again, the mat becomes optional — a dark image defines its own
edges — but the caption should stay inside the plate either way.

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

### One set of token names, three things that rebind them

The single most important thing to understand before changing any CSS.

Components only ever use the semantic `--adflex-color-*` names. Two things rebind them, and
nothing else should:

| | |
|---|---|
| `.adflex-band` | an emphasis band inside the page |
| `.adflex-light` | a forced-light island |

```css
.adflex-band {
  --adflex-color-surface: var(--adflex-band-surface);
  --adflex-color-text:    var(--adflex-band-text);
  --adflex-color-primary: var(--adflex-band-primary);
  /* …and the rest */
}
```

So a card written as `background: var(--adflex-color-surface)` works in both with no extra CSS,
no conditional class and no duplicated component.

`.adflex-band` is a soft green-grey tint rather than a dark block. In a light design a band earns
its separation by shifting tone slightly, not by inverting.

There was a third, `.adflex-accent` — a saturated green call-to-action band. It existed only for
the newsletter block, which was removed on 30 July 2026, so the band went with it rather than
staying as an unused palette.

**Rules that follow from this:**

1. Style components with the **semantic** tokens (`--adflex-color-*`). Never a literal colour.
2. A few grounds must stay fixed whatever band surrounds them, because the artwork on them is
   fixed. They use the `--adflex-plate-*` tokens, which never rebind:
   - the **logo** always gets a white plate — the file is opaque and has no alpha channel at all
   - the **pilot icon tiles** stay light — that artwork is dark navy line art
   - the **image placeholders** stay dark — they sit behind dark photography
3. The **partner cards** carry `.adflex-light`, which pins the whole palette to the fixed
   `--adflex-l-*` values so no enclosing band can reach into them. Pinning only the background
   would leave band text colours on a white ground.
4. If you find yourself reaching for a fixed value anywhere else, you probably want a semantic
   token instead.
5. Adding an emphasis section is `tone="band"` on `SectionShell`. Nothing else.

The trap: `--adflex-color-ink` follows the band. Using it for something that must stay a fixed
colour — as the pilot icon tiles once did — flips it exactly when you don't want it to.

### There is no dark mode — and it has now been removed twice

**Read this before building a third one.**

| | |
|---|---|
| Built, then removed | 29 July 2026, at the client's request |
| Built again, then removed again | 30 July 2026, at the team's request |

The second build was a `data-adflex-theme` attribute on `<html>`, set by a small inline script in
the root layout before first paint, with a header toggle that held no React state. It worked: 8
routes × 2 widths × 2 themes came back with zero contrast failures and no hydration warnings. It
was removed because it was not wanted, not because it failed.

If it is ever asked for a third time, two things are worth knowing up front:

1. **The toggle cannot be removed on its own.** Leaving the dark palette in place with no control
   would strand anyone whose operating system is set to dark on a theme they cannot leave. Dark
   mode and its toggle go in and out together.
2. **The supplied logos are the real constraint.** The ADFLEX logo and the partner logos are
   raster files with opaque light backgrounds, so on a dark surface they render as pale
   rectangles. The second build handled that with a deliberate white plate on the logo and
   `.adflex-light` on the partner cards — both of which are still in the code, because they are
   correct regardless. A **transparent logo file** would remove the need for the plate entirely;
   see [OPEN-ITEMS.md](OPEN-ITEMS.md).

The token structure that made it cheap is still in place: fixed source values (`--adflex-l-*`)
are separate from the semantic tokens that bind to them, so a whole palette can be rebound in one
block.

### Motion

Added 31 July 2026, when the team asked for a more considered UI.

**The reveal system.** Anything with a `data-reveal` attribute lifts 16px and fades in as it
enters the viewport. One `IntersectionObserver` in `RevealObserver` handles the whole document, so
a server component only has to add a string to its markup — no part of the page tree becomes
client-rendered in order to animate. Elements are revealed once and then unobserved.

**Three guards, and why each exists.** A scroll-reveal system fails silently in exactly three
ways, so each is closed deliberately:

| Failure | Guard |
| --- | --- |
| JavaScript off, content stays hidden forever | Every hidden-state rule is gated on `:root.adflex-js`, which only `MotionScript` adds. No JS, nothing hidden. |
| Reduced motion, content stays hidden or animates anyway | The whole block sits inside `prefers-reduced-motion: no-preference`, **and** the observer checks the query itself and marks everything shown without scheduling work. |
| A flash of visible content before JS hides it | `MotionScript` runs during head parse, so the pre-reveal state is correct on the first frame. |

All three were verified against the built site: with JavaScript disabled, 0 of 18 reveal elements
are hidden; with reduced motion on, 0 are hidden and **0 elements have a running animation** — the
site is genuinely still, not merely quicker.

If you add a section, add `data-reveal=""` to it. Add `--adflex-reveal-delay` inline to stagger a
group. Do not put anything in a revealed element that is the only place something is said, and do
not use motion to carry meaning: it is all decorative, which is what makes turning it off safe.

### The hero illustration

`HeroCommunity`, 31 July 2026 — the sixth hero. Read that number before changing
it, because it is the most useful thing in this section.

The five before it were an abstract node network, a building-and-digital-twin
split, a full isometric community, a minimal energy ribbon and a brand-derived
sculpture. Each was more complete or more clever than the last, and every one was
rejected for the same reason: **the hero's job is to say what the project is
about and look calm doing it, not to explain the system.** The supplied system
diagram sits directly below and does the explaining. The pull to make this one
say more will be strong. It is the wrong instinct, and it has now been wrong five
times.

**Six things, and nothing else:**

| Cue | Shape |
| --- | --- |
| The homes taking part | A house, with a solar panel on the pitch |
| The community around them | Two buildings beside it |
| Energy shared across the community | One arc passing over all three |
| The Digital Spine coordinating it | One point sitting on that arc |
| Flexibility actually moving | One light travelling along it |
| Somewhere for it all to stand | A ground line |

The arc does not touch a building and there are no connector lines. That is
deliberate: it passes *over* the community rather than wiring it together, which
is the whole difference between an illustration and a schematic. Do not add
connectors, labels, arrows or a legend.

**It is wide and shallow on purpose** — 560 × 300. It sits beside the copy at
desktop width and above the fold on a phone, and a tall illustration in that slot
pushes the hero down by most of a screen. The previous hero was near-square and
stood the tablet hero at 1725px; this one brings it to 1451px.

**One path, three strokes.** The `ARC` constant is shared by the visible stroke,
the faint echo above it and the travelling light, so the three cannot drift out
of register. Giving any one of them its own copy is the usual way a layered
stroke effect breaks. The travelling light is a second copy rather than a dash
pattern on the first, because one path cannot be both a continuous line and a
moving pulse.

The light's gap is three times the path length, which is what leaves exactly one
light on the arc and a long pause between passes — a continuous stream reads as
traffic rather than as something being coordinated. Its resting offset parks it
past the end of the arc, so reduced motion shows a clean curve rather than a
stray dot.

**Both animations are behind `prefers-reduced-motion: no-preference`**, and the
node's ping is timed against the travel rather than guessed: the light is halfway
along the arc at 18% of the sweep, which is where the ping fires.

Its greens, slate and gold come from the brand tokens; only white and the
illustration ink come from `--adflex-illus-*`.

**Four traps worth knowing**, all found by looking at the render rather than from
any build error:

- **A horizontal path has a zero-height bounding box**, so the default
  `objectBoundingBox` gradient on it never resolves and the stroke renders
  completely invisible, with nothing reported anywhere. The ground line needs
  `gradientUnits="userSpaceOnUse"`. Without the ground line the three buildings
  read as rounded cards floating in space, which is exactly how it first looked.
- **`rx` on a `<rect>` rounds all four corners.** A rounded bottom edge is what
  makes a shape read as a card lying on a surface rather than a building standing
  on one. The `block()` helper exists only to round the top two.
- **A CSS `scale()` on an SVG element scales about the viewBox origin**, not the
  element. `transform-box: fill-box` on `.nodePulse` is what keeps the ring
  growing in place instead of being thrown across the drawing.
- A **clip path may only contain shapes, text, and `<use>` of a *shape***. A
  `<use>` of a group resolves to an empty clip and browsers then silently discard
  everything inside it. In the previous hero that left a wireframe completely
  missing with nothing reported anywhere.
- A grid item with `margin-inline: auto` **stops stretching and is sized
  shrink-to-fit**. A child SVG at `width: 100%` of that is circular, so the
  browser falls back to the CSS default replaced-element size — 300px. The hero
  illustration silently rendered at 300px on every tablet and phone, with a
  `max-width` of 560px sitting on it doing nothing. `.figureCol` now declares
  `width: 100%` alongside the auto margins; that is load-bearing, not redundant.

**There is no figures band.** `FigureBand` showed four large numbers — 9,000 residents, 3
partners, 4 building blocks, 7 assets — between the About glimpse and Technologies. It was
removed at the client's request on 31 July 2026, along with its `Figure` type and its `figures`
content. It was not wanted, not broken.

If numbers are ever asked for again, the rule it was built under is the one worth keeping: every
figure restated a fact already written elsewhere in `src/content/adflex.ts`, and each carried a
`source` field naming where it came from. **That field was the rule, not documentation** — a
figure that cannot be traced to approved copy does not belong on a publicly funded project site.
`FigureText`, which gives one phrase in a paragraph typographic emphasis, is a different
component and is still in use.

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
   `resolveNavigation(navigation, { onHome: false })`. `/contact` and `/outcomes` are the
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
`about`, `outcomes`, `news` and `contact` are routes of their own — eight items in all.

**The navigation collapses at 1080px.** That breakpoint was measured against nine items, which is
what the header carried until News and Events were merged on 30 July 2026; at eight it now has
room to spare. If you add items back, re-measure — nine still fit on one line at 1100px and wrap
the header to double height by 1024px, so a tenth needs the breakpoint raised in
`AdflexHeader.module.css`. Nothing warns you otherwise; the header just silently doubles in
height at some widths.

The News label is deliberately short ("News") while the page is headed "News & Events", for the
same reason.

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

The hero call to action also goes through this model — `hero.cta.href` is `/outcomes`, and
`AdflexHero` renders it with `NavLink`, so it works whether a future CTA points at a section or
a route.

**Never hard-code navigation hrefs in a page.** Call
`resolveNavigation(navigation, { onHome })` and pass the result down. It prefixes section
anchors with `/` on every route other than the home page, so `#technologies` becomes
`/#technologies` on `/contact` and `/design-system`. Without it, those links would silently do
nothing.

#### Why anchors are never `next/link`

`NavLink` sends **any href containing a `#`** to a plain `<a>`, and only fragment-less routes to
`next/link`. Do not "optimise" that back to client navigation.

For a same-page anchor the reason is the obvious one: the browser does the jump, so the
`scroll-behavior` and `prefers-reduced-motion` rules in globals.css still apply.

For a cross-route anchor the reason is a bug. `resolveNavigation` produces `/#technologies` off
the home page, which does not start with `#`, so it used to go through `next/link`. If a previous
client navigation commits *between* two clicks, the App Router applies the second one by
**appending** its fragment rather than replacing it:

```
/about  →  click Technologies  →  (~300ms)  →  click Home  →  /#technologies#home
```

Click faster and both navigations queue before the first commits, so last-one-wins hides it.
That timing window is why it reads as intermittent, and it moved between 300ms and 350ms across
two runs of the same test — it is a race, not a fixed threshold. A plain `<a>` is an ordinary
browser navigation, so the URL is always exactly the href.

The cost is a full page load when jumping from a sub-page into a home-page section. That is the
right trade for a URL that cannot come out wrong. There is a repro harness in the notes for this
change if the behaviour ever needs re-checking: load a sub-route, click a section link, wait
~300ms, click another, and assert `location.href` contains one `#`.

`SectionShell` applies `scroll-margin-top: calc(var(--adflex-header-height) + space)`. If you
change the header height, change the token — do not hard-code a new offset.

## 8. Verification commands

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run start        # then check /, /about, /outcomes, /contact and /design-system
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
