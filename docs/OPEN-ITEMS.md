# Open items

Things that are unresolved, unsupplied or deliberately outside this first release. Nothing in
this list has been guessed at or filled in with placeholder content on the site.

## Content and contact

| Item | Status |
| --- | --- |
| Demo URL | **Not supplied.** The source copy lists a "Watch Demo (when available)" button. No real demo URL exists, so no such control was built. Add it to `hero` in `src/content/adflex.ts` when a URL is confirmed. |
| Dedicated ADFLEX contact | **Not confirmed.** The site uses the standard IRESI contact block (`info@iresi.eu`, Maynooth University) exactly as supplied. The source copy notes a dedicated ADFLEX contact may replace it. |
| Partner roles, descriptions, logos, URLs, countries | **Not supplied.** Partner cards show the organisation name only. The initials shown are decorative and must not be presented as official logos. |
| Results and publications | **Not final.** The section renders an intentional empty state. No publications, deliverables, dates, DOIs, download links or statistics have been invented. |

## Funding and legal

| Item | Status |
| --- | --- |
| Funding programme | **Not confirmed.** The supplied copy tags the project as "EU-Funded Project" and that tag is shown, but no programme is named anywhere on the site. |
| Grant number | **Not supplied.** |
| Funding disclaimer | **Not supplied.** No disclaimer text has been written or approved, so none is shown. |
| EU emblem | **Not supplied.** The emblem has strict usage rules and no approved file was provided. |
| Legal pages (privacy, cookies, terms) | **Not part of this first build.** No links to them exist, because linking to pages that do not exist would be a broken promise. |

The footer has a reserved bottom row for exactly this content. Funding and legal information can
be added there without redesigning the footer.

## Brand assets

Only a **PNG logo** has been supplied (`ADFLEX_Logo.png`, 3790 × 1148, opaque white background).

Still unavailable:

- Vector (SVG/EPS/AI) logo
- Monochrome variant
- Reversed / dark-background variant
- Favicon and app icons
- Any brand guideline document

None of these may be produced by tracing, redrawing or recolouring the supplied PNG. They have
to come from whoever owns the brand.

**Consequence today:** the site ships without a favicon, so a browser's automatic request for
`/favicon.ico` returns 404. This is visible in the browser console and is expected until an icon
asset is supplied. Once one exists, add it as `src/app/icon.png` and the 404 disappears.

## Imagery

- The supplied system diagram is a wide panorama (1849 × 560). At 375px it renders about 325px
  wide, so its internal labels are small. The brief requires the complete diagram at full width
  with no cropping, so that is what is implemented, and the diagram's concepts are repeated as
  real text beneath it. A mobile-specific diagram, or a zoom/lightbox view, would improve this
  and was not in scope.
- No other project imagery has been supplied. No stock photography has been added.

## Infrastructure and process

| Item | Status |
| --- | --- |
| Hosting and domain | **Not part of this first build.** No deployment configuration, no Docker, no CI. |
| Analytics | **Not part of this first build.** No analytics, tag manager or cookie banner. |
| Content-publishing process | **Not decided.** Copy is edited in `src/content/adflex.ts` and released by committing. Whether a CMS is eventually wanted is an open question — the discovery report discusses WordPress, but that was explicitly out of scope here. |
| Accessibility audit | **Not carried out.** The implementation follows the guardrails in `docs/HANDOVER.md`, but no independent audit has been performed and no formal WCAG conformance is claimed. |
| Automated tests | **None.** Verification is `npm run lint`, `npm run typecheck`, `npm run build` and a manual responsive pass. |
| Multilingual support | **Not part of this first build.** |
