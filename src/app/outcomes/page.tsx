import type { Metadata } from "next";
import { adflexContent, resolveNavigation } from "@/content/adflex";
import { canonical } from "@/lib/site";
import { AdflexHeader } from "@/components/AdflexHeader";
import { AdflexFooter } from "@/components/AdflexFooter";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/PageHero";
import { FindingList, PublicationList } from "@/components/PublishedList";
import listStyles from "@/components/PublishedList.module.css";
import { findings, publications } from "@/content/published";
import styles from "./outcomes.module.css";

const { brand, navigation, outcomes } = adflexContent;

export const metadata: Metadata = {
  title: outcomes.title,
  description: outcomes.pageDescription,
  ...canonical("/outcomes"),
};

/** Project findings and papers published from the Git-backed content file. */
export default function OutcomesPage() {
  const nav = resolveNavigation(navigation, { onHome: false });
  const hasContent = findings.length > 0 || publications.length > 0;

  return (
    <>
      <AdflexHeader logo={brand.logo} navigation={nav} homeHref="/" />

      <main id="main-content">
        <PageHero eyebrow="Findings and papers" title={outcomes.title} />

        <div className={styles.body}>
          <div className="adflex-container">
            {hasContent ? (
              findings.length > 0 ? (
                <section className={listStyles.section} aria-labelledby="findings-heading">
                  <h2 id="findings-heading" className={listStyles.sectionTitle}>
                    Project findings
                  </h2>
                  <div className={listStyles.sectionList}>
                    <FindingList findings={findings} />
                  </div>
                </section>
              ) : null
            ) : (
              <EmptyState
                heading={outcomes.heading}
                body={outcomes.body}
                headingLevel="h2"
              />
            )}

            <section
              id="publications"
              className={listStyles.section}
              aria-labelledby="publications-heading"
            >
              <h2 id="publications-heading" className={listStyles.sectionTitle}>
                Publications
              </h2>
              {publications.length > 0 ? (
                <div className={listStyles.sectionList}>
                  <PublicationList publications={publications} />
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>

      <AdflexFooter logo={brand.logo} />
    </>
  );
}
