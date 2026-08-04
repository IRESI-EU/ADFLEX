# Open items

Things that are unresolved, unsupplied or deliberately outside this release. Nothing in this list
has been guessed at or filled in with placeholder content on the site.

## Structure built, content awaited

These routes and controls now exist and can be reviewed. Each shows a visible empty or inactive
state rather than sample content, and each becomes live by editing
`src/content/adflex.ts` — no code change.

| Item | Route / component | What is needed |
| --- | --- | --- |
| News & Events | `/news` | Approved posts and confirmed events. One route since 30 July 2026 — News and Events were merged, because two empty pages in the navigation gave a visitor two dead ends instead of one |
| Privacy Policy | `/legal/privacy` | ✅ Draft text published 30 July 2026. **Still a draft** — see *Legal pages* below |
| Cookies Policy | `/legal/cookies` | ✅ Draft text published 30 July 2026. **Still a draft** — see *Legal pages* below |
| Terms of Use | `/legal/terms` | ✅ Draft text published 30 July 2026. **Still a draft** — see *Legal pages* below |
| Contact form | `ContactForm` | ✅ **Live 31 July 2026.** Submissions are stored in Postgres and read at `/admin/messages`. Reverts to disabled automatically on a deployment with no database |
| LinkedIn link | `AdflexFooter` | **The page URL.** Set `footer.linkedin.href`. Until then the block renders as muted, dashed, non-interactive text rather than a dead link |
| Funding row | `AdflexFooter` | ⚠️ **Partly filled 31 July 2026** — it now reads "Funded by SEAI." at the client's instruction. Still outstanding: the programme name as approved footer wording, the grant number, a disclaimer and an SEAI emblem file. See *Funding and legal* below |
| Project outputs | `/outputs` | ✅ **Editor-managed since 31 July 2026.** Findings and publications are published from `/admin/outputs`. The empty state remains the default until something is published |
| News & Events content | `/news` | ✅ **Editor-managed since 31 July 2026**, published from `/admin/news` |

**The LinkedIn mark is drawn, not supplied.** The glyph in `AdflexFooter.tsx` is an inline SVG
rendition, because an external icon package is out of scope for this build. LinkedIn publishes
official brand assets and usage rules; if the project wants to follow them to the letter, supply
the file alongside the URL and swap it in.

**News & Events is in the main navigation and is still empty.** That makes one empty page
reachable from every page of the site — fine while the team is reviewing, but before launch it
needs either real content or removal from `navigation`, otherwise public visitors hit a dead end
from the header.

**The newsletter sign-up was removed on 30 July 2026** at the team's request. The block, its
content and the `.adflex-accent` band it was the only user of are all gone. Note that the
supplied Privacy Policy still describes newsletter subscription — see below.

## Imagery

The palette moved to white, mild grey and the logo green on 30 July 2026, and the artwork was
replaced the same day to suit it. Almost everything is now resolved.

| Asset | Status | Outstanding |
| --- | --- | --- |
| `adflex-system-concept.png` | ✅ **Replaced.** Light background, 1134 × 561 (was 1916 × 821 dark navy). Declared dimensions and alt text updated to match. | — |
| `technologies/*.png` | ✅ **Replaced.** Light artwork, 1672 × 941 (was 1400 × 788 dark JPEGs). Same 16:9 ratio, so only the extension and the declared dimensions changed. Loading placeholder switched dark → light. | — |
| `pilot-icons/*.png` | ✅ **Replaced.** These are no longer icons: 1536 × 1024 illustrations on their own opaque grounds. The asset list was rebuilt from glyph-beside-label rows into cards with a 3:2 image above the label, because a 56 px square tile letterboxed them into an unreadable sliver. | — |
| `pilot/ringsend-pilot.png` | ✅ **Replaced.** Daylight version. Reference updated `.jpg` → `.png`, placeholder switched dark → light. | — |
| `adflex-logo.png` | **Opaque white background, no alpha channel at all.** It cannot sit on any colour, so the header and footer give it a white plate. Harmless today, because those surfaces are white anyway. | A **transparent PNG or SVG**. Then the plate can be deleted and the mark can sit directly on any surface. |

The fixed grounds behind artwork are the `--adflex-plate-*` tokens in
`src/styles/adflex-tokens.css`. They exist precisely so a future swap is a token change rather
than a hunt through component CSS.

### Source image weight — worth a decision

`public/images/` is now **28 MB**, almost all of it artwork that renders small:

| Folder | Files | Source | Rendered at | Served to a visitor |
| --- | --- | --- | --- | --- |
| `pilot-icons/` | 7 | **15.6 MB** | ~270 px wide | ~20 KB each |
| `technologies/` | 4 | **7.9 MB** | ~560 px wide | ~147 KB each |
| `pilot/` | 2 | 3.1 MB | ~620 px wide | ~154 KB |
| `adflex/` | 2 | 1.4 MB | full width | ~259 KB |

