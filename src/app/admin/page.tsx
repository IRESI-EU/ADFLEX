import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import {
  countUnreadMessages,
  listAllFindings,
  listAllNews,
  listAllPublications,
} from "@/lib/repo";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

/**
 * Overview.
 *
 * Counts of what exists and what is still a draft, because the single question
 * an editor has on landing here is "is the thing I wrote actually live?".
 */
export default async function AdminHomePage() {
  const user = await requireUser();

  if (!isDatabaseConfigured()) {
    return (
      <>
        <h1 className={styles.pageTitle}>Overview</h1>
        <p className={styles.error} role="alert">
          <strong>No database.</strong> <code>DATABASE_URL</code> is not set, so
          nothing can be listed or saved. See <code>docs/ADMIN.md</code>.
        </p>
      </>
    );
  }

  const [findings, publications, news, unread] = await Promise.all([
    listAllFindings(),
    listAllPublications(),
    listAllNews(),
    countUnreadMessages(),
  ]);

  const live = <T extends { published: boolean }>(rows: T[]) =>
    rows.filter((row) => row.published).length;

  const cards = [
    {
      href: "/admin/outcomes",
      title: "Project findings",
      live: live(findings),
      total: findings.length,
      unit: "finding",
    },
    {
      href: "/admin/outcomes",
      title: "Publications",
      live: live(publications),
      total: publications.length,
      unit: "publication",
    },
    {
      href: "/admin/news",
      title: "News & events",
      live: live(news),
      total: news.length,
      unit: "entry",
    },
  ];

  return (
    <>
      <h1 className={styles.pageTitle}>Welcome back, {user.name.split(" ")[0]}</h1>
      <p className={styles.pageLead}>
        Anything marked <strong>draft</strong> is saved but not visible on the
        public site. Tick “Published” on an item to put it live.
      </p>

      <ul className={styles.list}>
        {cards.map((card) => (
          <li key={card.title} className={`${styles.item} ${styles.itemNoImage}`}>
            <div className={styles.itemBody}>
              <Link className={styles.itemTitle} href={card.href}>
                {card.title}
              </Link>
              <p className={styles.itemMeta}>
                {card.total === 0
                  ? `No ${card.unit}s yet`
                  : `${card.live} live, ${card.total - card.live} draft, ${card.total} ${card.unit}${card.total === 1 ? "" : "s"} in total`}
              </p>
            </div>
            <div className={styles.itemActions}>
              <span
                className={`${styles.pill} ${card.live > 0 ? styles.pillLive : styles.pillDraft}`}
              >
                {card.live > 0 ? `${card.live} live` : "nothing live"}
              </span>
            </div>
          </li>
        ))}

        <li className={`${styles.item} ${styles.itemNoImage}`}>
          <div className={styles.itemBody}>
            <Link className={styles.itemTitle} href="/admin/messages">
              Contact messages
            </Link>
            <p className={styles.itemMeta}>
              {/* Everything on that page is a message the site could not email,
                  so the count is a fault count, not an inbox count. */}
              {unread === 0
                ? "Nothing unread — contact messages are emailed to the project"
                : `${unread} unread message${unread === 1 ? "" : "s"} that could not be emailed`}
            </p>
          </div>
          <div className={styles.itemActions}>
            <span className={`${styles.pill} ${unread > 0 ? styles.pillDraft : styles.pillLive}`}>
              {unread > 0 ? "needs attention" : "clear"}
            </span>
          </div>
        </li>
      </ul>
    </>
  );
}
