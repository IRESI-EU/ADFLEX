import type { AdflexContent } from "@/content/adflex";
import styles from "./FigureBand.module.css";

type FigureBandProps = {
  figures: AdflexContent["figures"];
};

/**
 * At-a-glance figures.
 *
 * Every number here is already stated in prose elsewhere on the site — this is
 * a second, faster reading of the same facts, not a new claim. Each entry
 * records its `source` in the content file so that stays checkable.
 *
 * Marked up as a definition list: each figure is a term and its meaning, which
 * is what a `dl` is for, and it means the pairing survives without the visual
 * layout. Reveal delays step across the row so the four arrive in sequence.
 */
export function FigureBand({ figures }: FigureBandProps) {
  return (
    <section className={styles.band} aria-label={figures.label}>
      <div className="adflex-container">
        <dl className={styles.grid}>
          {figures.items.map((figure, i) => (
            <div
              key={figure.id}
              className={styles.item}
              data-reveal=""
              style={
                { "--adflex-reveal-delay": `${i * 70}ms` } as React.CSSProperties
              }
            >
              <dt className={styles.value}>
                {figure.prefix ? (
                  <span className={styles.prefix}>{figure.prefix}</span>
                ) : null}
                {figure.value}
              </dt>
              <dd className={styles.label}>{figure.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
