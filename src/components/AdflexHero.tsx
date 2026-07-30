import Image from "next/image";
import type { HeroContent } from "@/content/adflex";
import { GlossaryTerm } from "./GlossaryTerm";
import { NavLink } from "./NavLink";
import styles from "./AdflexHero.module.css";

type AdflexHeroProps = {
  id: string;
  content: HeroContent;
};

/**
 * Splits the tagline around the first occurrence of the glossary term, so the
 * term can be rendered as an interactive element without the copy being stored
 * as pre-chopped fragments. Falls back to the plain tagline if the term is not
 * found, so a content typo degrades to plain text rather than losing a sentence.
 */
function splitTagline(tagline: string, term: string) {
  const start = tagline.indexOf(term);
  if (start === -1) return null;
  return {
    before: tagline.slice(0, start),
    after: tagline.slice(start + term.length),
  };
}

/**
 * Hero: text, call to action, then the full-width project diagram with its
 * caption. The standalone logo is deliberately not repeated here — it is
 * already in the header and inside the diagram itself.
 */
export function AdflexHero({ id, content }: AdflexHeroProps) {
  const tagline = splitTagline(content.tagline, content.glossary.term);

  return (
    <section
      id={id}
      aria-labelledby="hero-heading"
      className={`${styles.hero} adflex-band`}
    >
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
        <p className={styles.tagline}>
          {tagline ? (
            <>
              {tagline.before}
              <GlossaryTerm
                term={content.glossary.term}
                definition={content.glossary.definition}
              />
              {tagline.after}
            </>
          ) : (
            content.tagline
          )}
        </p>

        <p className={styles.actions}>
          {/* NavLink so the CTA works whether it points at a section anchor or
              at a route of its own. */}
          <NavLink className="adflex-cta" href={content.cta.href}>
            {content.cta.label}
          </NavLink>
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
      </div>
    </section>
  );
}
