import type { PilotContent } from "@/content/adflex";
import { SectionShell } from "./SectionShell";
import styles from "./PilotSection.module.css";

type PilotSectionProps = {
  id: string;
  content: PilotContent;
};

/**
 * Pilot section. Only information present in the supplied pilot description is
 * shown — no pilot statistics or results are invented.
 */
export function PilotSection({ id, content }: PilotSectionProps) {
  return (
    <SectionShell id={id} title={content.title} tone="soft">
      <div className={styles.layout}>
        <div className={styles.body}>
          <h3 className={styles.subtitle}>{content.subtitle}</h3>
          <p className={styles.text}>{content.body}</p>
        </div>

        <div className={styles.aside}>
          <h3 className={styles.asideTitle}>Assets and programmes involved</h3>
          <ul className={styles.assets}>
            {content.assets.map((asset) => (
              <li key={asset} className={styles.asset}>
                {asset}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
