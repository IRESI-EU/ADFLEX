"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { AdflexContent } from "@/content/adflex";
import { submitContact } from "@/app/contact/actions";
import styles from "./ContactForm.module.css";

type ContactFormProps = {
  form: AdflexContent["contactForm"];
  /**
   * False when there is no `DATABASE_URL`, in which case the fields stay
   * disabled exactly as they were before this form had a backend.
   */
  enabled: boolean;
};

/**
 * Contact form.
 *
 * **Live since 31 July 2026**, when the admin gave submissions somewhere to go.
 * Before that every control was `disabled`, because a form that looks live but
 * silently discards messages is worse than no form: someone writes to the
 * project, sees nothing wrong, and never learns their message vanished.
 *
 * That reasoning still governs the `enabled` prop. Deployed without a database,
 * the fields go back to being disabled and the page says so — the form is only
 * interactive when a submission genuinely lands in a table someone reads.
 *
 * `disabled` rather than `aria-disabled` in that state: the controls should be
 * skipped in the tab order entirely, not announced as present-but-unavailable,
 * because there is no state in which they become usable on that deployment.
 */
export function ContactForm({ form, enabled }: ContactFormProps) {
  /**
   * Sending a second message without reloading the page.
   *
   * The reset has to happen by **remounting**, which is why this thin wrapper
   * exists at all. `useActionState` keeps its result until the action runs
   * again, so there is no "clear it" call to make; and re-rendering the same
   * form in place would leave the previous answers sitting in the fields.
   * Changing the key throws the old instance away and mounts a fresh one, which
   * clears the confirmation and the inputs in one move.
   *
   * Holding the counter in the same component as `useActionState` would not
   * work — the state to be discarded lives inside the thing being replaced.
   */
  const [attempt, setAttempt] = useState(0);

  return (
    <ContactFormBody
      key={attempt}
      form={form}
      enabled={enabled}
      onSendAnother={() => setAttempt((n) => n + 1)}
    />
  );
}

function ContactFormBody({
  form,
  enabled,
  onSendAnother,
}: ContactFormProps & { onSendAnother: () => void }) {
  const [state, action] = useActionState(submitContact, {});

  if (state.sent) {
    return (
      <section className={styles.wrap} aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading" className={styles.title}>
          {form.title}
        </h2>
        <p className={styles.sent} role="status">
          <strong>Thank you — your message has been sent.</strong> Someone on the
          project team will read it. If it is urgent, email us at the address
          above rather than waiting for a reply here.
        </p>
        <p className={styles.actions}>
          <button type="button" className="adflex-cta-quiet" onClick={onSendAnother}>
            Send another message
          </button>
        </p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className={styles.title}>
        {form.title}
      </h2>

      {!enabled ? <p className={styles.pending}>{form.pendingNote}</p> : null}

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <form className={styles.form} action={action}>
        <fieldset className={styles.fields} disabled={!enabled}>
          <legend className={styles.legend}>Message details</legend>

          {/* Honeypot. Hidden from sight and from assistive technology, and
              never focusable, so no real person can fill it in — which is what
              makes a filled value a reliable signal of an automated post. */}
          <p className={styles.honeypot} aria-hidden="true">
            <label htmlFor="contact-website">Leave this field empty</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </p>

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
                  maxLength={4000}
                  required
                />
              ) : (
                <input
                  id={`contact-${field.id}`}
                  name={field.id}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  className={styles.input}
                  maxLength={field.id === "message" ? 4000 : 200}
                  required={field.id !== "subject"}
                />
              )}
            </p>
          ))}

          <p className={styles.privacy}>
            Your name, email address and message are stored so the project team
            can reply. See our{" "}
            <Link className="adflex-link" href="/legal/privacy">
              Privacy Policy
            </Link>
            .
          </p>

          <p className={styles.actions}>
            <SubmitButton label={form.submitLabel} />
          </p>
        </fieldset>
      </form>
    </section>
  );
}

/** Split out because `useFormStatus` only reports for a form above it in the tree. */
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adflex-cta" disabled={pending}>
      {pending ? "Sending…" : label}
    </button>
  );
}
