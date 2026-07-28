import type { ReactNode } from "react";
import styles from "./SectionShell.module.css";

type SectionShellProps = {
  /** Stable section id, kept in sync with the navigation ids in content. */
  id: string;
  title: string;
  /** Optional short lead paragraph shown under the section heading. */
  intro?: string;
  /** Alternate background, used to separate adjacent sections. */
  tone?: "default" | "soft";
  children: ReactNode;
};

/**
 * Standard section wrapper: landmark, container, heading and vertical rhythm.
 * `scroll-margin-top` keeps anchored sections clear of the sticky header.
 */
export function SectionShell({
  id,
  title,
  intro,
  tone = "default",
  children,
}: SectionShellProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`${styles.section} ${tone === "soft" ? styles.soft : ""}`}
    >
      <div className="adflex-container">
        <div className={styles.head}>
          <h2 id={headingId}>{title}</h2>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
