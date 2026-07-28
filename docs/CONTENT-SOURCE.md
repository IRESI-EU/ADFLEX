# Content sources

Where everything on the ADFLEX website came from.

**Date integrated: 28 July 2026.**

## Sources used

| File | Role |
| --- | --- |
| `project-inputs/ADFLEX_Website_content.pdf` | **The source of truth for all ADFLEX project copy.** Every heading, paragraph, tag, partner name, pilot description, results statement and contact detail on `/` comes from this document. |
| `project-inputs/ADFLEX_Logo.png` | The official ADFLEX logo for this build. Copied to `public/images/adflex/adflex-logo.png`. |
| `project-inputs/ADFLEX image-3D.png` | The supplied project-system diagram. Copied to `public/images/adflex/adflex-system-concept.png`. |
| `project-inputs/ADFLEX-Discovery-Report-v0.3(1).docx` | **Background research only.** Nothing from it was implemented. Its WordPress discussion, extended sitemap, multi-phase plan, token pipeline and component inventory are all outside this release's scope. |

## What was and was not done with the copy

- All project copy is stored in `src/content/adflex.ts` and used verbatim or near-verbatim from
  the website-content PDF.
- **No ADFLEX facts were invented.** No statistics, timelines, outcomes, partner roles, partner
  descriptions, publications, deliverables, dates, DOIs, funding programmes, grant numbers or
  contact people have been added beyond what the PDF supplies.
- The "Watch Demo (when available)" button described in the PDF was **not** built, because no
  demo URL was supplied. Only "See Pilot Results" is rendered.
- The contact block uses the standard IRESI details given in the PDF. The PDF notes these may be
  replaced by a dedicated ADFLEX contact; that has not been confirmed.
- Results & Publications renders the PDF's status wording as an intentional empty state. No
  placeholder publications were created.

### Text that is not from the PDF

Three short pieces of connective copy were written for this build. They add no project facts:

1. The technologies section lead: *"Four building blocks make local energy flexibility workable
   for a community rather than only for a single building."*
2. The contact section lead: *"For questions about ADFLEX, please get in touch."*
3. The pilot side panel heading *"Assets and programmes involved"* and its list, which names
   only assets and programmes already stated in the PDF's pilot paragraph (heat pumps, EVs and
   EV charging, solar PV, combined heat and power, the Digital Spine, Arden Energy's platform
   and ESB Networks' Beat the Peak programme).

The list of concepts shown beneath the hero diagram repeats labels that appear **inside the
supplied diagram image** (community building, rooftop solar PV, heat pump and thermal storage,
EV charging, Digital Spine middleware, digital twin, aggregators, ESB Networks, main grid). It
exists so that information carried by the image is also available as real text.

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
