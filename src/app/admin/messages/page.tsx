import { requireUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { contactRecipient, isMailConfigured } from "@/lib/mail";
import { listMessages } from "@/lib/repo";
import { markRead, removeMessage } from "../actions";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

/**
 * Contact form submissions.
 *
 * ---------------------------------------------------------------------------
 * THIS PAGE SHOWS OTHER PEOPLE'S PERSONAL DATA
 * ---------------------------------------------------------------------------
 * Names, email addresses and whatever someone chose to write to the project.
 * Maynooth University is the controller named in the privacy policy. Three
 * things follow, and they are the reason this page is as plain as it is:
 *
 * - There is no bulk export, because a CSV of enquiries is the easiest way for
 *   personal data to end up somewhere nobody is tracking.
 * - Delete really deletes the row. That is what honouring an erasure request
 *   looks like, so it must not become a soft "archived" flag.
 * - The message body is rendered as text, never as HTML — the sender is an
 *   anonymous member of the public and this is the one place their words are
 *   shown back to a signed-in person.
 */
export default async function AdminMessagesPage() {
  await requireUser();

  if (!isDatabaseConfigured()) {
    return (
      <>
        <h1 className={styles.pageTitle}>Messages</h1>
        <p className={styles.error} role="alert">
          <strong>No database.</strong> <code>DATABASE_URL</code> is not set, so
          the contact form is switched off and nothing is being collected.
        </p>
      </>
    );
  }

  const messages = await listMessages();
  const recipient = contactRecipient();
  const canSend = isMailConfigured();

  return (
    <>
      <h1 className={styles.pageTitle}>Messages</h1>
      <p className={styles.pageLead}>
        <strong>Anything here failed to reach the project mailbox.</strong>{" "}
        Contact form messages are emailed to the project, and only land on this
        page when that email could not be sent — so these still need answering,
        and a message arriving here means the email settings are worth checking.
        Replying happens in your email client. Deleting a message removes it
        permanently, which is what an erasure request needs.
      </p>

      {/*
       * Where the messages go is stated here, not editable here.
       *
       * It is one line in `src/lib/site.ts`, and saying so is more useful than a
       * box on this page would be: an editor who needs to know can read it, and
       * an editor who needs to change it is told exactly where to go rather than
       * discovering later that the same address also exists somewhere else.
       */}
      <p className={styles.panelNote}>
        {canSend ? (
          <>
            Messages are emailed to <strong>{recipient}</strong>.
          </>
        ) : (
          <>
            <strong>Not sending yet.</strong> Messages are meant to go to{" "}
            <strong>{recipient}</strong>, but the mail server is not set up, so
            they are all landing here instead.
          </>
        )}{" "}
        To change where they go, edit <code>CONTACT_EMAIL</code> in{" "}
        <code>src/lib/site.ts</code> and restart the site. The mailbox they are
        sent <em>from</em> is a separate setting beside it,{" "}
        <code>MAIL_SENDER</code> — the site has to sign in to something, and that
        need not be the address receiving them. See <code>docs/ADMIN.md</code>.
      </p>

      <section
        className={styles.panel}
        aria-labelledby="failed-messages-heading"
      >
        <h2 id="failed-messages-heading" className={styles.panelTitle}>
          Messages that could not be sent ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <p className={styles.empty}>
            Nothing here — which is the good state. It means every message sent
            through the contact form reached the project mailbox.
          </p>
        ) : (
          <ul className={styles.list}>
            {messages.map((message) => (
              <li
                key={message.id}
                className={`${styles.item} ${styles.itemNoImage}`}
              >
                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>
                    {message.subject || "(no subject)"}
                  </p>
                  <p className={styles.itemMeta}>
                    {message.name} ·{" "}
                    <a href={`mailto:${encodeURIComponent(message.email)}`}>
                      {message.email}
                    </a>{" "}
                    · {message.created_at.slice(0, 16).replace("T", " ")}
                  </p>
                  {/* `white-space: pre-wrap` via the class keeps the sender's line
                    breaks without interpreting anything they typed. */}
                  <p className={styles.messageBody}>{message.message}</p>
                </div>

                <div className={styles.itemActions}>
                  <span
                    className={`${styles.pill} ${message.read_at ? styles.pillLive : styles.pillDraft}`}
                  >
                    {message.read_at ? "Read" : "New"}
                  </span>
                  {!message.read_at ? (
                    <form action={markRead}>
                      <input type="hidden" name="id" value={message.id} />
                      <button type="submit" className={styles.tab}>
                        Mark read
                      </button>
                    </form>
                  ) : null}
                  <form action={removeMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <button type="submit" className={styles.danger}>
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
