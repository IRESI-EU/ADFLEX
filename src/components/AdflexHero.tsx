import Image from "next/image";
import type { HeroContent } from "@/content/adflex";
import styles from "./AdflexHero.module.css";

type AdflexHeroProps = {
  id: string;
  content: HeroContent;
};

/**
 * Hero: text, call to action, then the full-width project diagram with its
 * caption. The standalone logo is deliberately not repeated here — it is
 * already in the header and inside the diagram itself.
 */
export function AdflexHero({ id, content }: AdflexHeroProps) {
  return (
    <section id={id} aria-labelledby="hero-heading" className={styles.hero}>
      <div className="adflex-container">
        <ul className={`adflex-tag-list ${styles.tags}`}>
          {content.tags.map((tag) => (
            <li key={tag} className="adflex-tag">
              {tag}
            </li>
          ))}
        </ul>

        <h1 id="hero-heading" className={styles.headline}>
          {content.headline}
        </h1>
        <p className={styles.tagline}>{content.tagline}</p>
        <p className={styles.explainer}>{content.explainer}</p>

        <p className={styles.actions}>
          <a className="adflex-cta" href={content.cta.href}>
            {content.cta.label}
          </a>
        </p>
      </div>

      <div className={`adflex-container ${styles.diagramWrap}`}>
        <figure className={styles.figure}>
          {/* Displayed at its full intrinsic ratio so no label is cropped, and
              no text is placed over it. */}
          <Image
            className={styles.diagram}
            src={content.diagram.src}
            alt={content.diagram.alt}
            width={content.diagram.width}
            height={content.diagram.height}
            sizes="(max-width: 1200px) 100vw, 1160px"
            priority
          />
          <figcaption className={styles.caption}>
            {content.diagram.caption}
          </figcaption>
        </figure>

        {/* The diagram's labels also exist as real text, so the concepts are
            never communicated by the image alone. */}
        <h2 className={styles.conceptsTitle}>What the diagram shows</h2>
        <ul className={styles.concepts}>
          {content.diagram.concepts.map((concept) => (
            <li key={concept} className={styles.concept}>
              {concept}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
