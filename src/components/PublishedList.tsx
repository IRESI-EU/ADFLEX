import type { Finding, NewsItem, Publication } from "@/lib/repo";
import { doiUrl } from "@/lib/repo";
import styles from "./PublishedList.module.css";

/**
 * Renders database-backed content on the public site.
 *
 * ---------------------------------------------------------------------------
 * EVERYTHING HERE IS TEXT, NEVER MARKUP
 * ---------------------------------------------------------------------------
 * The bodies come from a textarea in the admin. They are split on blank lines
 * into paragraphs and rendered as text nodes — no `dangerouslySetInnerHTML`, no
 * Markdown parser, no sanitiser. That is a deliberate ceiling on what an editor
 * can do: they get paragraphs and nothing else, and in exchange there is no
 * injection surface and no half-supported syntax leaking onto a public,
 * publicly funded site. If rich text is ever wanted, it needs a real editor and
 * a real sanitiser, not a `dangerouslySetInnerHTML` here.
 *
 * Images use a plain `<img>` rather than `next/image`, because they are served
 * from `/media/[id]` out of the database and we deliberately do not store pixel
 * dimensions. The fixed `aspect-ratio` frame in the stylesheet does the job
 * `width`/`height` would: it reserves the space so nothing shifts as they load.
 */

/** Splits a plain-text field into paragraphs on blank lines. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function Prose({ text, className }: { text: string; className: string }) {
  const blocks = paragraphs(text);
  if (blocks.length === 0) return null;
  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <p key={index}>{block}</p>
      ))}
    </div>
  );
}

/** Formats `YYYY-MM-DD` without building a Date, so no timezone can shift the day. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const index = Number(month) - 1;
  if (!months[index]) return iso;
  return `${Number(day)} ${months[index]} ${year}`;
}

/* --------------------------------------------------------------------------
 * Findings
 * ----------------------------------------------------------------------- */

export function FindingList({ findings }: { findings: Finding[] }) {
  return (
    <ul className={styles.list}>
      {findings.map((finding) => (
        <li
          key={finding.id}
          className={`${styles.entry} ${finding.image_id ? "" : styles.entryNoImage}`}
        >
          {finding.image_id ? (
            // eslint-disable-next-line @next/next/no-img-element -- see the note above
            <img
              className={styles.media}
              src={`/media/${finding.image_id}`}
              alt={finding.image_alt || ""}
              loading="lazy"
              decoding="async"
            />
          ) : null}

          <div>
            <h3 className={styles.title}>{finding.title}</h3>
            {finding.summary ? <p className={styles.summary}>{finding.summary}</p> : null}
            <Prose text={finding.body} className={styles.body} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------------------
 * Publications
 * ----------------------------------------------------------------------- */

export function PublicationList({ publications }: { publications: Publication[] }) {
  return (
    <ul className={styles.publications}>
      {publications.map((publication) => (
        <li key={publication.id} className={styles.publication}>
          <h3 className={styles.publicationTitle}>{publication.title}</h3>

          {publication.authors || publication.venue || publication.year ? (
            <p className={styles.publicationMeta}>
              {[publication.authors, publication.venue, publication.year?.toString()]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}

          {publication.doi || publication.url ? (
            <p className={styles.links}>
              {publication.doi ? (
                <a
                  className={`adflex-link ${styles.doi}`}
                  href={doiUrl(publication.doi)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {doiUrl(publication.doi)}
                </a>
              ) : null}
              {publication.url ? (
                <a
                  className="adflex-link"
                  href={publication.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Read the paper
                </a>
              ) : null}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------------------
 * News and events
 * ----------------------------------------------------------------------- */

export function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li
          key={item.id}
          className={`${styles.entry} ${item.image_id ? "" : styles.entryNoImage}`}
        >
          {item.image_id ? (
            // eslint-disable-next-line @next/next/no-img-element -- see the note above
            <img
              className={styles.media}
              src={`/media/${item.image_id}`}
              alt={item.image_alt || ""}
              loading="lazy"
              decoding="async"
            />
          ) : null}

          <div>
            <p className={styles.meta}>
              <span className={styles.kind}>
                {item.kind === "event" ? "Event" : "News"}
              </span>
              {/* A real <time> element, so the date is machine-readable as well
                  as legible. An event leads with when it happens; a news post
                  leads with when it was posted. */}
              {item.kind === "event" && item.event_date ? (
                <time dateTime={item.event_date}>{formatDate(item.event_date)}</time>
              ) : (
                <time dateTime={item.published_on}>{formatDate(item.published_on)}</time>
              )}
              {item.location ? <span>{item.location}</span> : null}
            </p>

            <h3 className={styles.title}>{item.title}</h3>
            {item.summary ? <p className={styles.summary}>{item.summary}</p> : null}
            <Prose text={item.body} className={styles.body} />
          </div>
        </li>
      ))}
    </ul>
  );
}