**Visitors are not affected.** `next/image` re-encodes everything to WebP at the size actually
needed, so nobody downloads a 2.2 MB PNG. The cost lands on the repository, on clone time and on
every Netlify build.

The pilot icons are the clear outlier: 2.2 MB of source each to produce a 20 KB rendered image.
Re-encoding those alone would recover roughly 15 MB. It has not been done, because re-encoding a
supplied asset is a decision about someone else's file rather than a code change — ask first.

**There is also an unused file.** `public/images/pilot/ringsend-pilot2.jpg` (405 KB, the dusk
version) sits beside the daylight image that is actually in use. It is deliberately left
uncommitted. Either delete it or commit it as a documented alternative, but it should not stay an
untracked stray.

**Swapping an image is not only a file swap.** `next/image` needs the real pixel dimensions, and
they are declared in `src/content/adflex.ts`, not read from the file. If a replacement has a
different aspect ratio and the declared `width`/`height` are left alone, the image is drawn
distorted and the space reserved for it is wrong. Check the alt text at the same time: for the
system diagram the alt **is** the content, because the diagram's own labels are not legible at
phone width and are not repeated as visible text. When the diagram was replaced on 30 July its
labels changed — thermal storage became an immersion heater, and the solar PV gained a battery —
so the alt text was rewritten to match what the new artwork actually shows.

**Dark mode has been built and removed twice** — 29 July and again 30 July 2026, both at the
client's request. The site is light-only. If it is asked for a third time, read the dark mode
section of [HANDOVER.md](HANDOVER.md) first: the toggle cannot be added without the palette (or
removed without it), and the opaque logo files are the real constraint.

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
| Funder | ✅ **Confirmed 30 July 2026: SEAI.** The hero tag now reads "SEAI-Funded Project". It previously read "EU-Funded Project", which was wrong — the supplied legal text states the project is "funded by SEAI under the National Energy RD&D Funding Programme". |
| Funding statement | ⚠️ **"Funded by SEAI." published 31 July 2026** at the client's instruction. Every word of it is confirmed; it is simply the shortest true statement, chosen over a longer sentence assembled from the privacy policy. |
| Funding programme | **Named in the legal text** as the National Energy RD&D Funding Programme, and still **not shown on the site**. It belongs in the footer statement, which needs approved wording rather than a sentence assembled from the privacy policy. Extending `footer.funding.statement` needs no layout change. |
| Grant number | **Not supplied.** |
| Funding disclaimer | **Not supplied.** No disclaimer text has been written or approved, so none is shown. |
| SEAI / EU emblem | **Not supplied.** Emblems have strict usage rules and no approved file was provided. `footer.funding.emblem` is built and unused — setting it publishes the artwork beside the statement with no layout change. |
| Legal pages (privacy, cookies, terms) | **Draft text published** 30 July 2026 from `ADFLEX_Legal_Pages_Draft_v2.docx`. See *Legal pages* below for what is still open in it. |

The footer now has a **dedicated funding row**, reserved and already styled, sitting between the
logo row and the legal row. It renders nothing while `footer.funding` is `null`. Setting
`{ statement, emblem? }` in `src/content/adflex.ts` publishes it with no layout change. Use the
approved wording verbatim rather than a paraphrase.

## Legal pages

The three legal pages carry the wording supplied in
`ADFLEX Legal Pages/ADFLEX_Legal_Pages_Draft_v2.docx` (30 July 2026), transcribed **verbatim** into
`legal.pages` in `src/content/adflex.ts`. Nothing was edited, shortened, reordered or tidied.

Every page shows a notice above the text saying it is a draft, so no reader mistakes it for
settled policy.

**v1 → v2.** The pack was first supplied as `ADFLEX_Legal_Pages_Draft_v1.pdf` and replaced the same
day by the v2 DOCX. Diffed string by string, **the only change is the cookies provider table** —
Terms of Use and the Privacy Policy are identical in both. The table's two `TBC` placeholders are
now filled in:

| v1 | v2 |
| --- | --- |
| `Maynooth University (adflex.ie)` | `Maynooth University (adflex domain)` |
| `[Analytics tool TBC]` · Visitor statistics; requires consent | **Matomo Analytics** · Visitor statistics and usage measurement; requires consent |
| `[Any embedded platforms TBC, e.g. LinkedIn, YouTube]` · Embedded content functionality | **LinkedIn Ireland** · Enables interaction with embedded LinkedIn content |

### It is a draft, and it says so

The file is named `Draft_v2` and the documents still end "version 1.0". **Publishing this to a
public URL publishes draft legal text.** That is a decision for whoever carries the liability, not
a technical one. If it should not be public yet, say so and the pages go back to the empty state.

### Placeholders still left exactly as supplied

Two remain. They are rendered as-is rather than guessed at, and the renderer deliberately **does
not turn anything inside brackets into a link** — an unconfirmed domain must not become a live
link:

