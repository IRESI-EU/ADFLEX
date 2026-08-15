# ADFLEX Lab Manager Guide: Publishing with ChatGPT Codex

This guide is for project staff who need to publish, update or remove ADFLEX website content without editing web pages or writing Git commands.

You do not need to know TypeScript, Next.js, Git, branches or pull-request commands. Use Codex in ChatGPT, provide approved content, review the result, and merge the approved change after GitHub shows the green validation check.

## What you can publish

Use this workflow for:

- upcoming events;
- past events;
- news updates;
- publications;
- project findings or outcomes;
- corrections to existing entries;
- removing or unpublishing an entry.

Do not use it to publish confidential drafts, personal data, unapproved project claims, invented dates, guessed DOIs, or unconfirmed partner/funding information.

## Normal workflow

1. Open Codex in ChatGPT.
2. Select the `IRESI-EU/ADFLEX` repository and the latest `main` branch.
3. Attach or provide the approved information.
4. Paste one of the prompt templates below.
5. Let Codex prepare the change and run its checks.
6. Review Codex's summary. Make sure it changed only the intended content.
7. Click **Create PR**.
8. On GitHub, wait for **All checks have passed**.
9. Review the title, dates, links and attached media paths.
10. Click **Merge pull request** and confirm the merge.
11. GitHub automatically rebuilds and publishes the website.

For ordinary publishing, you should not need PowerShell, `git add`, `git commit`, `git push`, or `gh` commands.

## Date rules

You may give dates in normal human formats. Examples:

| You provide | Codex stores internally | Website display |
| --- | --- | --- |
| `April 2026` | `2026-04` | `April 2026` |
| `15-04-2026` | `2026-04-15` | `15 April 2026` |
| `2026-04-15` | `2026-04-15` | `15 April 2026` |
| `15 April 2026` | `2026-04-15` | `15 April 2026` |

Codex must preserve the precision you supplied. If only a month and year are known, it must not invent a day.

For upcoming events, provide the full date whenever it is known. Times may be supplied separately, for example `14:00` to `16:00`.

## Current media-upload step

At present, the Codex web **Create PR** flow may reject binary files such as `.jpg`, `.png` and `.pdf` with a message such as **Binary files are not supported**.

Until that limitation changes, use this simple workaround for approved media:

1. In GitHub, open `IRESI-EU/ADFLEX` on `main`.
2. Choose **Add file → Upload files**.
3. Upload the approved image/PDF under a descriptive folder inside `public/content/`.
4. Commit the media upload.
5. In the Codex task, tell Codex the exact GitHub path and ask it to reference that file without adding the binary again.
6. Confirm the final Codex diff is text/source only, then click **Create PR**.

Uploading an image or PDF by itself does not create a visible news/event/publication entry. The website displays it only after a content record references it.

Recommended folders:

```text
public/content/events/<event-id>/
public/content/news/<news-id>/
public/content/publications/<publication-id>/
public/content/findings/<finding-id>/
```

Use descriptive filenames. If Windows or the browser adds an extra extension such as `.jpg.jpeg`, tell Codex the exact filename that exists in GitHub rather than guessing.

## Review checklist before merging

You only need to check these items:

- Is the title and wording correct?
- Are the date, time and location correct?
- Are all URLs, DOI values and booking links correct?
- Are the correct images/PDFs referenced?
- Does GitHub show **All checks have passed**?
- Did Codex avoid unrelated website changes?

If all are correct, merge the pull request.

## Prompt: publish an upcoming event

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Publish this as an upcoming ADFLEX event.

Title: [event title]
Date: [for example 15 April 2026, 15-04-2026, or 2026-04-15]
Start time: [optional]
End time: [optional]
Location: [location]
Summary: [short summary]
Description: [approved event description]
Booking URL: [optional]
Related links: [optional]

Approved media already uploaded to GitHub:
[path(s), if applicable]

