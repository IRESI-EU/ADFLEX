# Content sources

Where everything on the ADFLEX website came from.

**Date integrated: 28 July 2026.**

## Sources used

| File | Role |
| --- | --- |
| `project-inputs/ADFLEX_Website_content.pdf` | **The source of truth for all ADFLEX project copy.** Every heading, paragraph, tag, partner name, pilot description, results statement and contact detail on `/` comes from this document. |
| `project-inputs/ADFLEX_Logo.png` | The official ADFLEX logo for this build. Copied to `public/images/adflex/adflex-logo.png`. |
| `project-inputs/ADFLEX image-3D.png` | The originally supplied project-system diagram. **Superseded** — see "System diagram replacement" below. |
| Replacement system diagram (`hero.png`) | **Supplied by the client on 29 July 2026.** Now in place at `public/images/adflex/adflex-system-concept.png`. |

## System diagram replacement

The diagram in the hero was replaced at the client's request. The replacement is the **same
diagram redrawn in a dark treatment** — not different content:

| | Original (`ADFLEX image-3D.png`) | Replacement (`hero.png`) |
| --- | --- | --- |
| Size | 1849 × 560 (3.30:1) | 1916 × 821 (2.33:1) |
| Treatment | Light background | Dark background |

Every label carries over — Rooftop Solar PV, Heat Pump & Thermal Storage, Community Building,
EV Charger, ESB Networks (DSO), Aggregator (Market Role), Digital Spine middleware, Digital Twin
(Building & Network Model), Main Grid / Import Power — as does the red/blue arrow legend. Because
the content is unchanged, the alt text, the visible caption and the "What the diagram shows" list
were all still accurate and were left as they were.

It replaced the previous file in place rather than being kept in the `public/images/hero/` folder
it arrived in, because it occupies the same slot in the content model (`hero.diagram`). The
originally supplied `ADFLEX image-3D.png` remains untouched in `project-inputs/`.

Kept as PNG rather than re-encoded to JPEG like the photographic imagery: it carries fine light
text on a dark background, where JPEG ringing would be visible. `next/image` still delivers it as
WebP.
| `project-inputs/ADFLEX-Discovery-Report-v0.3(1).docx` | **Background research only.** Nothing from it was implemented. Its WordPress discussion, extended sitemap, multi-phase plan, token pipeline and component inventory are all outside this release's scope. |
| Three partner logo files | **Supplied by the client on 28 July 2026**, placed directly in `public/images/partners/`. See "Partner logos" below. |
| Four technology images | **Supplied by the client on 28 July 2026**, placed directly in `public/images/technologies/`. See "Technology images" below. |
| One pilot image | **Supplied by the client on 28 July 2026**, placed directly in `public/images/pilot/`. See "Pilot image" below. |
| Seven pilot asset icons | **Supplied by the client on 28 July 2026**, placed directly in `public/images/pilot-icons/`. See "Pilot asset icons" below. |
| `ADFLEX Legal Pages/ADFLEX_Legal_Pages_Draft_v2.docx` | **Supplied by the client on 30 July 2026**, replacing a v1 PDF the same day. Terms of Use, Privacy Policy and Cookies Policy. See "Legal pages" below. |

## Legal pages

Three documents in one file, transcribed **verbatim** into `legal.pages` in
`src/content/adflex.ts` on 30 July 2026:

| Document | Route |
| --- | --- |
| Terms of Use | `/legal/terms` |
| Privacy Policy | `/legal/privacy` |
| Cookies Policy | `/legal/cookies` |

Nothing was edited, shortened, reordered, re-worded or tidied. The square-bracketed placeholders
still in the source (`[www.adflex.ie / adflex domain TBC]` and `[month/year]`) are reproduced
exactly, so they stay visible as open questions rather than being quietly filled in.

**Two versions were supplied on the same day.** `ADFLEX_Legal_Pages_Draft_v1.pdf` came first and
was replaced by `ADFLEX_Legal_Pages_Draft_v2.docx`. Both were transcribed and diffed string by
string rather than assumed equivalent: **the only difference is the cookies provider table**, where
v2 replaces the two `TBC` rows with Matomo Analytics and LinkedIn Ireland, and changes
"Maynooth University (adflex.ie)" to "Maynooth University (adflex domain)". Terms of Use and the
Privacy Policy are identical in both.

