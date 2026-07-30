import type { AdflexContent } from "@/content/adflex";
import styles from "./NewsletterSignup.module.css";

type NewsletterSignupProps = {
  newsletter: AdflexContent["newsletter"];
};

/**
 * Newsletter sign-up block.
 *
 * **Deliberately inactive.** No mailing list has been set up and no provider
 * chosen, so the button is `disabled` and the note beside it says so.
 *
 * A live-looking sign-up button that does nothing collects nobody and teaches
 * visitors the site is broken; worse, if it were wired to a placeholder it
 * would be collecting email addresses with no lawful basis and no privacy
 * policy — the policy pages are unpublished too. Inactive is the only honest
 * state until both exist.
 *
 * Sits in the accent band rather than a deep one: it closes the home page
 * directly after the dark Pilot section, and a second dark band there reads as
 * a continuation of the pilot rather than a separate call to action.
 */
export function NewsletterSignup({ newsletter }: NewsletterSignupProps) {
  return (
    <section
      className={`${styles.band} adflex-accent`}
      aria-labelledby="newsletter-heading"
    >
      <div className={`adflex-container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className="adflex-eyebrow">{newsletter.eyebrow}</p>
          <h2 id="newsletter-heading" className={styles.title}>
            {newsletter.title}
          </h2>
          <p className={styles.body}>{newsletter.body}</p>
        </div>

        <div className={styles.action}>
          <button type="button" className="adflex-cta" disabled>
            {newsletter.buttonLabel}
          </button>
          <p className={styles.pending}>{newsletter.pendingNote}</p>
        </div>
      </div>
    </section>
  );
}
