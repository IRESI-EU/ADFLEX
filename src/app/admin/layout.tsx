import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { countUnreadMessages } from "@/lib/repo";
import { signOut } from "./actions";
import { AdminTabs } from "./AdminTabs";
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
  // `absolute` opts out of the root layout's "%s — ADFLEX" template, which
  // would otherwise render this as "ADFLEX admin — ADFLEX".
  title: { absolute: "ADFLEX admin" },
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

        <AdminTabs
          tabs={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/outputs", label: "Outputs" },
            { href: "/admin/news", label: "News & Events" },
            {
              href: "/admin/messages",
              label: "Messages",
              badge:
                unread > 0 ? (
                  <span className={styles.badge}>
                    {unread}
                    <span className="adflex-visually-hidden"> unread</span>
                  </span>
                ) : null,
            },
          ]}
        />

        <div className={styles.who}>
          <span>{user.name}</span>
          <form action={signOut}>
            <button type="submit" className={styles.linkButton}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* `id="main-content"` is the target of the skip link, which the root
          layout renders on every route including these. Without it the first
          tab stop on every admin screen pointed at a fragment that did not
          exist, so the one control that exists to bypass the navigation
          silently did nothing. */}
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
