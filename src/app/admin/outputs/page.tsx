import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import {
  doiUrl,
  getFinding,
  getPublication,
  listAllFindings,
  listAllPublications,
} from "@/lib/repo";
import { removeFinding, removePublication } from "../actions";
import { FindingForm, PublicationForm } from "../forms";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

/**
 * Project findings and publications, on one page because they are one public
 * page — `/outputs` shows both.
 *
 * Editing happens in place: `?editFinding=3` swaps the "add" form for that
 * row's values. That keeps the whole surface at two URLs instead of six, and it
 * means a bookmarked edit link still works.
 */
export default async function AdminOutputsPage({
  searchParams,
}: {
  searchParams: Promise<{ editFinding?: string; editPublication?: string; saved?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <>
        <h1 className={styles.pageTitle}>Outputs</h1>
        <p className={styles.error} role="alert">
          <strong>No database.</strong> <code>DATABASE_URL</code> is not set. See{" "}
          <code>docs/ADMIN.md</code>.
        </p>
      </>
    );
  }

  const [findings, publications] = await Promise.all([
    listAllFindings(),
    listAllPublications(),
  ]);

  const editingFinding = params.editFinding
    ? await getFinding(Number(params.editFinding))
    : null;
  const editingPublication = params.editPublication
    ? await getPublication(Number(params.editPublication))
    : null;

  return (
    <>
      <h1 className={styles.pageTitle}>Outputs</h1>
      <p className={styles.pageLead}>
        Everything here appears on <Link href="/outputs">the public Outputs page</Link>{" "}
        once it is published.
      </p>

      {params.saved ? (
        <p className={styles.success} role="status">
          <strong>Saved.</strong> Your {params.saved} has been stored.
        </p>
      ) : null}

      {/* ---- Findings -------------------------------------------------- */}
      <section className={styles.panel} aria-labelledby="findings-heading">
        <h2 id="findings-heading" className={styles.panelTitle}>
          {editingFinding ? `Editing: ${editingFinding.title}` : "Add a project finding"}
        </h2>
        <p className={styles.panelNote}>
          A result the project can stand behind, with an optional image.
          {editingFinding ? (
            <>
              {" "}
              <Link href="/admin/outputs">Cancel and add a new one instead.</Link>
            </>
          ) : null}
        </p>

        <FindingForm key={editingFinding?.id ?? "new"} finding={editingFinding ?? undefined} />
      </section>

      <section className={styles.panel} aria-labelledby="findings-list-heading">
        <h2 id="findings-list-heading" className={styles.panelTitle}>
          Findings ({findings.length})
        </h2>

        {findings.length === 0 ? (
          <p className={styles.empty}>
            No findings yet. The public page shows its “nothing published” state.
          </p>
        ) : (
          <ul className={styles.list}>
            {findings.map((finding) => (
              <li
                key={finding.id}
                className={`${styles.item} ${finding.image_id ? "" : styles.itemNoImage}`}
              >
                {finding.image_id ? (
                  // eslint-disable-next-line @next/next/no-img-element -- database-backed route
                  <img
                    className={styles.thumb}
                    src={`/media/${finding.image_id}`}
                    alt={finding.image_alt || ""}
                    width={84}
                  />
                ) : null}

                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{finding.title}</p>
                  <p className={styles.itemMeta}>
                    {finding.summary || "No summary"} · order {finding.sort_order}
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <span
                    className={`${styles.pill} ${finding.published ? styles.pillLive : styles.pillDraft}`}
                  >
                    {finding.published ? "Live" : "Draft"}
                  </span>
                  <Link className={styles.tab} href={`/admin/outputs?editFinding=${finding.id}`}>
                    Edit
                  </Link>
                  {/* No confirm dialog: a Server Action form posts straight
                      through. The delete is one row and re-adding is quick;
                      a modal here would need a client component for no real
                      protection. */}
                  <form action={removeFinding}>
                    <input type="hidden" name="id" value={finding.id} />
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

      {/* ---- Publications ---------------------------------------------- */}
      <section className={styles.panel} aria-labelledby="publications-heading">
        <h2 id="publications-heading" className={styles.panelTitle}>
          {editingPublication
            ? `Editing: ${editingPublication.title}`
            : "Add a publication"}
        </h2>
        <p className={styles.panelNote}>
          A paper, report or deliverable. A DOI becomes a doi.org link on the
          public page.
          {editingPublication ? (
            <>
              {" "}
              <Link href="/admin/outputs">Cancel and add a new one instead.</Link>
            </>
          ) : null}
        </p>

        <PublicationForm
          key={editingPublication?.id ?? "new"}
          publication={editingPublication ?? undefined}
        />
      </section>

      <section className={styles.panel} aria-labelledby="publications-list-heading">
        <h2 id="publications-list-heading" className={styles.panelTitle}>
          Publications ({publications.length})
        </h2>

        {publications.length === 0 ? (
          <p className={styles.empty}>No publications yet.</p>
        ) : (
          <ul className={styles.list}>
            {publications.map((publication) => (
              <li key={publication.id} className={`${styles.item} ${styles.itemNoImage}`}>
                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{publication.title}</p>
                  <p className={styles.itemMeta}>
                    {[
                      publication.authors,
                      publication.venue,
                      publication.year?.toString(),
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No details"}
                  </p>
                  {publication.doi ? (
                    <p className={styles.itemMeta}>
                      <a href={doiUrl(publication.doi)} target="_blank" rel="noreferrer noopener">
                        {doiUrl(publication.doi)}
                      </a>
                    </p>
                  ) : null}
                </div>

                <div className={styles.itemActions}>
                  <span
                    className={`${styles.pill} ${publication.published ? styles.pillLive : styles.pillDraft}`}
                  >
                    {publication.published ? "Live" : "Draft"}
                  </span>
                  <Link
                    className={styles.tab}
                    href={`/admin/outputs?editPublication=${publication.id}`}
                  >
                    Edit
                  </Link>
                  <form action={removePublication}>
                    <input type="hidden" name="id" value={publication.id} />
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
