# ADFLEX content provenance and approval rules

This file records the rules for deciding what may appear on the public ADFLEX website. Git history preserves older implementation notes; this document describes the current production model.

## Primary project content

Long-lived website copy lives in `src/content/adflex.ts`. It originated from project material supplied to the website build and has been amended only when the project team supplied or approved changes.

Do not infer new ADFLEX facts from generic illustrations, internal drafts, code comments or external search results.

## Time-varying published content

News, events, findings and publications live in `src/content/published.ts` and are published from information explicitly supplied or approved by the project team.

Before adding an item, confirm the factual fields that make it public: dates, location, authors, DOI, result statements, booking links and similar details. Optional fields should remain empty when they have not been supplied.

## Media and documents

- Long-lived site artwork and partner marks live under `public/images/`.
- Media and documents associated with news/events/findings/publications live under `public/content/`.
- Files under `public/` are public after merge. Do not commit confidential material or personal data.
- Partner logos must come from the partner/project team or another explicitly approved official source. Do not substitute logo-aggregator artwork.
- Preserve the supplied mark. Do not trace, recolour or redesign partner logos unless an approved replacement is provided.

### Arden Energy logo

The current `public/images/partners/arden-energy.png` is the full-colour Arden Energy logo supplied to the project team and uploaded on 14 August 2026. Its source image dimensions are 2560 × 1252.

## Legal content

The legal pages are project-supplied text and may contain open placeholders or draft wording. Do not silently resolve legal wording, analytics/cookie claims, domains, review dates or liability statements. Those require project-owner approval.

## Funding and partner claims

Funding programme wording, grant numbers, disclaimers, partner roles and similar claims must be supplied/approved before publication. Visual space in the website is not permission to fill a missing fact.

## Editorial principle

An honest empty state is preferable to invented content. If information is not yet approved, leave it unpublished and record the missing input in `docs/OPEN-ITEMS.md` when it affects planned public content.