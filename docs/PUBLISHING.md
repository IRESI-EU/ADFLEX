# Publishing ADFLEX updates with Git and Codex

This is the operating guide for news, events, findings and publications.

## Normal workflow

A project team member can make a plain-language request such as:

> Publish the attached poster as an upcoming ADFLEX event on 22 September 2026. Use the supplied title, Maynooth University as the location and this booking URL. Do not change anything else.

or:

> Add this accepted paper to Publications using the supplied authors, venue, DOI and PDF.

or:

> Remove the workshop announcement and its poster from the public website. Do not alter the other news items.

Codex/developer workflow:

1. Confirm the request contains enough approved facts to publish.
2. Read `AGENTS.md` and the types in `src/content/published.ts`.
3. Add/update/remove the relevant object.
4. Put associated public files under `public/content/`.
5. Run `npm run check`.
6. Review the diff for unrelated changes.
7. Open a pull request.
8. Merge after validation/review. The merge to `main` deploys automatically.

## Public asset paths

A file committed at:

```text
public/content/events/community-workshop/poster.webp
```

is referenced in content as:

```text
/content/events/community-workshop/poster.webp
```

The rendering components resolve that path through `publicPath()` so it works both locally and at the `/ADFLEX` GitHub Pages base path.

Use descriptive kebab-case folders. Do not put confidential drafts in `public/`.

## News item example

```ts
{
  id: "digital-spine-demo-update",
  kind: "news",
  title: "Approved title",
  summary: "Approved one-line summary.",
  body: "Approved body copy.",
  images: [],
  image_size: "medium",
  published_on: "2026-09-22",
  event_date: null,
  event_time: null,
  event_end_time: null,
  location: null,
  booking_url: null,
  slots_filled: false,
  event_outcome: "",
  event_video_url: null,
  expired: false,
}
```

## Upcoming event example

```ts
{
  id: "community-energy-workshop-2026",
  kind: "upcoming",
  title: "Approved event title",
  summary: "Approved event summary.",
  body: "Approved event description.",
  images: [
    {
      id: "community-energy-workshop-poster",
      src: "/content/events/community-energy-workshop-2026/poster.webp",
      alt: "Textual description of information carried by the poster",
      width: 1600,
      height: 900,
    },
  ],
  image_size: "large",
  published_on: "2026-08-14",
  event_date: "2026-09-22",
  event_time: "14:00",
  event_end_time: "16:00",
  location: "Maynooth University",
  booking_url: "https://example.invalid/replace-with-supplied-url",
  slots_filled: false,
  event_outcome: "",
  event_video_url: null,
  expired: false,
}
```

The URL above is intentionally an example only. Never publish it; use only a URL supplied for the real event.

After the event, deliberately update its record so it no longer offers an obsolete booking action. Usually that means recording it as a past event (`kind: "event"`) and adding an approved outcome/recording only if those have been supplied.

## Publication example

```ts
{
  id: "paper-short-stable-id",
  title: "Exact paper title",
  authors: "Approved author list",
  venue: "Approved venue",
  year: 2026,
  doi: "10.xxxx/example",
  url: "https://publisher.example/paper",
  files: [
    {
      id: "paper-pdf",
      href: "/content/publications/paper-short-stable-id/paper.pdf",
      filename: "paper.pdf",
      byte_size: 1234567,
      label: "Download paper",
    },
  ],
  published_on: "2026-09-22",
}
```

Do not guess a DOI, venue, authorship or publication status.

## Finding example

```ts
{
  id: "pilot-finding-stable-id",
  title: "Approved finding title",
  summary: "Approved short summary.",
  body: "Approved finding text.",
  images: [],
  files: [],
  image_size: "medium",
  published_on: "2026-09-22",
}
```

A finding is a public project claim. Internal analysis is not automatically publishable evidence.

## Ordering

The arrays in `src/content/published.ts` are editorial order. Keep the most relevant/recent entries first unless the project team explicitly requests another order. The home-page upcoming-event helper independently selects the earliest eligible upcoming event by date.

## Removing content

Removing an object from `src/content/published.ts` removes it on the next deployment. Git history still records the previous public state.

Delete associated media only if nothing else references it. Shared files must remain.

## Simple corrections

For a trivial correction such as replacing one approved logo or fixing one typo, use the smallest safe change. A full content architecture workflow is unnecessary for a one-file correction; repository governance may still require a pull request.