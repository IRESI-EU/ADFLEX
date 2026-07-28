import type { DesignSystemSection } from "@/content/design-system";
import styles from "./DesignSystemNav.module.css";

type DesignSystemNavProps = {
  title: string;
  sections: readonly DesignSystemSection[];
};

/**
 * Section navigation for the design-system page: a persistent sidebar on
 * desktop and a compact wrapping anchor list on mobile. One nav landmark,
 * switched by CSS only.
 */
export function DesignSystemNav({ title, sections }: DesignSystemNavProps) {
  return (
    <nav className={styles.nav} aria-labelledby="design-system-nav-title">
      <h2 id="design-system-nav-title" className={styles.title}>
        {title}
      </h2>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <a className={styles.link} href={`#${section.id}`}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
