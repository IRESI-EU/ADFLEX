# ADFLEX Project Website

The public website for **ADFLEX — Advanced Demonstrators for Flexibility and Local Energy Exchange in Sustainable Energy Communities**.

Production site: `https://iresi-eu.github.io/ADFLEX/`

## Architecture

ADFLEX is intentionally a **static, Git-backed website**.

```text
Project team
    |
    | natural-language publishing request
    v
Codex / coding agent
    |
    | repository change
    v
GitHub branch + pull request
    |
    | validate
    v
main
    |
    | GitHub Actions
    v
GitHub Pages
```

Git is both the content store and the audit trail. Codex is an editing interface, not a runtime dependency of the public site.

The production architecture has **no `/admin` dashboard, PostgreSQL CMS, server-side media store, or runtime publishing API**. That older implementation is retained in Git history rather than in the current source tree.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the design rationale, [`docs/PUBLISHING.md`](docs/PUBLISHING.md) for the technical publishing workflow, and [`docs/CONTENT-PUBLISHING.md`](docs/CONTENT-PUBLISHING.md) for the nontechnical ChatGPT/Codex content-publishing guide.

## Content model

Content has two sources of truth:

- `src/content/adflex.ts` — durable project copy and configuration: navigation, About, technologies, consortium, pilot, contact details, legal content and funding information.
- `src/content/published.ts` — news, events, project findings and publications.

Images and documents associated with published entries live under `public/content/`. Public asset references are stored as root-relative paths such as `/content/events/example/poster.webp`; `publicPath()` adds the `/ADFLEX` prefix in the GitHub Pages build.

No public facts should be invented to fill an empty section. If approved content has not been supplied, the site keeps its honest empty state.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Project overview, technologies, consortium, pilot and the next upcoming-event announcement when one exists |
| `/about` | Full About ADFLEX content |
| `/outcomes` | Project findings and publications from Git-backed content |
| `/news` | News and events from Git-backed content |
| `/contact` | Published project contact details and a `mailto:` link |
| `/legal/privacy` | Privacy Policy |
| `/legal/cookies` | Cookies Policy |
| `/legal/terms` | Terms of Use |
| `/design-system` | Internal visual-system documentation (`noindex`) |

## Local development

Requirements:

- Node.js 20.9 or newer
- npm

Install and run:

```bash
npm ci
npm run dev
```

Validation:

```bash
npm run check
```

`npm run check` runs linting, a production build and TypeScript checking. If you switch between substantially different branches and Next.js reports routes that no longer exist, remove the generated `.next` directory and rerun the check.

## Publishing

Normal public updates follow this path:

1. An authorised project team member supplies approved content and any media.
2. Codex (or a developer) updates the relevant Git-backed content and assets.
3. The change is reviewed in a pull request.
4. GitHub Actions validates the site.
5. An authorised user merges the approved pull request into `main`.
6. Merging to `main` automatically rebuilds and deploys GitHub Pages.

The repository is public for transparency, but public visibility does **not** grant publishing permission. External users may read or fork the repository and may propose pull requests, but only users with the required permissions on `IRESI-EU/ADFLEX` can change the official repository or merge changes that reach the live website.

For nontechnical project staff, use [`docs/CONTENT-PUBLISHING.md`](docs/CONTENT-PUBLISHING.md). It contains copy-and-paste prompts for events, news, publications, findings, updates and removals, plus the current media-upload workaround.

Developer/Codex schemas, path conventions and removal rules are in [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

## Deployment

`.github/workflows/deploy-pages.yml` builds and deploys the static export whenever `main` changes.

`.github/workflows/validate.yml` performs the same code-quality/build checks for pull requests without deploying them.

The GitHub Pages build sets the repository base path to `/ADFLEX`. Do not bypass the existing base-path helpers for root-relative links or public assets.

## Repository map

```text
.github/workflows/
  deploy-pages.yml       production deployment
  validate.yml           pull-request validation

docs/
  ARCHITECTURE.md        current technical architecture
  PUBLISHING.md          developer/Codex publishing procedure
  CONTENT-PUBLISHING.md  nontechnical ChatGPT/Codex content-publishing guide
  CONTENT-SOURCE.md      content provenance and approval rules
  OPEN-ITEMS.md          genuine unresolved project inputs

public/
  images/                long-lived project artwork and partner logos
  content/               media/documents for news, events, findings and papers

src/
  app/                   static App Router pages
  components/            production UI components
  content/
    adflex.ts             durable project content
    published.ts          time-varying published entries
  lib/site.ts            site URL and GitHub Pages path helpers
  styles/                design tokens
```

## Content safety

This is a publicly funded project website. Treat publishing as a public statement:

- do not invent dates, results, partner details, funding claims, statistics, publications or DOIs;
- do not commit confidential drafts or personal data under `public/`;
- keep supplied/approved wording intact when instructed;
- keep partner logos and supplied artwork unaltered unless an approved replacement is provided;
- keep changes narrowly scoped and reviewable.

The detailed source rules live in [`docs/CONTENT-SOURCE.md`](docs/CONTENT-SOURCE.md), and coding agents must follow [`AGENTS.md`](AGENTS.md).