A note on extraction, since it mattered: the v1 PDF used subset fonts that dropped whole phrases
from a naive text extract. That was caught by checking for gaps rather than trusting the output,
and the text was re-extracted properly. The v2 DOCX was read from its `word/document.xml`, which
preserves headings, list levels and table cells directly.

Two things were decided about presentation, neither of which changes a word:

1. **The text is structured, not markup.** Each document is a list of typed blocks — heading,
   paragraph, list, table — so the wording stays plain data that can be diffed against the source
   line by line. There is no Markdown or HTML parsing anywhere in the pipeline.
2. **Only email addresses and bare `www.` domains become links,** and never inside a square-bracket
   placeholder. Linking `[www.adflex.ie / adflex domain TBC]` would have published a live link to a
   domain that is explicitly not confirmed.

Each page carries a visible notice that it is a draft. The file is marked `Draft_v2` and the
documents still end "version 1.0", and several passages describe behaviour the site does not yet
have — see
[OPEN-ITEMS.md](OPEN-ITEMS.md) for the specific mismatches, which need a client decision.

**The source PDF is not committed.** It sits in `ADFLEX Legal Pages/` alongside the repository, the
same way the other supplied working files are treated.

## Pilot image

**Replaced on 30 July 2026** with a daylight version, as part of the move to the lighter palette.
The current file is `ringsend-pilot.png` (1672 × 941, 2.65 MB), used as supplied — not cropped,
rescaled or recoloured. It is kept at its full source width, because it renders at the full
container width; unlike the technology cards there is no resolution headroom to give away.

The previous version was a dusk scene, supplied as `pilot.png` and re-encoded as JPEG at quality
88 (406 KB) to cut the source weight. The replacement has not been re-encoded, because that is a
decision about a supplied asset rather than a code change — see the note in
[OPEN-ITEMS.md](OPEN-ITEMS.md).

It shows a mixed residential and commercial neighbourhood in daylight with rooftop solar PV, heat
pumps, EV chargers and EVs, overlaid with a connected-network graphic.

**It is an illustration, not a photograph of the pilot site.** This one needs watching more
closely than the technology images: the skyline includes what read as the Poolbeg chimneys, which
places it visually in Ringsend, and it sits directly above the real pilot description. Nothing on
the site describes it as a photograph, and its `alt` is empty so it is not announced as one — but
if that inference is unwanted, replace it with a genuine photograph of the pilot area or drop it.

## Pilot asset icons

Seven images supplied for the "Assets and programmes involved" list, one per item, keeping the
kebab-case filenames established for the previous set:

| File | Asset |
| --- | --- |
| `heat-pumps.png` | Heat pumps |
| `ev-charging.png` | Electric vehicles and EV charging |
| `solar-pv.png` | Solar PV |
| `combined-heat-and-power.png` | Combined heat and power |
| `digital-spine.png` | Digital Spine |
| `arden-energy-platform.png` | Arden Energy's platform |
| `esb-networks.png` | ESB Networks' Beat the Peak programme |

**Replaced on 30 July 2026.** The replacements are **not icons**: each is a 1536 × 1024
illustration on its own opaque ground, roughly 2.2 MB (15.6 MB in total). The previous set was
small trimmed glyphs on transparency, downscaled to a 160 px longest side (284 KB in total).

That difference forced a layout change rather than a file swap. The old list put a 56 px square
tile beside each label; a 3:2 illustration in a square tile letterboxes to an unreadable sliver,
and these carry their own dark grounds so the light tile was wrong as well. The asset list is now
a card grid with the illustration above the label, at the artwork's own 3:2 ratio. They are used
exactly as supplied — not cropped, trimmed, downscaled or recoloured.

They render about 270 px wide, so 2.2 MB of source produces a ~20 KB served image. See the
source-weight note in [OPEN-ITEMS.md](OPEN-ITEMS.md).

They are illustrative, and each `alt` is empty because the asset name sits directly under the
image. Note the ESB Networks and Arden Energy images are generic illustrations — **neither is
that organisation's logo**, and neither should be presented as one.

## Technology images

Four illustrative renders supplied by the client, numbered `1.png`–`4.png`. The numbering
matched the order of the technologies in the content file, and each image's subject confirmed
the mapping:

