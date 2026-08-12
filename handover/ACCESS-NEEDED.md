# What I need before ADFLEX can be deployed and its email tested

12 August 2026. One list, so the right access can be requested once rather than
a permission at a time. Everything here was raised in the review meeting.

Each item says **what is blocked without it**, so anything that turns out to be
slow can be worked around rather than waited on.

---

## 1. Hosting and deployment

The meeting was clear that no new domain should be bought for this. The plan is
to deploy under the existing IRESI infrastructure — a subdomain, a subpath or a
staging environment, whichever the technical team confirms.

| # | What I need | Blocked without it |
| --- | --- | --- |
| 1.1 | Where the current IRESI website is hosted — provider and plan | Cannot judge whether it can run a Node application at all |
| 1.2 | Whether that host can run **Node.js 20+**, or whether a separate host is needed | The whole deployment approach |
| 1.3 | Login to the hosting control panel, or a deploy key / CI credentials | Deploying anything |
| 1.4 | Where this should be staged — the exact address it will answer on | The canonical URL, the sitemap, and any SSO redirect URL later |
| 1.5 | Whether ADFLEX sits at a **subdomain** (`adflex.iresi.eu`) or a **path** (`iresi.eu/adflex`) | Routing and internal links. A path is more work and should be decided before, not after |
| 1.6 | DNS access, if a subdomain is chosen — or the name of whoever can add records | Pointing the subdomain anywhere |

**A note on 1.2.** The current IRESI site is WordPress, which means PHP hosting.
PHP hosting frequently cannot run Node. If that is the case here, this needs a
decision rather than a workaround, and it is better to discover it now.

## 2. Database

| # | What I need | Blocked without it |
| --- | --- | --- |
| 2.1 | Whether a **PostgreSQL 14+** database can be provided on that host, or a managed one is preferred | Deploying at all — the site stores all editor content in Postgres |
| 2.2 | The connection details once it exists (host, port, database, user, password) | Same |
| 2.3 | Whether IRESI wants **one database shared** by all its projects or one per project | Nothing immediately, but it shapes the schema, so the sooner the better |
| 2.4 | Who takes backups, and how often | Nothing technical. It is a question somebody should have answered before real content goes in |

## 3. Email — SMTP

This is the one the meeting singled out. Instructions on their own do not count
as finished: it has to be configured, deployed, sent and confirmed received.

| # | What I need | Blocked without it |
| --- | --- | --- |
| 3.1 | The SMTP **host name** and **port** of the existing IRESI mail account | The contact form cannot send. Every message falls back to the admin dashboard |
| 3.2 | The **username** for that mailbox | Same |
| 3.3 | The **password** — an app password if the mailbox uses multi-factor authentication | Same |
| 3.4 | The address messages should be **sent from**. It usually has to be the mailbox itself, or one it is permitted to send as | Same |
| 3.5 | Confirmation that **`info@iresi.eu`** is where enquiries should arrive | Nothing — it is what the site is set to. Worth confirming rather than assuming |

**On 3.3.** If the mailbox is Microsoft 365 with MFA, an ordinary password will
not work: it needs an app password, and the tenant must allow them. This is the
step that has already stalled once. If app passwords are disabled, the
alternative is a service account or an SMTP relay, and that is an IT decision.

**Please do not put any of these in an email or a chat message.** The password
belongs in the hosting provider's environment settings. If it is easier to send
it, send it to me by whatever the team's usual secure route is and I will put it
there — but the ideal is that I never see it.

## 4. Repository

| # | What I need | Blocked without it |
| --- | --- | --- |
| 4.1 | Whether an **IRESI GitHub organisation** exists, and if not, whether to create one | The project stays in a personal account, which the meeting asked to move away from |
| 4.2 | Permission to transfer or mirror the repository into it | Same |
| 4.3 | The GitHub usernames of everyone who should have access — Paolo was named | They cannot see the code |

Paolo can be added to the current repository straight away; that does not need
to wait for the organisation.

## 5. Content and sign-off

Not access, but outstanding, and each one is currently a visible gap on the site.

| # | What I need | Blocked without it |
| --- | --- | --- |
| 5.1 | A **favicon** — the small icon in a browser tab | The only console error on the home page |
| 5.2 | Confirmation of the **funding statement** wording. The footer currently reads "Funded by SEAI." with the SEAI logo | Nothing. It is deliberately the shortest true statement; the grant number and disclaimer have never been supplied |
| 5.3 | **Legal pages** — Privacy, Cookies, Terms — reviewed by someone who can approve them. The Cookies Policy currently describes Matomo, a cookie banner and LinkedIn embeds that the site does not have | Nothing technically. It is a compliance risk while the site collects contact details |
| 5.4 | The project's **LinkedIn URL**, if there is one | The footer link renders as plain text rather than a dead link |

---

## What is *not* waiting on anybody

So this list is not read as "the site is blocked". It is not. Everything below
works now, on a local machine, and needs no access from anyone:

- Every public page, the admin, and all content management
- Contact form validation, rate limiting, and the fallback to the dashboard
- Image upload with resizing and camera-data stripping
- The event lifecycle, including past events staying on the page
- Database migrations, from an empty database to the current schema

The blocked items are deployment, real email delivery, and repository ownership.
