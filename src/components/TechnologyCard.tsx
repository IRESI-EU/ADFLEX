import type { Technology } from "@/content/adflex";
import styles from "./TechnologyCard.module.css";

type TechnologyCardProps = {
  technology: Technology;
  /** 1-based position, shown as a plain numeric mark. No icon library. */
  index: number;
};

export function TechnologyCard({ technology, index }: TechnologyCardProps) {
  return (
    <article className={styles.card}>
      {/* Decorative: the number repeats list position only, so it is hidden
          from assistive technology. */}
      <p className={styles.mark} aria-hidden="true">
        {String(index).padStart(2, "0")}
      </p>
      <h3 className={styles.name}>{technology.name}</h3>
      <p className={styles.description}>{technology.description}</p>
    </article>
  );
}