| File as supplied | Mapped to | Subject |
| --- | --- | --- |
| `1.png` | Digital Spine middleware | Devices — house with PV, heat pump, battery, EV charger, servers — connected into a central data hub |
| `2.png` | Digital twin | Real buildings transitioning into a glowing wireframe replica |
| `3.png` | Smart tariffs and dynamic pricing | Phone showing a price gauge, a demand curve and per-device sliders |
| `4.png` | Shared data standards and data spaces | Shield and padlock over a cloud, with homes, grid and analysts exchanging data |

**Replaced on 30 July 2026** with light-toned versions, as part of the move to the lighter
palette. The current files are 1672 × 941 PNGs (~2 MB each, 7.9 MB total), used exactly as
supplied — not cropped, rescaled, recoloured or re-encoded.

The aspect ratio is unchanged from the previous set, so only the file extension and the declared
dimensions in `src/content/adflex.ts` had to change. Their loading placeholder was switched from
dark to light, because the new artwork is light (mean luminance 198–225 of 255) and a dark
placeholder would have flashed before each image painted.

The previous set was the same four subjects in dark tones, downscaled and re-encoded to
1400 × 788 JPEG at quality 88 (~780 KB total) to cut source weight. The replacements have not
been re-encoded — see the source-weight note in [OPEN-ITEMS.md](OPEN-ITEMS.md).

These are **illustrations, not project evidence**. They depict generic energy-system concepts and
must not be read as photographs of the Ringsend pilot or as diagrams of the ADFLEX architecture —
the supplied system diagram on the home page is the only diagram of the actual project. Their
`alt` is empty because each card's heading and description already state the concept in full.

## Partner logos

Supplied by the client, not sourced by the build. Provenance beyond "the client provided them"
is not recorded here — see [OPEN-ITEMS.md](OPEN-ITEMS.md) for the outstanding clearance note.

| Partner | File | As supplied | In the repo |
| --- | --- | --- | --- |
| Maynooth University | `maynooth.jfif` | 594 × 315 JPEG, white background | `maynooth-university.png`, 436 × 197 |
| University College Dublin | `ucd.png` | 300 × 300 PNG, transparent | `university-college-dublin.png`, 182 × 263 |
| Arden Energy | `Arden-Energy.png` | 305 × 160 PNG, transparent | `arden-energy.png`, 302 × 71 |

Two changes were made to the files, both mechanical:

1. **Renamed** to match the partner `id` in `src/content/adflex.ts`. The Maynooth file also
   changed extension: `.jfif` is a standard JPEG (verified by its `FF D8 FF` header) but the
   extension is not reliably served with a correct content type, so it was re-saved as PNG.
2. **Blank canvas trimmed.** Each file arrived with a different amount of empty margin around
   the mark — the actual logos filled 42%, 59% and 86% of their canvas height respectively,
   which made them render at wildly different visual sizes in the same row. The canvas was
   cropped to the content bounding box plus a 2px bleed.

**The marks themselves were not altered** — nothing was rescaled, recoloured, redrawn, traced,
cropped into, or otherwise modified. Only surrounding blank space was removed. The originals as
supplied are unmodified in the client's own source.

## What was and was not done with the copy

- All project copy is stored in `src/content/adflex.ts` and used verbatim or near-verbatim from
  the website-content PDF.
- **No ADFLEX facts were invented.** No statistics, timelines, outcomes, partner roles, partner
  descriptions, publications, deliverables, dates, DOIs, funding programmes, grant numbers or
  contact people have been added beyond what the PDF supplies.
- The "Watch Demo (when available)" button described in the PDF was **not** built, because no
  demo URL was supplied. Only "See Pilot Results" is rendered.
- **The flexumer definition departs from the supplied instruction.** The PDF specifies it as
  "smaller, muted text directly beneath the tagline — *not a tooltip or footnote, since those get
  missed*". At the client's request after the first build, it was moved inline: "flexumers" in the
  tagline is now an interactive term that reveals the definition. The **wording is unchanged**;
  only its placement differs. The original concern — that people miss tooltips — still stands, and
  reverting is a content-file change (see `hero.glossary` in `src/content/adflex.ts`).
- The contact details are the standard IRESI ones given in the PDF. The PDF notes these may be
  replaced by a dedicated ADFLEX contact; that has not been confirmed. They are presented on
  their own `/contact` route rather than as a section of the home page, at the client's request
  after the first build.
