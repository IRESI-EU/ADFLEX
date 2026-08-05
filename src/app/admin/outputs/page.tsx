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
import {
  removeFinding,
  removePublication,
  setFindingPublished,
  setPublicationPublished,
} from "../actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
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
                className={`${styles.item} ${finding.images.length > 0 ? "" : styles.itemNoImage}`}
              >
                {/* The first image stands for the set; the count says how many
                    more there are, so the row stays one line tall. */}
                {finding.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element -- database-backed route
                  <img
                    className={styles.thumb}
                    src={`/media/${finding.images[0].id}`}
                    alt={finding.images[0].alt || ""}
                    width={84}
                  />
                ) : null}

                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{finding.title}</p>
                  <p className={styles.itemMeta}>
                    {finding.summary || "No summary"} · order {finding.sort_order}
                    {finding.images.length > 0
                      ? ` · ${finding.images.length} image${finding.images.length === 1 ? "" : "s"} (${finding.image_size})`
                      : ""}
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
                  {/* Publish without opening the editor. The target state goes
                      in the form, so the button does what its label says even
                      if this page is a little stale. */}
                  <form action={setFindingPublished}>
                    <input type="hidden" name="id" value={finding.id} />
                    <input type="hidden" name="publish" value={finding.published ? "0" : "1"} />
                    <ConfirmSubmit
                      className={styles.tab}
                      pendingLabel="Working…"
                      title={
                        finding.published
                          ? `Unpublish “${finding.title}”?`
                          : `Publish “${finding.title}”?`
                      }
                      detail={
                        finding.published
                          ? "It will be removed from the public Outputs page immediately. Nothing is deleted — it goes back to being a draft and you can publish it again."
                          : "It will appear on the public Outputs page immediately."
                      }
                      confirmLabel={finding.published ? "Unpublish" : "Publish"}
                    >
                      {finding.published ? "Unpublish" : "Publish"}
                    </ConfirmSubmit>
                  </form>
                  <form action={removeFinding}>
                    <input type="hidden" name="id" value={finding.id} />
                    <ConfirmSubmit
                      className={styles.danger}
                      pendingLabel="Deleting…"
                      destructive
                      title={`Delete “${finding.title}”?`}
                      detail="This cannot be undone. The finding, its text and its images are removed permanently."
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
                  <form action={setPublicationPublished}>
                    <input type="hidden" name="id" value={publication.id} />
                    <input
                      type="hidden"
                      name="publish"
                      value={publication.published ? "0" : "1"}
                    />
                    <ConfirmSubmit
                      className={styles.tab}
                      pendingLabel="Working…"
                      title={
                        publication.published
                          ? `Unpublish “${publication.title}”?`
                          : `Publish “${publication.title}”?`
                      }
                      detail={
                        publication.published
                          ? "It will be removed from the public Outputs page immediately. Nothing is deleted — it goes back to being a draft and you can publish it again."
                          : "It will appear on the public Outputs page immediately."
                      }
                      confirmLabel={publication.published ? "Unpublish" : "Publish"}
                    >
                      {publication.published ? "Unpublish" : "Publish"}
                    </ConfirmSubmit>
                  </form>
                  <form action={removePublication}>
                    <input type="hidden" name="id" value={publication.id} />
                    <ConfirmSubmit
                      className={styles.danger}
                      pendingLabel="Deleting…"
                      destructive
                      title={`Delete “${publication.title}”?`}
                      detail="This cannot be undone. The publication and its DOI are removed permanently."
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
