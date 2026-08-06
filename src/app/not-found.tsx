import type { Metadata } from "next";
import Link from "next/link";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { PageHero } from "@/components/PageHero";
import styles from "./not-found.module.css";

const { brand, navigation, notFound } = adflexContent;

/**
 * `noindex` because a 404 is not a page anyone should be able to find in a
 * search result. Next serves this with a real 404 status, so the header is
 * belt and braces rather than the only signal.
 */
export const metadata: Metadata = {
  // Bare, not "… — ADFLEX": the root layout's `title.template` adds the suffix.
  title: notFound.eyebrow,
  robots: { index: false, follow: true },
};

/**
 * The 404 page.
 *
 * Next has a built-in one, and it is an unstyled sentence on a blank white
 * page with no header, no footer and no way back to the site — a visitor who
 * follows a stale link to an EU-funded project site lands somewhere that does
 * not look like the project at all. This is the same shell as every other
 * route, so a wrong address still leaves them inside the website.
 *
 * It reuses `PageHero` and the site header and footer rather than inventing a
 * layout, which is also why it needs almost no CSS of its own.
 */
export default function NotFound() {
  // `onHome: false` prefixes the in-page anchors with `/`, because this route
  // is not the home page and `#technologies` alone would go nowhere from here.
  const nav = resolveNavigation(navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero
          eyebrow={notFound.eyebrow}
          title={notFound.title}
          lead={notFound.lead}
        />

        <div className={styles.body}>
          <div className="adflex-container">
            <Link className="adflex-cta" href={notFound.cta.href}>
              {notFound.cta.label}
            </Link>
          </div>
        </div>
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}
