import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  heading: string;
  body: string;
};

/**
 * Intentional empty state, used where content genuinely does not exist yet.
 * It must never be replaced with placeholder publications, dates, DOIs,
 * download buttons or statistics.
 */
export function EmptyState({ heading, body }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <h3 className={styles.heading}>{heading}</h3>
      <p className={styles.body}>{body}</p>
    </div>
  );
}
