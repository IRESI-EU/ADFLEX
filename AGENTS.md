<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ADFLEX website agent instructions

## Architecture invariant

This repository is the source of truth for the public ADFLEX website.

- The production site is a static Next.js export deployed to GitHub Pages.
- Git is the content store and audit trail.
- There is no production admin dashboard, PostgreSQL CMS, server-side media store, or runtime publishing API.
- Codex or another coding agent may prepare repository changes, but the public website must remain fully usable without any AI service at runtime.
- Prefer the smallest safe change. Do not introduce a CMS, database, API, authentication layer, or new hosting service unless the project owner explicitly asks for one.

## Content locations

There are two public content sources and they must stay separate.

1. `src/content/adflex.ts`
   - Long-lived project copy and configuration: navigation, About, technologies, consortium, pilot, contact details, legal text and funding information.
   - Change this only when the project team supplies or approves a factual update.

2. `src/content/published.ts`
   - Time-varying public entries: news, events, project findings and publications.
   - This is the normal publishing surface for project updates.

Associated images and downloadable files for published entries belong under `public/content/`, using stable descriptive paths such as:

- `public/content/events/2026-community-workshop/poster.webp`
- `public/content/news/digital-spine-demo/photo.webp`
- `public/content/publications/paper-short-name/paper.pdf`
- `public/content/findings/pilot-result/figure.webp`

Do not place editorial uploads back into a database.

## Publishing rules

When asked to publish, update, unpublish, or remove website content:

1. Read `docs/PUBLISHING.md` and the existing types in `src/content/published.ts`.
2. Change only the relevant content object and its own media unless the request explicitly needs a layout change.
3. **Never author public editorial content on behalf of ADFLEX.** Public-facing titles, summaries, descriptions, body copy, captions, alternative text, quotations, outcomes, link labels, publication metadata, project claims and similar wording must be supplied by or explicitly approved by the authorised content publisher. AI-generated wording must not be published merely because it sounds reasonable.
4. Never invent project facts, event dates, venues, authors, DOIs, results, funding claims, partner roles, URLs, statistics or quotations. If a required fact or required wording is missing, leave it absent where the type allows it or ask the authorised content publisher for it.
5. Preserve supplied wording. Formatting and date normalization are allowed where they do not change meaning, but do not paraphrase, polish, summarise, expand or rewrite approved public copy unless the authorised content publisher explicitly asks for that rewrite and approves the result.
6. Use unique, stable IDs. Do not recycle an ID from a removed item for unrelated content.
7. For images, record the real intrinsic pixel dimensions. Never generate image descriptions or captions. Use alt text only when it was supplied or explicitly approved. If an image is decorative or repeats information already present beside it and no approved alt text was supplied, use `alt: ""`. A visible caption is separate from alt text and must also be supplied or explicitly approved.
8. For downloadable files, keep the filename human-readable and set `byte_size` to the real file size.
9. When removing an entry, remove associated media only when it is not referenced anywhere else.
10. Do not silently rewrite unrelated content while publishing one item.
11. Do not create placeholder news, events, publications or results just to make an empty page look populated.
12. Files committed under `public/` are public once merged. Never commit confidential drafts, credentials, personal data or private correspondence.
13. If the Codex web Create PR flow rejects binary files, do not invent alternate media or remove media references silently. Ask the user to upload the approved binary to the exact `public/content/` path in GitHub, then reference the real filename from the text/source PR. See `docs/CONTENT-PUBLISHING.md`.

## Event handling

- `kind: "upcoming"` is an event that may still be promoted as forthcoming.
- `kind: "event"` is an event record that should remain in the Events section without being presented as an upcoming booking opportunity.
- `kind: "news"` is a news item rather than an event.
- For an upcoming event, `expired: false` means the page may show booking/upcoming treatment. When the event is over, deliberately update the record to a past-event state (`kind: "event"` or `expired: true`) and remove any obsolete booking URL if appropriate.
- Keep dates, times, location and booking information exactly consistent with supplied source material.
- Preserve past events as project dissemination records when appropriate rather than deleting them merely because the date passed.
- Accept natural human date input such as `15-04-2026`, `2026-04-15`, `15 April 2026`, or `April 2026`.
- Normalize a known full event date to ISO `YYYY-MM-DD` before storing it.
- Preserve month-only precision as `YYYY-MM`; never invent a missing day.
- Never invent a start or end time. If only one time is known, preserve only that known value.

## Publications and findings

- A publication must not be added until its bibliographic details are supplied or confirmed.
- Store the DOI value itself; the site derives the `doi.org` link.
- Project findings are public claims. Do not infer quantitative results from drafts, internal notes or diagrams.

## Design and implementation rules

- Preserve the existing ADFLEX visual language unless the user explicitly asks for a redesign.
- Reuse existing components before creating new ones.
- Do not add a UI framework or component library for a small change.
- Keep the site accessible: semantic headings, keyboard operation, visible focus, sufficient contrast and correct alternative text.
- Preserve GitHub Pages base-path handling. Root-relative public assets must go through `publicPath()` so they work below `/ADFLEX`.
- Avoid runtime-only Next.js features that are incompatible with static export.

## Validation

Before proposing a website change, run:

```bash
npm run check
```

For content updates, also verify:

- every piece of new or changed public editorial wording has a supplied/approved source;
- referenced media paths exist;
- event/publication links are exactly the supplied links;
- image dimensions match the actual files;
- file byte sizes match the actual files;
- no unrelated project copy changed.

If `npm run build` fails only because the Codex cloud environment cannot fetch the configured Google Fonts, report that limitation clearly, still run lint/typecheck/diff checks, and rely on the GitHub pull-request workflow for the authoritative build. Do not change the website fonts just to work around the Codex environment.

GitHub pull requests are validated by `.github/workflows/validate.yml`. A merge to `main` triggers the GitHub Pages deployment workflow.

## Pull request expectations

For anything beyond a trivial one-file correction, prefer a pull request rather than silently changing production. The PR description should state:

- what changed;
- what public content is affected;
- what source or approval the content came from when relevant;
- what validation ran;
- whether any media was added or removed.

Do not bundle unrelated cleanup into an ordinary publishing request.