| Placeholder | Where | Needed |
| --- | --- | --- |
| `[www.adflex.ie / adflex domain TBC]` | Terms of Use, Purpose | The confirmed public domain |
| `[month/year]` | Privacy and Cookies, "Last reviewed" | The review date, twice |

Terms of Use has **no "Last reviewed" line at all**, where Privacy and Cookies both do. That is how
the source reads; it was not added.

### One inconsistency inside v2 itself

The Cookies Policy's prose still reads *"(Tool to be confirmed once the site is built, e.g. Matomo
or Google Analytics — to be listed here by name once chosen…)"*, while the table two paragraphs
later names **Matomo Analytics** outright. The table was updated in v2 and that sentence was not.
Both are reproduced as supplied; the sentence is the client's to remove.

### Where the draft does not match the site as built

These are factual mismatches between the supplied wording and what the site actually does. None is
a code problem — the text is the client's to change — but each is a statement a reader could hold
the project to, so each needs a decision.

| The draft says | The site actually |
| --- | --- |
| Cookies Policy: "When you first visit the Site, a cookie notice lets you accept all cookies, or click Configure…" | Has **no cookie banner** and sets **no cookies at all**. There is no consent mechanism of any kind. |
| Cookies Policy names **Matomo Analytics** as a provider whose cookies require consent | **Matomo is not installed.** No analytics of any kind runs on the site. |
| Cookies Policy names **LinkedIn Ireland** for "embedded LinkedIn content" | **There is no embedded LinkedIn content.** The footer's LinkedIn block is not even a link yet — its URL has not been supplied. |
| Privacy Policy 2.2: "Newsletter subscription: we ask only for your email address" | Has **no newsletter**. The sign-up block was removed on 30 July 2026 at the team's request. |
| Privacy Policy 3.2: "Inform you of project news… if you have subscribed to updates" | There is nothing to subscribe to. |
| Privacy Policy 2.1: "we collect your email address, name, subject, and message content" via the contact form | ✅ **Now true.** The form went live on 31 July 2026 and stores exactly those four fields. This is the one mismatch the admin closed rather than widened — but note it closed by making the *site* match a **draft** policy, so the wording still needs signing off before either goes public. See [ADMIN.md](ADMIN.md) §6. |

**v2 made this sharper, not softer.** Where v1 said "analytics tool TBC", v2 names Matomo and
LinkedIn specifically. A policy that names the exact tools setting cookies on a site that sets none
is a more concrete claim than a placeholder was.

The cleanest reading is that the pack describes the site as it is *intended* to be rather than as
it is *today*. That is fine if the policies go live at launch alongside a cookie banner, Matomo and
whatever LinkedIn embed is planned. It is **not** fine if they go public now, because a privacy
policy describing collection that does not happen is inaccurate in the direction that matters.

Three ways forward, all the client's call:

1. Hold the legal pages back until the site catches up.
2. Have the wording adjusted to describe the site as built.
3. Build what the policy describes — a cookie banner, Matomo behind consent, and the LinkedIn
   embed — so the document becomes true. That is a real piece of work and has not been scoped.

## Brand assets

Only a **PNG logo** has been supplied (`ADFLEX_Logo.png`, 3790 × 1148, opaque white background).

Still unavailable:

- Vector (SVG/EPS/AI) logo
- **A transparent version** — the supplied file has no alpha channel, which is why the header and
  footer have to put it on a white plate, and why it can never be placed on a coloured surface.
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
| Hosting and domain | ⚠️ **Changed 31 July 2026.** The site is **no longer a static export** — `/admin/*`, `/outputs`, `/news`, `/contact` and `/media/[id]` are server-rendered, so the host must run Node and carry `DATABASE_URL` and `SESSION_SECRET`. A Postgres database (Neon or Supabase) has **not been created**; until one is, the public site works exactly as before and the admin shows a setup notice. See [ADMIN.md](ADMIN.md). |
| Analytics | **Not part of this first build.** No analytics, tag manager or cookie banner. |
| Content-publishing process | ⚠️ **Now split.** Findings, publications, news and events are editor-managed at `/admin`. **Everything else** — hero, About, Technologies, Consortium, Pilot, contact details, footer and all three legal pages — is still edited in `src/content/adflex.ts` and released by committing. Whether the rest should move too is open. |
| Automated tests for the admin | **None committed.** The SQL (16 checks) and the browser flows (33 checks) were both exercised for real when this was built, but those harnesses lived in a scratch directory and are not in the repository. A change to `src/lib/repo.ts` or `src/app/admin/` has no regression net. |
| Admin accounts | **None created** on any real database. `npm run db:user` creates them; there is no self-service sign-up and no web password reset, by design. |
| Accessibility audit | **Not carried out.** The implementation follows the guardrails in `docs/HANDOVER.md`, but no independent audit has been performed and no formal WCAG conformance is claimed. |
| Automated tests | **None.** Verification is `npm run lint`, `npm run typecheck`, `npm run build` and a manual responsive pass. |
| Multilingual support | **Not part of this first build.** |
