import { requireUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
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

  return (
    <>
      <h1 className={styles.pageTitle}>Messages</h1>
      <p className={styles.pageLead}>
        Sent through the contact form. Replying happens in your email client —
        this is a record, not an inbox. Deleting a message removes it
        permanently, which is what an erasure request needs.
      </p>

      {messages.length === 0 ? (
        <p className={styles.empty}>No messages yet.</p>
      ) : (
        <ul className={styles.list}>
          {messages.map((message) => (
            <li key={message.id} className={`${styles.item} ${styles.itemNoImage}`}>
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
    </>
  );
}
