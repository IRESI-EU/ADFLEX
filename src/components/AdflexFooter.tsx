import Image from "next/image";
import Link from "next/link";
import {
  adflexContent,
  type AdflexContent,
  type ImageAsset,
} from "@/content/adflex";
import styles from "./AdflexFooter.module.css";

type AdflexFooterProps = {
  logo: ImageAsset;
};

/**
 * The LinkedIn glyph, drawn inline rather than pulled from an icon package —
 * an external icon dependency is out of scope for this build.
 *
 * NOTE: this is a rendition of the mark, not LinkedIn's own artwork. LinkedIn
 * publishes official brand assets and its own usage rules; swap this for the
 * supplied file if the project wants to follow them to the letter. Decorative
 * here — the link's visible text carries the meaning.
 */
function LinkedInMark() {
  return (
    <svg
      className={styles.socialIcon}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

/**
 * Site footer on a white surface, so the supplied logo (which has an opaque
 * white background) is never placed on a dark colour.
 *
 * Deliberately minimal: identity, the project's LinkedIn, and the legal links.
 * The site's sections are all reachable from the header, so repeating them
 * here only made the footer tall. Between them sits a reserved row for the
 * funding statement and EU emblem, which renders as soon as
 * `footer.funding` is filled in and stays invisible until then.
 */
export function AdflexFooter({ logo }: AdflexFooterProps) {
  const year = new Date().getFullYear();
  const { legal } = adflexContent;
  /* Read through the declared contract rather than the `as const` literal.
     Both `funding` and `linkedin.href` are `null` today, and TypeScript narrows
     a const to its initialiser — so without this the two branches below type as
     unreachable and the file stops compiling the moment either value is filled
     in. The slots are meant to be filled in; that must not be a code change. */
  const { funding, linkedin } = adflexContent.footer as AdflexContent["footer"];

  return (
    <footer className={styles.footer}>
      <div className={`adflex-container ${styles.inner}`}>
        <Image
          className={styles.logo}
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          sizes="200px"
        />

        {/* A link only once a URL exists. Until then the same block renders as
            plain text — not a link to nowhere, and not a control that looks
            active but is not. */}
        {linkedin.href ? (
          <a
            className={styles.social}
            href={linkedin.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            <LinkedInMark />
            {linkedin.label}
          </a>
        ) : (
          <p className={`${styles.social} ${styles.socialPending}`}>
            <LinkedInMark />
            {linkedin.label}
          </p>
        )}
      </div>

      {/* Reserved for the funding programme, grant number, approved disclaimer
          and EU emblem. Nothing has been supplied, so nothing is shown — see
          docs/OPEN-ITEMS.md. */}
      {funding ? (
        <div className={`adflex-container ${styles.funding}`}>
          {funding.emblem ? (
            <Image
              className={styles.emblem}
              src={funding.emblem.src}
              alt={funding.emblem.alt}
              width={funding.emblem.width}
              height={funding.emblem.height}
              sizes="120px"
            />
          ) : null}
          <p>{funding.statement}</p>
        </div>
      ) : null}

      <div className={`adflex-container ${styles.legal}`}>
        <p>© {year} ADFLEX</p>
        <ul className={styles.legalLinks}>
          {legal.pages.map((page) => (
            <li key={page.slug}>
              <Link className={styles.legalLink} href={`/legal/${page.slug}`}>
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
