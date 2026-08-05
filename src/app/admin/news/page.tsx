import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { getNewsItem, listAllNews } from "@/lib/repo";
import { removeNewsItem, setNewsPublished } from "../actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
import { NewsForm } from "../forms";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

/** Formats `YYYY-MM-DD` for display without constructing a Date, so no timezone can shift it. */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

/**
 * News and events, one list because they are one public route — `/news` was
 * merged from two pages on 30 July 2026.
 */
export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <>
        <h1 className={styles.pageTitle}>News &amp; Events</h1>
        <p className={styles.error} role="alert">
          <strong>No database.</strong> <code>DATABASE_URL</code> is not set. See{" "}
          <code>docs/ADMIN.md</code>.
        </p>
      </>
    );
  }

  const items = await listAllNews();
  const editing = params.edit ? await getNewsItem(Number(params.edit)) : null;

  return (
    <>
      <h1 className={styles.pageTitle}>News &amp; Events</h1>
      <p className={styles.pageLead}>
        Published entries appear on <Link href="/news">the public News and Events page</Link>.
        An event also carries a date and a location; news does not.
      </p>

      {params.saved ? (
        <p className={styles.success} role="status">
          <strong>Saved.</strong> Your entry has been stored.
        </p>
      ) : null}

      <section className={styles.panel} aria-labelledby="news-form-heading">
        <h2 id="news-form-heading" className={styles.panelTitle}>
          {editing ? `Editing: ${editing.title}` : "Add news or an event"}
        </h2>
        {editing ? (
          <p className={styles.panelNote}>
            <Link href="/admin/news">Cancel and add a new one instead.</Link>
          </p>
        ) : null}

        <NewsForm key={editing?.id ?? "new"} item={editing ?? undefined} />
      </section>

      <section className={styles.panel} aria-labelledby="news-list-heading">
        <h2 id="news-list-heading" className={styles.panelTitle}>
          Entries ({items.length})
        </h2>

        {items.length === 0 ? (
          <p className={styles.empty}>
            Nothing yet. The public page shows its “nothing published” state,
            which is deliberate — it never shows sample posts.
          </p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li
                key={item.id}
                className={`${styles.item} ${item.image_id ? "" : styles.itemNoImage}`}
              >
                {item.image_id ? (
                  // eslint-disable-next-line @next/next/no-img-element -- database-backed route
                  <img
                    className={styles.thumb}
                    src={`/media/${item.image_id}`}
                    alt={item.image_alt || ""}
                    width={84}
                  />
                ) : null}

                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemMeta}>
                    {item.kind === "event"
                      ? `Event · ${item.event_date ? formatDate(item.event_date) : "no date"}${item.location ? ` · ${item.location}` : ""}`
                      : `News · posted ${formatDate(item.published_on)}`}
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <span
                    className={`${styles.pill} ${item.published ? styles.pillLive : styles.pillDraft}`}
                  >
                    {item.published ? "Live" : "Draft"}
                  </span>
                  <Link className={styles.tab} href={`/admin/news?edit=${item.id}`}>
                    Edit
                  </Link>
                  <form action={setNewsPublished}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="publish" value={item.published ? "0" : "1"} />
                    <ConfirmSubmit
                      className={styles.tab}
                      pendingLabel="Working…"
                      message={
                        item.published
                          ? `Unpublish “${item.title}”?\n\nIt will be removed from the public News and Events page immediately. Nothing is deleted — it goes back to being a draft.`
                          : `Publish “${item.title}”?\n\nIt will appear on the public News and Events page immediately.`
                      }
                    >
                      {item.published ? "Unpublish" : "Publish"}
                    </ConfirmSubmit>
                  </form>
                  <form action={removeNewsItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmit
                      className={styles.danger}
                      pendingLabel="Deleting…"
                      message={`Delete “${item.title}”?\n\nThis cannot be undone. The entry and its text are removed permanently.`}
                    >
                      Delete
                    </ConfirmSubmit>
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
