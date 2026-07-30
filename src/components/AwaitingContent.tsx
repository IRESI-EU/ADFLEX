import type { AwaitingContentPage, ContactDetails } from "@/content/adflex";
import { EmptyState } from "./EmptyState";
import styles from "./AwaitingContent.module.css";

type AwaitingContentProps = {
  page: AwaitingContentPage;
  /** Offers a way to reach someone while the page has nothing on it. */
  contact: ContactDetails;
};

/**
 * Body for a route that exists structurally but has no approved content yet —
 * News, Events and the three legal pages.
 *
 * It states plainly that nothing is published rather than showing sample
 * entries. A placeholder news post or a specimen privacy policy reads as real
 * the moment someone lands on it, and on an EU-funded project site that is a
 * false statement, not a design detail.
 *
 * The `h2` sits directly under the page `h1` from `PageHero`, so `EmptyState`
 * is told to render at that level rather than its default `h3`.
 */
export function AwaitingContent({ page, contact }: AwaitingContentProps) {
  return (
    <div className={styles.body}>
      <div className="adflex-container">
        <EmptyState heading={page.heading} body={page.body} headingLevel="h2" />

        <p className={styles.contact}>
          In the meantime, contact the project at{" "}
          <a className="adflex-link" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}
