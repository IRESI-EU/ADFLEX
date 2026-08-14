# ADFLEX website architecture

## Decision

ADFLEX uses a static GitHub Pages architecture in which **GitHub is the publishing system of record** and **Codex is an optional natural-language editing interface**.

Codex is deliberately outside the runtime path. If no AI service is available, the deployed website continues to work unchanged and maintainers can still edit the repository with GitHub's editor, VS Code or ordinary Git.

## Control flow

```text
Project team
    |
    | approved text / image / PDF / removal request
    v
Codex or developer
    |
    | edits repository content and assets
    v
GitHub pull request
    |
    +--> validation: lint + typecheck + static build
    |
    v
Human review / merge
    |
    v
main
    |
    | Deploy GitHub Pages workflow
    v
Static Next.js export
    |
    v
https://iresi-eu.github.io/ADFLEX/
```

## Responsibilities

### GitHub repository

The repository stores:

- website source code;
- durable project copy;
- news, event, finding and publication records;
- public images and downloadable files;
- complete change history and review context.

It replaces the previous role of PostgreSQL as a content store.

### Codex

Codex may:

- turn an approved natural-language request into a scoped repository change;
- add/update/remove a content object;
- add or remove its public media;
- run validation;
- prepare a reviewable pull request.

Codex must not be required by the public website and must follow `AGENTS.md`.

### GitHub Actions

Pull requests are checked by `.github/workflows/validate.yml`.

Merges to `main` are built and deployed by `.github/workflows/deploy-pages.yml`.

### GitHub Pages

GitHub Pages serves only the generated static site. It holds no editor session, application database, user account, upload endpoint or server-side publication API.

## Content boundaries

`src/content/adflex.ts` holds relatively stable project content. `src/content/published.ts` holds time-varying dissemination content. Associated editorial files live under `public/content/`.

This boundary matters: publishing an event should not require editing the page component that renders events. A normal content change should be data + media only.

## Why this architecture fits ADFLEX

- The public site is already statically exported to GitHub Pages.
- Project updates are relatively low-frequency and benefit from review rather than database-driven instant mutation.
- Git gives a durable record of who changed what and makes removals reversible through history.
- The public attack surface is smaller because there is no login, editor endpoint, upload endpoint or database in production.
- The project is not locked to Codex: Git remains the underlying interface.

## Non-goals

This architecture is not a general-purpose CMS. Do not add live comments, user accounts, arbitrary user uploads, transactional data or other server-backed features to this repository without a separate architecture decision.