Do not invent missing information.
Preserve the date precision I supplied.
Normalize a full date internally to YYYY-MM-DD.
If I supplied only a month and year, do not invent a day.
Change only this event and any strictly necessary reusable publishing support.
Run the repository checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: publish a past event

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Publish this as a past ADFLEX event.

Title: [event title]
Date: [exact date or month/year if that is all that is known]
Location: [location]
Summary: [short summary]
Description: [approved description]
Related links: [optional]

Approved photographs already uploaded to GitHub:
[path(s), if applicable]

This is a past event, not an upcoming booking event.
Do not invent a missing day or time.
Do not add a booking link unless I provide one.
Preserve the event as a project dissemination record.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: publish a news update

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Publish the following as an ADFLEX news update.

Title: [title]
Publication date: [date]
Summary: [short summary]
Body: [approved news text]
Related links: [optional]
Approved images already uploaded to GitHub: [optional paths]

Do not invent project facts or rewrite approved wording.
Do not modify unrelated events, publications or project copy.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: publish a publication

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Add this publication to Project Outcomes → Publications.

Title: [exact paper title]
Authors: [approved author list]
Journal/conference/venue: [venue]
Year: [year]
DOI: [DOI if available]
Publisher URL: [URL if available]
Publication date for the website: [date]
Approved PDF already uploaded to GitHub: [path, if applicable]

Do not guess a DOI, publication status, authorship or venue.
Use the exact bibliographic information supplied.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: publish a project finding or outcome

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Publish the following approved ADFLEX project finding/outcome.

Title: [title]
Publication date: [date]
Summary: [short summary]
Body: [approved finding text]
Approved images/files already uploaded to GitHub: [optional paths]

Treat this as a public project claim.
Do not infer or invent results, statistics or conclusions that I have not supplied.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: update existing content

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Update the existing website item titled:
"[exact title]"

Make only these changes:
[describe the exact corrections]

Do not rewrite other parts of the item unless required for consistency.
Do not modify unrelated website content.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: mark an upcoming event as completed

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

The event "[exact event title]" has now taken place.

Change it from an upcoming event to a past event.
Remove any obsolete booking action.
Keep it visible as an ADFLEX dissemination record.

Approved outcome text: [optional]
Recording URL: [optional]

Do not invent an outcome or recording link if I have not supplied one.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## Prompt: remove content

```text
Work in IRESI-EU/ADFLEX from the latest main branch.

Remove the website item titled:
"[exact title]"

Do not modify any other event, news item, publication, finding or project copy.
Remove associated media only if it is not referenced anywhere else.
Run the checks and prepare a pull request to main.
Do not merge automatically.
```

## If Codex asks for missing information

Provide the missing approved fact if you know it. If it is genuinely unknown, tell Codex to leave it absent where possible rather than inventing it.

Examples:

- `The exact day is not known; keep April 2026.`
- `There is no booking URL.`
- `No DOI has been assigned yet.`
- `Do not publish a result until it has been approved.`

## If Codex reports a Google Fonts build error

The Codex cloud environment may occasionally be unable to download the Inter or Sora font files during `npm run build`.

If lint and typecheck pass and Codex clearly reports that the only build failure is the external Google Fonts network fetch, create the pull request and let GitHub Actions run the authoritative repository validation. Do not change the website fonts just to work around the Codex environment.

## If GitHub validation fails

Do not merge the pull request. Ask ChatGPT/Codex to inspect the failing GitHub check and fix the PR first.

## After merging

GitHub Pages deployment normally starts automatically after the merge. If the website still shows an older version shortly after a successful deployment, hard-refresh the browser (`Ctrl + Shift + R`) or open the site in a private/incognito window before assuming another code change is needed.

## Key principle

The lab manager supplies and approves the content. Codex performs the technical editing. GitHub provides review, validation, history and deployment.

The public website must never depend on an AI service at runtime.
