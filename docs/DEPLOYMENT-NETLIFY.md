# ADFLEX Netlify deployment

## Purpose

This deployment is a temporary public team-review environment for:

- `/`
- `/design-system`

Both routes are served from a single Netlify project. The rest of the site
(`/about`, `/news`, `/events`, `/outputs`, `/contact`, `/legal/*`) builds and
deploys alongside them, because they are part of the same Next.js application.
The two routes above are the ones the team is being asked to review.

This is a review environment, not a production launch. It is expected to be
short-lived and taken down once the review is finished.

## Repository

https://github.com/gunanikaap/ADFLEX

## Deployment branch

`team-preview`

This branch exists only to feed the team-review deployment. It is not `main`,
and it must not be merged into `main` as part of setting up this preview.

## Netlify dashboard setup

1. Sign in to Netlify with GitHub.
2. Select **Add new project**.
3. Select **Import an existing project**.
4. Select **GitHub**.
5. Authorise access to the ADFLEX repository.
6. Select **gunanikaap/ADFLEX**.
7. Select **team-preview** as the production branch.
8. Keep the base directory at the repository root.
9. Allow Netlify to auto-detect Next.js.
10. Build command: `npm run build`
11. Publish directory: leave the auto-detected Next.js value unchanged.
12. Do not add environment variables unless this document explicitly lists them.
13. Select **Deploy**.

Netlify builds modern Next.js through its own managed OpenNext adapter. Nothing
needs to be installed, pinned or configured in this repository for that to work —
there is deliberately no `netlify.toml`, no Netlify plugin entry in
`package.json`, and no static-export setting.

## Expected URLs

```
https://<netlify-project-name>.netlify.app/
https://<netlify-project-name>.netlify.app/design-system
```

Netlify assigns `<netlify-project-name>` when the project is created. It can be
changed afterwards under **Project configuration → General → Project details →
Change project name**.

## Updating the team preview

Only commits that have passed the full local check should reach `team-preview`:

```
npm ci
npm run lint
npm run typecheck
npm run build
```

Work continues on `feature/adflex-basic-site`. `team-preview` is a pointer that
is moved forward to a verified commit on that branch — it is not a branch where
work happens directly. Because it only ever trails the same line of history, a
fast-forward is the correct and expected update:

```
git switch team-preview
git merge --ff-only feature/adflex-basic-site
git push origin team-preview
```

`--ff-only` is the safety mechanism. If the branches have not diverged the update
succeeds; if they have, the command refuses rather than creating a merge or
rewriting anything.

If the fast-forward is rejected, stop and review the history before doing
anything else:

```
git log --oneline --graph --decorate team-preview feature/adflex-basic-site
git log --oneline team-preview ^feature/adflex-basic-site
```

The second command lists commits that exist only on `team-preview`. Investigate
where they came from and agree what should happen to them. Do not resolve a
rejected fast-forward with `git push --force`, `git push --force-with-lease` or
`git reset --hard` — those discard commits and can destroy work that is not
recorded anywhere else.

Netlify redeploys automatically on each push to `team-preview`.

## Rollback

Rolling back is done in the Netlify dashboard, not with Git:

1. Open the project in Netlify.
2. Go to the **Deploys** tab.
3. Find a previous deploy marked **Published** that is known to be good.
4. Open that deploy.
5. Select **Publish deploy**.

The site immediately serves that earlier build again. Netlify keeps the previous
builds, so this is reversible and does not rebuild anything.

This changes only what Netlify is serving. It does not change the Git branch, so
`team-preview` will still point at the newer commit. Fix the underlying problem
in Git separately, then push again.

## Public access warning

**The Netlify URL is public.** Anyone who receives the link can open the site,
and so can anyone they forward it to. There is no password, no login and no
access control on a Netlify Free deploy. Search engines may also index it.

Do not place on the deployed pages:

- credentials, API keys or tokens of any kind
- private meeting notes or internal discussion
- confidential project or consortium documents
- unpublished results, or partner information that has not been cleared
- personal data of any individual who has not agreed to it being published

Treat the preview as if it were already published, because in practice it is.
Share the URL only with the people who need to review it, and take the
deployment down once the review is complete.

## Current environment variables

No environment variables are required for the current ADFLEX build.

The application contains no reference to `process.env`, no `NEXT_PUBLIC_*`
variables, no API keys, no database connection and no external service calls.
Nothing needs to be entered in Netlify's environment variables screen.

If that ever changes, every required variable must be listed in this section
before the deployment is updated.

## Known limitations at the time of writing

These are recorded so the review team is not surprised by them. Neither blocks
the deployment.

- **`/design-system` is not linked from anywhere on the site.** It is reachable
  only by typing the URL directly. The footer link to it was intentionally
  removed during the footer simplification. Send the team the
  `/design-system` URL explicitly.
- **`/favicon.ico` returns 404.** No favicon file has been added yet, so browsers
  show a default icon and log a single 404 in developer tools. It has no effect
  on the pages themselves.
