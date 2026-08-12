# Contact form email — what is needed, and from whom

**Status: not sending yet. Nothing is broken and nothing is being lost.**

The ADFLEX website's contact form is built, tested and working. Each enquiry is
meant to be emailed to `info@iresi.eu`. It cannot be yet, because sending
requires the site to sign in to a mailbox, and nobody has issued it credentials.

Until then every message goes to **Admin → Messages**, which is exactly how the
site behaved before email was added. That page says plainly that anything on it
did not reach a mailbox and still needs answering. **Someone has to check it.**

1. [The request to send to IRESI](#1-the-request-to-send-to-iresi) — copy and paste.
2. [Why not Maynooth](#2-why-not-maynooth) — so nobody retraces it.
3. [What to do once it arrives](#3-what-to-do-once-it-arrives) — one or two lines.

---

## 1. The request to send to IRESI

> **Subject: SMTP details for the ADFLEX website contact form**
>
> The ADFLEX project website has a contact form, and each enquiry needs to be
> emailed to `info@iresi.eu`. To send it, the site has to sign in to a mailbox.
>
> Could you provide **SMTP submission details for `info@iresi.eu`** — host,
> port, username and password? I believe the host is `mail.iresi.eu` on port
> 587 with STARTTLS, but please confirm rather than assume.
>
> If you would rather the website did not use the main mailbox, a **dedicated
> account such as `website@iresi.eu`** works equally well and is arguably
> better: bounces and auto-replies would not land in the inbox people read, and
> a leaked credential would mean rotating one throwaway mailbox rather than the
> project's own address.
>
> The site sends a low volume — only what members of the public submit through
> one contact form. It does not send bulk or marketing email.

**Why this is the route being taken.** The mailbox is hosted by Seeweb —
`mail.iresi.eu` resolves to `m-rb.th.seeweb.it` — which is ordinary commercial
hosting where SMTP credentials are a normal thing to issue.

---

## 2. Why not Maynooth

Sending through a Maynooth account was set up first and then abandoned. Recorded
here so nobody spends an afternoon rediscovering it:

| Tried | Result |
| --- | --- |
| `smtp.office365.com:587` reachable from the machine running the site | **Works.** The host and network path are fine — this was never the problem |
| An app password, via **My Account → Security info → Add sign-in method** | **Not offered.** The account has MFA enforced through Microsoft Authenticator and app passwords are disabled tenant-wide |
| Asking MU IT to enable SMTP AUTH on the mailbox | Possible, but Exchange Online has it **off by default per mailbox** and Microsoft has been withdrawing basic-authentication client submission. It may not be grantable at all |

There was a second problem with that route even if it had worked: the mailbox
belonged to one person. A publicly funded project's contact form should not stop
working when a researcher leaves the university.

**A note on what will not work.** The site cannot send *as* `info@iresi.eu`
while authenticating to Maynooth. They are different mail systems, and SPF and
DMARC exist precisely to reject that — the message would be dropped or filed as
spam. Whichever mailbox provides the credentials is the mailbox the mail is
sent from.

---

## 3. What to do once it arrives

### If the credentials are for `info@iresi.eu` itself

This is the expected case. Two lines.

**`src/lib/site.ts`** — fill in the host IRESI confirms:

```ts
export const MAIL_SENDER = {
  address: "info@iresi.eu",  // the mailbox the site signs in as
  host: "mail.iresi.eu",     // whatever IRESI confirms
  port: 587,
};
```

**`.env.local`** — the password, which is the only mail setting that lives
outside the source:

```
SMTP_PASSWORD=<the password IRESI gives you>
```

Restart the site. Done.

### If they give a separate sending account instead

Say `website@iresi.eu`. Same two files, one extra line:

```ts
export const MAIL_SENDER = {
  address: "website@iresi.eu",   // the site signs in and sends as this
  host: "mail.iresi.eu",
  port: 587,
};
```

`CONTACT_EMAIL` stays `info@iresi.eu` — that is where messages are *delivered*.
The `From:` header follows `MAIL_SENDER.address`, because a message has to be
sent as an address its mailbox is authorised to send as. The visitor's own
address goes in `Reply-To` either way, so replying answers them directly.

### Why the password is not in the source file

`.env.local` is gitignored. A credential in a source file is a credential in the
git history for good. On a hosted deployment the same value goes in the host's
environment-variable settings rather than a file.

### How to tell whether it worked

Send a message through the contact form, then check **Admin → Messages**:

- **Not there** → it was emailed. That page only collects failures.
- **There** → it did not send. The reason is in the server log on a line
  beginning `[adflex] contact email not sent`. An authentication failure names
  itself; anything else is usually the host or port.

---

## Two things worth knowing regardless

**A successfully emailed message is not stored on the site.** Deliberate — fewer
copies of personal data, which is what GDPR asks for. It does mean the mailbox
is the only record, and an erasure request has to cover the mailbox as well as
the Messages page.

**The Messages page needs checking while this is unresolved.** Every enquiry is
landing there and nothing notifies anyone. It is the one part of the site that
currently depends on somebody remembering.

---

*Written 9 August 2026. The rest of the admin is documented in `docs/ADMIN.md`.*