- The About content is split across two places at the client's request. The `/about` route
  carries all three items (Objective, Impact, Our role) in full. The home page shows a glimpse of
  the **Objective** item only, under the heading "Objective of ADFLEX", and links through.
  **The glimpse is a verbatim extract** — the opening sentence of the supplied paragraph, cut but
  not rewritten — so no condensed or paraphrased ADFLEX wording exists anywhere on the site.
  "Objective of ADFLEX" is a section heading written for this build, not supplied copy.
- The section the PDF calls "Results & publications" renders its status wording as an intentional
  empty state, on its own `/outputs` route rather than as a section of the home page, at the
  client's request after the first build. No placeholder publications were created.
- **It is presented under a different name.** At the client's request it is headed "Project
  Outputs" and appears in the navigation as "Outputs", rather than the PDF's "Results &
  publications". Only the heading and the navigation label changed — the supplied paragraph is
  unaltered and still opens "Results and publications from ADFLEX are still being finalised…".
- Because that section moved off the home page, the hero's "See Pilot Results" button now points
  at `/outputs`. Its label is the supplied wording and is unchanged.

### Figures on the site

There is **no statistics block.** An earlier build had a three-number strip on the home page; it
was removed at the client's request on 29 July 2026, and the numbers are now picked out
typographically where they already occur in the supplied sentences:

| Where | Phrase emphasised |
| --- | --- |
| Technologies intro | "Four building blocks" |
| Consortium intro | "three partners" |
| Pilot narrative | "around 9,000 residents" |

Each phrase is verbatim supplied copy — the emphasis is purely visual and adds no wording. The
community size is the only hard number ADFLEX has supplied. No emissions, savings, participation
or performance figures appear anywhere on the site, because none has been supplied.

### Text that is not from the PDF

Seven short pieces of connective copy were written for this build. They add no project facts:

1. The technologies section lead: *"Four building blocks make local energy flexibility workable
   for a community rather than only for a single building."*
2. The contact page lead: *"For questions about ADFLEX, please get in touch."*
3. The `/contact` meta description: *"Contact details for the ADFLEX project at Maynooth
   University."*
4. The `/outputs` meta description: *"Project outputs from ADFLEX, updated as findings,
   deliverables and papers become available."*
5. The home page section heading *"Objective of ADFLEX"* and the button label *"Know more about
   ADFLEX"*.
6. The `/about` meta description: *"What ADFLEX sets out to do, the impact it aims for, and the
   Digital Spine and digital twin at the core of the project."*
7. The pilot side panel heading *"Assets and programmes involved"* and its list, which names
   only assets and programmes already stated in the PDF's pilot paragraph (heat pumps, EVs and
   EV charging, solar PV, combined heat and power, the Digital Spine, Arden Energy's platform
   and ESB Networks' Beat the Peak programme).

### Removed: the "What the diagram shows" list

A list beneath the hero diagram used to repeat the labels printed inside it — community building,
rooftop solar PV, heat pump and thermal storage, EV charging, Digital Spine middleware, digital
twin (building and network model), aggregators (market role), ESB Networks (DSO), main grid /
import power. It was **removed at the client's request on 29 July 2026**; it is recorded here so
the wording is not lost.

It existed because the supplied brief asked that the diagram's concepts also be available as real
text rather than only as pixels. With it gone, the diagram's `alt` text is the only place its
parts are named. That still covers screen-reader users, but the labels inside the image are not
legible at phone width, so a sighted phone user can no longer read what the diagram contains.

All documentation copy on `/design-system` lives in `src/content/design-system.ts` and describes
this implementation only. It contains no ADFLEX project facts.

## Runtime and version control

- `project-inputs/` is listed in `.gitignore`. The supplied PDF and DOCX are **not committed**.
- Nothing under `project-inputs/` is referenced at runtime. The application only loads the
  production copies under `public/images/adflex/`, which are committed.
- The two production images are byte-for-byte copies of the supplied files. Neither has been
  edited, recoloured, cropped or resampled on disk; display sizing is done in CSS.

## Alt text in use

- Logo: *"ADFLEX — Local Energy Flexibility"*
- System diagram: *"ADFLEX system concept showing a community building with solar PV, heat pump,
  thermal storage and EV charging connected through Digital Spine middleware and a digital twin
  to aggregators, ESB Networks and the main grid. Red arrows show power flow and blue arrows
  show data and control signals."*
