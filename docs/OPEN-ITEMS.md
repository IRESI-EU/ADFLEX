# Open items

Things that are unresolved, unsupplied or deliberately outside this release. Nothing in this list
has been guessed at or filled in with placeholder content on the site.

## Structure built, content awaited

These routes and controls now exist and can be reviewed. Each shows a visible empty or inactive
state rather than sample content, and each becomes live by editing
`src/content/adflex.ts` — no code change.

| Item | Route / component | What is needed |
| --- | --- | --- |
| News & Updates | `/news` | Approved posts |
| Events | `/events` | Confirmed events |
| Privacy Policy | `/legal/privacy` | **Approved legal text.** A specimen policy must not be published — it would be a false statement about how personal data is handled |
| Cookie Policy | `/legal/cookies` | Approved legal text. Tie this to the analytics decision below |
| Terms of Use | `/legal/terms` | Approved legal text |
| Contact form | `ContactForm` | A backend or form service. **All controls are disabled** until submissions have somewhere to go |
| Newsletter sign-up | `NewsletterSignup` | A mailing-list provider **and** a published privacy policy. Button disabled until both exist |
| LinkedIn link | `AdflexFooter` | **The page URL.** Set `footer.linkedin.href`. Until then the block renders as muted, dashed, non-interactive text rather than a dead link |
| Funding row | `AdflexFooter` | Approved statement and emblem. Set `footer.funding`; the row is not rendered at all while it is `null`. See *Funding and legal* below |

**The LinkedIn mark is drawn, not supplied.** The glyph in `AdflexFooter.tsx` is an inline SVG
rendition, because an external icon package is out of scope for this build. LinkedIn publishes
official brand assets and usage rules; if the project wants to follow them to the letter, supply
the file alongside the URL and swap it in.

**Both News and Events are in the main navigation.** That makes two empty pages reachable from
every page of the site — fine while the team is reviewing, but before launch they need either
real content or removal from `navigation`, otherwise public visitors hit dead ends from the
header.

## Imagery that does not fit the lighter palette

The palette moved to white, mild grey and the logo green on 30 July 2026, and dark mode was
restored at the same time. The supplied artwork was drawn for the previous dark-navy design, so
some of it now sits awkwardly. None of this blocks review — each is handled deliberately rather
than left broken — but each would be better solved with a new file.

| Asset | Problem now | What would fix it |
| --- | --- | --- |
| `adflex-logo.png` | **Opaque white background, no alpha channel at all.** It cannot sit on any dark colour, so the header and footer give it a white plate. In dark mode that plate is a visible white badge. | A **transparent PNG or SVG**, ideally with a reversed (light-on-dark) variant. Then the plate can be deleted and the mark can sit directly on the surface in both themes. |
| `adflex-system-concept.png` | Dark navy artwork on an opaque background. In the light theme it reads as a heavy dark plate in the middle of a light page. It is framed deliberately so it looks intentional. | A **light-background version** of the same diagram, with the same labels and the same red/blue arrow meanings. Keep the dark one if a per-theme pair is wanted later. |
| `pilot-icons/*.png` | Dark navy line art (measured mean luminance 54–106 of 255). They need a light ground, so their tiles are pinned light in both themes. | Fine as they are. Only revisit if a light-on-dark icon set is supplied, in which case the tile pinning must be revisited too. |
| `technologies/*.jpg`, `pilot/ringsend-pilot.jpg` | Dark photography. These work in both themes and need nothing. | — |

When the new images arrive, the fixed grounds to revisit are the `--adflex-plate-*` tokens in
`src/styles/adflex-tokens.css`. They exist precisely so this is a token change rather than a hunt
through component CSS.

## Content and contact

| Item | Status |
| --- | --- |
| Demo URL | **Not supplied.** The source copy lists a "Watch Demo (when available)" button. No real demo URL exists, so no such control was built. Add it to `hero` in `src/content/adflex.ts` when a URL is confirmed. |
| Dedicated ADFLEX contact | **Not confirmed.** The site uses the standard IRESI contact block (`info@iresi.eu`, Maynooth University) exactly as supplied. The source copy notes a dedicated ADFLEX contact may replace it. |
| Partner roles, descriptions, URLs, countries | **Not supplied.** Partner cards show the logo and the organisation name only. |
| Partner logo clearance | **Not confirmed.** The logo files were supplied by the client on 28 July 2026 and are live on the site. Written confirmation from each partner that their mark may be used on the ADFLEX website has not been recorded here — worth closing off before launch. |
| Partner logos in vector | **Not supplied.** All three are raster (PNG). Vector versions would be better for print and very high-DPI screens. |
| Project outputs | **Not final.** `/outputs` renders an intentional empty state. No publications, deliverables, dates, DOIs, download links or statistics have been invented. |

### Partner logo notes

The files in `public/images/partners/` are raster PNGs at modest resolution (182–436px wide).
The image optimizer caps its output at the source width, so that resolution is the ceiling on
how sharp they can look on a high-DPI screen. UCD's crest in particular is only 182px wide. If
any partner can supply SVG or a larger PNG, take it.

Each partner controls its own mark, and the two universities publish rules that constrain use:

- **Maynooth University** — [brand guidelines](https://www.maynoothuniversity.ie/sites/default/files/assets/document/M12454%20MU%20Brand%20Guidelines%202021%20AW.pdf)
  state the crest and the wordmark are integral and cannot be separated. Master artwork comes
  from the Communications & Marketing Office.
- **University College Dublin** — the crest and lockups cannot be altered or redesigned; artwork
  is issued via [UCD Brand Identity](https://www.ucd.ie/universityrelations/marketing/brandidentity/ucdbrandguidelines/)
  / `communications@ucd.ie`.
- **Arden Energy** — [ardenenergy.ie](https://www.ardenenergy.ie/).

If a logo ever needs replacing, get the file from the partner or the project coordinator. **Do
not** substitute one from a search result or a logo aggregator (Brandfetch, Seeklogo, Brands of
the World and similar) — those are frequently the wrong lockup, out of date, or re-hosted
without rights.

## Funding and legal

| Item | Status |
| --- | --- |
| Funding programme | **Not confirmed.** The supplied copy tags the project as "EU-Funded Project" and that tag is shown, but no programme is named anywhere on the site. |
| Grant number | **Not supplied.** |
| Funding disclaimer | **Not supplied.** No disclaimer text has been written or approved, so none is shown. |
| EU emblem | **Not supplied.** The emblem has strict usage rules and no approved file was provided. |
| Legal pages (privacy, cookies, terms) | **Routes built, text not written.** Linked from the footer; each page states that the policy is not published yet. See the table at the top. |

The footer now has a **dedicated funding row**, reserved and already styled, sitting between the
logo row and the legal row. It renders nothing while `footer.funding` is `null`. Setting
`{ statement, emblem? }` in `src/content/adflex.ts` publishes it with no layout change. Use the
approved wording verbatim rather than a paraphrase.

## Brand assets

Only a **PNG logo** has been supplied (`ADFLEX_Logo.png`, 3790 × 1148, opaque white background).

Still unavailable:

- Vector (SVG/EPS/AI) logo
- **A transparent version** — the supplied file has no alpha channel, which is why the header and
  footer have to put it on a white plate. This is now the highest-value missing asset, because it
  is the one thing standing between dark mode and a clean logo treatment.
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
