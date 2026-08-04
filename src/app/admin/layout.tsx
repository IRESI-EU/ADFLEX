import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { countUnreadMessages } from "@/lib/repo";
import { signOut } from "./actions";
import styles from "./admin.module.css";

/**
 * The admin shell.
 *
 * `noindex, nofollow` because this must never appear in a search result. That
 * is presentation, not protection — the real guard is `requireUser()` on each
 * page and `requireEditor()` in each action.
 *
 * Rendered per request: it reads the session cookie, which is request data.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ADFLEX admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // The login page renders inside this layout too, and it has no signed-in
  // user. Showing the bare card rather than an empty navigation bar above it.
  if (!user) return <>{children}</>;

  let unread = 0;
  if (isDatabaseConfigured()) {
    try {
      unread = await countUnreadMessages();
    } catch {
      // A count is decoration. Losing it must not take the whole admin down.
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <span className={styles.brand}>
          ADFLEX
          <span className={styles.brandTag}>Admin</span>
        </span>

        <nav aria-label="Admin sections">
          <ul className={styles.tabs}>
            <li>
              <Link className={styles.tab} href="/admin">
                Overview
              </Link>
            </li>
            <li>
              <Link className={styles.tab} href="/admin/outputs">
                Outputs
              </Link>
            </li>
            <li>
              <Link className={styles.tab} href="/admin/news">
                News &amp; Events
              </Link>
            </li>
            <li>
              <Link className={styles.tab} href="/admin/messages">
                Messages
                {unread > 0 ? (
                  <span className={styles.badge}>
                    {unread}
                    <span className="adflex-visually-hidden"> unread</span>
                  </span>
                ) : null}
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.who}>
          <span>{user.name}</span>
          <form action={signOut}>
            <button type="submit" className={styles.linkButton}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
