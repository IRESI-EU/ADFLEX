import type { AdflexContent } from "@/content/adflex";
import styles from "./ContactForm.module.css";

type ContactFormProps = {
  form: AdflexContent["contactForm"];
};

/**
 * Contact form template.
 *
 * **Deliberately non-functional.** There is no backend, no form service and no
 * destination for a submission, so every control is `disabled` and the page
 * says so in plain text above the fields.
 *
 * A form that looks live but silently discards messages is worse than no form:
 * someone writes to the project, sees nothing wrong, and never learns their
 * message vanished. The fields stay disabled until there is somewhere for a
 * submission to go — the email address above it is the working route.
 *
 * `disabled` rather than `aria-disabled`: these controls should be skipped in
 * the tab order entirely, not announced as present-but-unavailable, because
 * there is no state in which they become usable on this page.
 */
export function ContactForm({ form }: ContactFormProps) {
  return (
    <section className={styles.wrap} aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className={styles.title}>
        {form.title}
      </h2>

      <p className={styles.pending}>{form.pendingNote}</p>

      <form className={styles.form}>
        {/* `inert` keeps the whole group out of the tab order and out of the
            accessibility tree, so it cannot be filled in by any input method. */}
        <fieldset className={styles.fields} disabled>
          <legend className={styles.legend}>Message details</legend>

          {form.fields.map((field) => (
            <p key={field.id} className={styles.field}>
              <label className={styles.label} htmlFor={`contact-${field.id}`}>
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={`contact-${field.id}`}
                  name={field.id}
                  className={styles.textarea}
                  rows={5}
                />
              ) : (
                <input
                  id={`contact-${field.id}`}
                  name={field.id}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  className={styles.input}
                />
              )}
            </p>
          ))}

          <p className={styles.actions}>
            <button type="submit" className="adflex-cta">
              {form.submitLabel}
            </button>
          </p>
        </fieldset>
      </form>
    </section>
  );
}
