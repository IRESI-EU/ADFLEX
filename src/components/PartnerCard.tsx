import Image from "next/image";
import type { Partner } from "@/content/adflex";
import styles from "./PartnerCard.module.css";

type PartnerCardProps = {
  partner: Partner;
};

/**
 * Partner card: a logo plate above the organisation name.
 *
 * The three supplied logos are very different shapes — two wide wordmarks and
 * one tall crest — so the plate is a fixed box that each logo is fitted into.
 * That is what keeps a row of them optically level; sizing to the artwork
 * instead would leave them at three different visual weights.
 *
 * Shows decorative initials when a partner has no logo yet. Partner roles,
 * descriptions, URLs and countries have not been supplied and must not be
 * invented.
 */
export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    // `adflex-light` pins the light palette. The consortium section is light
    // today, but its `tone` is a prop — if it ever becomes a deep band these
    // cards must not follow, because the partner logos are supplied with opaque
    // light backgrounds and cannot sit on a dark colour.
    <article className={`${styles.card} adflex-light`}>
      <div className={styles.plate}>
        {partner.logo ? (
          // alt is empty on purpose: the partner name is rendered as real text
          // directly below, so announcing it twice would just be noise.
          <Image
            className={styles.logo}
            src={partner.logo.src}
            alt=""
            width={partner.logo.width}
            height={partner.logo.height}
            sizes="200px"
          />
        ) : (
          <p className={styles.initials} aria-hidden="true">
            {partner.initials}
          </p>
        )}
      </div>

      <h3 className={styles.name}>{partner.name}</h3>
    </article>
  );
}
