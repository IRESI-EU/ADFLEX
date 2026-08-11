import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { getNewsItem, isEvent, listAllNews } from "@/lib/repo";
import { removeNewsItem, setNewsPublished, setNewsSlotsFilled } from "../actions";
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

/** " at 14:30–16:00", " at 14:30", " until 16:00", or nothing. */
function formatTimes(start: string | null, end: string | null): string {
  if (start && end) return ` at ${start}–${end}`;
  if (start) return ` at ${start}`;
  if (end) return ` until ${end}`;
  return "";
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
        An <strong>upcoming event</strong> leads that page, carries a booking
        link, can be marked full, and comes off the page by itself at its end
        time; an event that has already been held is kept there as a record.
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
                className={`${styles.item} ${item.images.length > 0 ? "" : styles.itemNoImage}`}
              >
                {/* The first image stands for the set; the count follows in the
                    metadata line, so the row stays one line tall. */}
                {item.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element -- database-backed route
                  <img
                    className={styles.thumb}
                    src={`/media/${item.images[0].id}`}
                    alt={item.images[0].alt || ""}
                    width={84}
                  />
                ) : null}

                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemMeta}>
                    {isEvent(item.kind)
                      ? `${item.kind === "upcoming" ? "Upcoming event" : "Event"} · ${item.event_date ? formatDate(item.event_date) : "no date"}${formatTimes(item.event_time, item.event_end_time)}${item.location ? ` · ${item.location}` : ""}`
                      : `News · posted ${formatDate(item.published_on)}`}
                    {item.images.length > 0
                      ? ` · ${item.images.length} image${item.images.length === 1 ? "" : "s"}`
                      : ""}
                    {item.kind === "upcoming" && item.booking_url ? " · booking link" : ""}
                    {/* Only when it has been set. Printing "order 0" on every
                        row would be noise on a site that never uses it. */}
                    {item.sort_order !== 0 ? ` · order ${item.sort_order}` : ""}
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <span
                    className={`${styles.pill} ${item.published ? styles.pillLive : styles.pillDraft}`}
                  >
                    {item.published ? "Live" : "Draft"}
                  </span>
                  {/* Says at a glance which upcoming events are full, without
                      opening each one. */}
                  {item.kind === "upcoming" && item.slots_filled ? (
                    <span className={`${styles.pill} ${styles.pillDraft}`}>Full</span>
                  ) : null}
                  {/*
                   * An expired event has come off the public page on its own,
                   * at its end time. Saying so here is the whole point of not
                   * deleting it: the entry is still yours to keep as a record
                   * or remove, and without this pill it would look published
                   * and simply not be there.
                   */}
                  {item.expired ? (
                    <span className={`${styles.pill} ${styles.pillDraft}`}>Expired</span>
                  ) : null}

                  <Link className={styles.tab} href={`/admin/news?edit=${item.id}`}>
                    Edit
                  </Link>

                  {/*
                   * Marking an event full is a thing that happens between
                   * meetings, not while editing copy, so it gets a button on
                   * the row like Publish does. Only for an upcoming event —
                   * nothing else can be booked.
                   *
                   * No confirmation dialogue: unlike deleting, and unlike
                   * publishing, this is reversible in one click and changes a
                   * line of text rather than what is public.
                   */}
                  {item.kind === "upcoming" ? (
                    <form action={setNewsSlotsFilled}>
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="filled"
                        value={item.slots_filled ? "0" : "1"}
                      />
                      <button type="submit" className={styles.tab}>
                        {item.slots_filled ? "Places available" : "Mark full"}
                      </button>
                    </form>
                  ) : null}
                  <form action={setNewsPublished}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="publish" value={item.published ? "0" : "1"} />
                    <ConfirmSubmit
                      className={styles.tab}
                      pendingLabel="Working…"
                      title={
                        item.published
                          ? `Unpublish “${item.title}”?`
                          : `Publish “${item.title}”?`
                      }
                      detail={
                        item.published
                          ? "It will be removed from the public News and Events page immediately. Nothing is deleted — it goes back to being a draft and you can publish it again."
                          : "It will appear on the public News and Events page immediately."
                      }
                      confirmLabel={item.published ? "Unpublish" : "Publish"}
                    >
                      {item.published ? "Unpublish" : "Publish"}
                    </ConfirmSubmit>
                  </form>
                  <form action={removeNewsItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmit
                      className={styles.danger}
                      pendingLabel="Deleting…"
                      destructive
                      title={`Delete “${item.title}”?`}
                      detail="This cannot be undone. The entry, its text and its images are removed permanently."
                      confirmLabel="Delete permanently"
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
