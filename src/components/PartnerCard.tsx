import type { Partner } from "@/content/adflex";
import styles from "./PartnerCard.module.css";

type PartnerCardProps = {
  partner: Partner;
};

/**
 * Text-only partner card. Partner roles, descriptions, logos, URLs and
 * countries have not been supplied, so nothing beyond the name is shown.
 * The initials are a decorative placeholder, not an official logo.
 */
export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.initials} aria-hidden="true">
        {partner.initials}
      </p>
      <h3 className={styles.name}>{partner.name}</h3>
    </article>
  );
}
