import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/PageHero";
import styles from "./outputs.module.css";

const { brand, navigation, results } = adflexContent;

export const metadata: Metadata = {
  title: `${results.title} â€” ADFLEX`,
  description: results.pageDescription,
};

/**
 * Project Outputs on its own route.
 *
 * The page is an intentional empty state: findings are not final. When real
 * publications exist, replace the EmptyState with a list rendered from a new
 * `results.items` array in the content file. Until then, nothing here may be
 * filled in with placeholder publications, dates, DOIs or download links.
 */
export default function OutputsPage() {
  const nav = resolveNavigation(navigation, { onHome: false });

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow="Findings and papers" title={results.title} />

        <div className={styles.body}>
          <div className="adflex-container">
            {/* h2 because it sits directly under the page h1 â€” using the
                default h3 here would skip a heading level. */}
            <EmptyState
              heading={results.heading}
              body={results.body}
              headingLevel="h2"
            />
          </div>
        </div>
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}


