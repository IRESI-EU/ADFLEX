import type { ContactDetails } from "@/content/adflex";
import styles from "./ContactBlock.module.css";

type ContactBlockProps = {
  contact: ContactDetails;
  /** Hide the intro sentence where the surrounding section already sets it up. */
  showIntro?: boolean;
};

/**
 * Contact details rendered from the typed content file. There is no contact
 * form — email is a plain `mailto:` link.
 */
export function ContactBlock({ contact, showIntro = true }: ContactBlockProps) {
  return (
    <div className={styles.block}>
      {showIntro ? <p className={styles.intro}>{contact.intro}</p> : null}

      <dl className={styles.details}>
        <div className={styles.row}>
          <dt className={styles.label}>Email</dt>
          <dd className={styles.value}>
            <a className="adflex-link" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </dd>
        </div>

        <div className={styles.row}>
          <dt className={styles.label}>Organisation</dt>
          <dd className={styles.value}>{contact.organisation}</dd>
        </div>

        <div className={styles.row}>
          <dt className={styles.label}>Address</dt>
          <dd className={styles.value}>
            <address className={styles.address}>
              {contact.addressLines.map((line) => (
                <span key={line} className={styles.addressLine}>
                  {line}
                </span>
              ))}
            </address>
          </dd>
        </div>
      </dl>
    </div>
  );
}
