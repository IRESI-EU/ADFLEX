import Link from "next/link";
import type { AwaitingContentPage } from "@/content/adflex";
import { EmptyState } from "./EmptyState";
import styles from "./AwaitingContent.module.css";

type AwaitingContentProps = {
  page: AwaitingContentPage;
};

/** Honest empty state for a route that has no approved published entries yet. */
export function AwaitingContent({ page }: AwaitingContentProps) {
  return (
    <div className={styles.body}>
      <div className="adflex-container">
        <EmptyState heading={page.heading} body={page.body} headingLevel="h2" />

        <p className={styles.contact}>
          In the meantime,{" "}
          <Link className="adflex-link" href="/contact">
            get in touch with the project team
          </Link>
          .
        </p>
      </div>
    </div>
  );
}