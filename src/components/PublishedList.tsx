import type { Finding, ImageSize, MediaRef, NewsItem, Publication } from "@/lib/repo";
import { doiUrl } from "@/lib/repo";
import { Gallery } from "./Gallery";
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

/**
 * Which layout an entry takes.
 *
 * `large` stacks — images across the full width, text underneath — because a
 * chart that needs the width has nothing to sit beside. Everything else puts
 * the images in a column next to the text, `small` narrower than `medium`.
 * No images at all means the text takes the whole row.
 */
function entryClass(images: MediaRef[], size: ImageSize): string {
  if (images.length === 0) return `${styles.entry} ${styles.entryNoImage}`;
  if (size === "large") return `${styles.entry} ${styles.entryStacked}`;
  if (size === "small") return `${styles.entry} ${styles.entrySmallMedia}`;
  return styles.entry;
}

/** True when the images sit above the text rather than beside it. */
function isStacked(images: MediaRef[], size: ImageSize): boolean {
  return images.length > 0 && size === "large";
}

export function FindingList({ findings }: { findings: Finding[] }) {
  return (
    <ul className={styles.list}>
      {findings.map((finding) => {
        const gallery = <Gallery images={finding.images} size={finding.image_size} />;
        const heading = (
          <>
            <h3 className={styles.title}>{finding.title}</h3>
            {finding.summary ? <p className={styles.summary}>{finding.summary}</p> : null}
          </>
        );
        const detail = <Prose text={finding.body} className={styles.body} />;

        return (
          <li key={finding.id} className={entryClass(finding.images, finding.image_size)}>
            {/*
             * Stacked entries read heading, summary, picture, then the detail —
             * the shape of an article. A reader should know what they are
             * looking at before they look at it, and the long text belongs
             * after the thing it describes rather than before it.
             *
             * Beside-the-text layouts keep the image first with all the text in
             * one column, where the heading is already level with it.
             *
             * The order is set in the markup rather than with CSS, so what a
             * screen reader hears matches what the page shows.
             */}
            {isStacked(finding.images, finding.image_size) ? (
              <>
                <div className={styles.entryBody}>{heading}</div>
                {gallery}
                <div className={styles.entryDetail}>{detail}</div>
              </>
            ) : (
              <>
                {gallery}
                <div className={styles.entryBody}>
                  {heading}
                  {detail}
                </div>
              </>
            )}
          </li>
        );
      })}
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

/**
 * `showKind` adds a News/Event pill to each entry.
 *
 * Off by default because `/news` now groups entries under their own "Events"
 * and "News" headings, which says the same thing once instead of on every row.
 * Turn it on for any future list that mixes the two.
 */
export function NewsList({
  items,
  showKind = false,
}: {
  items: NewsItem[];
  showKind?: boolean;
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const gallery = <Gallery images={item.images} size={item.image_size} />;
        const heading = (
          <>
            <p className={styles.meta}>
              {showKind ? (
                <span className={styles.kind}>
                  {item.kind === "event" ? "Event" : "News"}
                </span>
              ) : null}
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
          </>
        );
        const detail = <Prose text={item.body} className={styles.body} />;

        return (
          <li key={item.id} className={entryClass(item.images, item.image_size)}>
            {/* Heading and summary above the pictures, detail below them — see
                the note in FindingList. */}
            {isStacked(item.images, item.image_size) ? (
              <>
                <div className={styles.entryBody}>{heading}</div>
                {gallery}
                <div className={styles.entryDetail}>{detail}</div>
              </>
            ) : (
              <>
                {gallery}
                <div className={styles.entryBody}>
                  {heading}
                  {detail}
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
