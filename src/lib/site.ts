/**
 * Where this site is published.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS RETURNS `null` INSTEAD OF A DEFAULT
 * ---------------------------------------------------------------------------
 * Canonical links, Open Graph URLs and a sitemap all have to be absolute, and
 * an absolute URL is a claim about where the site lives. No production domain
 * has been supplied for ADFLEX yet, and guessing one is worse than having
 * none: a wrong `<link rel="canonical">` tells search engines the real page is
 * somewhere that does not exist, and a sitemap full of invented addresses is
 * worse than no sitemap.
 *
 * So when `NEXT_PUBLIC_SITE_URL` is unset the site simply omits the things
 * that need it — no canonical tag, no absolute Open Graph URL, an empty
 * sitemap and a robots.txt with no `Sitemap:` line. Everything else works
 * exactly as before. Set the variable and all four light up together.
 *
 * See `.env.example` and docs/OPEN-ITEMS.md.
 */
export function siteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    // A canonical host has to be reachable from outside; anything else is a
    // misconfiguration worth failing quietly rather than publishing.
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

/** Absolute URL for `path`, or `null` when no site URL is configured. */
export function absoluteUrl(path: string): string | null {
  const base = siteUrl();
  return base ? new URL(path, base).toString() : null;
}

/**
 * A `Metadata.alternates` fragment naming this page's canonical address, or
 * nothing at all.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS NOT JUST `alternates: { canonical: "/about" }`
 * ---------------------------------------------------------------------------
 * Next resolves a relative canonical against `metadataBase`, and
 * `metadataBase` is only set once a site URL is configured. Without it the
 * page emits `<link rel="canonical" href="/about">` — a relative canonical,
 * which the specification does not allow and which crawlers treat as a
 * malformed hint. That is a worse state than the no-canonical-at-all the site
 * started in, so the tag is omitted entirely until there is a real host to
 * point it at.
 *
 * Spread into a `Metadata` object:
 *
 *     export const metadata: Metadata = { title: "About", ...canonical("/about") };
 *
 * Every indexable page calls this, including the home page. The root layout
 * sets no canonical of its own precisely so that a page which does not call it
 * — `/design-system`, the 404 — ends up with none, rather than inheriting the
 * home page's address as its own.
 */
export function canonical(path: string): { alternates?: { canonical: string } } {
  const url = absoluteUrl(path);
  return url ? { alternates: { canonical: url } } : {};
}
/* --------------------------------------------------------------------------
 * CONTACT FORM EMAIL  —  CHANGE IT HERE, AND ONLY HERE
 * ----------------------------------------------------------------------- */

/**
 * The project's address. Contact form messages are delivered to it, and sent
 * from it.
 *
 * One value doing both jobs, which is only possible because the site will sign
 * in to this same mailbox to send. If it ever has to relay through a *different*
 * account, set `MAIL_SENDER.address` below and the two separate cleanly.
 *
 * ---------------------------------------------------------------------------
 * THE ADMIN LOGIN IS THE SAME ADDRESS, BUT NOT SET FROM HERE
 * ---------------------------------------------------------------------------
 * Signing in needs a password, so that account lives in the database where its
 * hash can live with it — a source file is the wrong place for a credential.
 * Changing this line does not move the login. To bring it into step, run this
 * with the address from the line below:
 *
 *     npm run db:user -- <the address below> "ADFLEX Editor"
 *
 * The address is deliberately not repeated in this comment. A worked example
 * with the current value baked in is a second copy that nobody updates, which is
 * the exact problem this constant exists to solve.
 */
export const PROJECT_EMAIL = "info@iresi.eu";

/**
 * The mail server, and optionally a different mailbox to send through.
 *
 * ---------------------------------------------------------------------------
 * NOT FILLED IN YET — WAITING ON IRESI
 * ---------------------------------------------------------------------------
 * The site needs SMTP submission details for the address above: host, port,
 * username and password. That mailbox is hosted by Seeweb — `mail.iresi.eu`
 * resolves to `m-rb.th.seeweb.it` — so the host is very likely `mail.iresi.eu`
 * on port 587, but **confirm it with whoever administers IRESI's mail rather
 * than assuming it.** The request is written out in `handover/EMAIL-SETUP.md`.
 *
 * The address is not repeated here on purpose: a second copy in a comment is a
 * copy nobody updates.
 *
 * While `host` is empty the contact form works exactly as it always has: every
 * message goes to the admin dashboard instead of the mailbox. Nothing breaks.
 *
 * `address` is the mailbox the site signs into. **Leave it blank** and it uses
 * `PROJECT_EMAIL`, which is the intended arrangement — one address, sending to
 * itself. Only fill it in if IRESI provides a *separate* sending account, such
 * as a dedicated `website@iresi.eu`; the `From:` header follows it, because a
 * message must be sent as an address its mailbox is authorised to send as. That
 * is what SPF and DMARC check, and getting it wrong is how mail is silently
 * dropped or filed as spam.
 */
export const MAIL_SENDER = {
  address: "",
  host: "",
  port: 587,
};
