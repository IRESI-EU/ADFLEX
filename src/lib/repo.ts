import "server-only";

import { query, queryOne, safeRead } from "./db";

/**
 * Every database read and write, in one place.
 *
 * Pages and Server Actions call these; nothing else builds SQL. Two rules hold
 * throughout:
 *
 * 1. **Public reads go through `safeRead`** and fall back to an empty list, so
 *    a missing or unreachable database renders the empty state the public pages
 *    already have rather than a 500.
 * 2. **Writes and admin reads do not.** A save that silently fails is worse
 *    than an error, and an admin list that silently shows nothing reads as
 *    "your work is gone".
 */

/**
 * How large an entry's images are drawn on the public page.
 *
 * `small`  a narrow column beside the text — a logo, a portrait, a detail shot
 * `medium` the default column beside the text
 * `large`  full width above the text, for a chart or diagram that needs room
 */
export type ImageSize = "small" | "medium" | "large";

const IMAGE_SIZES: readonly ImageSize[] = ["small", "medium", "large"];

/** Anything else in the column — an older row, a hand-edited value — reads as the default. */
export function toImageSize(value: unknown): ImageSize {
  return IMAGE_SIZES.includes(value as ImageSize) ? (value as ImageSize) : "medium";
}

/** One image attached to an entry. `width`/`height` are null when unreadable. */
export type MediaRef = {
  id: number;
  alt: string;
  width: number | null;
  height: number | null;
};

export type Finding = {
  id: number;
  title: string;
  summary: string;
  body: string;
  images: MediaRef[];
  image_size: ImageSize;
  published: boolean;
  sort_order: number;
};

export type Publication = {
  id: number;
  title: string;
  authors: string;
  venue: string;
  year: number | null;
  doi: string | null;
  url: string | null;
  published: boolean;
  sort_order: number;
};

export type NewsItem = {
  id: number;
  kind: "news" | "event";
  title: string;
  summary: string;
  body: string;
  images: MediaRef[];
  image_size: ImageSize;
  published_on: string;
  event_date: string | null;
  location: string | null;
  published: boolean;
};

export type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

/* --------------------------------------------------------------------------
 * DOI
 * ----------------------------------------------------------------------- */

/**
 * A DOI is stored bare — "10.1234/abcd" — and only ever becomes a URL here.
 *
 * Accepts what an editor is likely to paste (a doi.org link, a `doi:` prefix,
 * surrounding space) and normalises it down to the bare identifier, because the
 * alternative is three spellings of the same DOI in one table.
 */
export function normaliseDoi(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const bare = trimmed
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim();

  // The registrant prefix is always "10." followed by 4-9 digits, then a slash
  // and a suffix. Anything else is not a DOI and is rejected rather than stored
  // and rendered as a link that goes nowhere.
  return /^10\.\d{4,9}\/\S+$/.test(bare) ? bare : null;
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

/* --------------------------------------------------------------------------
 * Findings
 * ----------------------------------------------------------------------- */

/**
 * The attached images, as a JSON array, built inside the query.
 *
 * A plain join would repeat the whole entry once per image and leave the caller
 * to stitch the rows back together. Aggregating in SQL keeps one row per entry
 * and hands back the images already ordered — `pg` parses the `json` column
 * into a real array, so nothing is parsed by hand.
 *
 * `COALESCE(..., '[]')` matters: without it an entry with no images gets `null`
 * rather than an empty array, and every reader would need a guard.
 */
const imagesJson = (table: string, fk: string, alias: string) => `
  COALESCE((
    SELECT json_agg(
             json_build_object('id', m.id, 'alt', m.alt, 'width', m.width, 'height', m.height)
             ORDER BY x.position, x.id
           )
    FROM ${table} x JOIN media m ON m.id = x.media_id
    WHERE x.${fk} = ${alias}.id
  ), '[]'::json) AS images
`;

const FINDING_COLUMNS = `
  f.id, f.title, f.summary, f.body, f.published, f.sort_order, f.image_size,
  ${imagesJson("finding_images", "finding_id", "f")}
`;

export function listPublishedFindings(): Promise<Finding[]> {
  return safeRead(
    () =>
      query<Finding>(`
        SELECT ${FINDING_COLUMNS}
        FROM findings f
        WHERE f.published
        ORDER BY f.sort_order, f.created_at DESC
      `),
    [],
    "findings",
  );
}

export function listAllFindings(): Promise<Finding[]> {
  return query<Finding>(`
    SELECT ${FINDING_COLUMNS}
    FROM findings f
    ORDER BY f.sort_order, f.created_at DESC
  `);
}

export function getFinding(id: number): Promise<Finding | null> {
  return queryOne<Finding>(
    `SELECT ${FINDING_COLUMNS} FROM findings f WHERE f.id = $1`,
    [id],
  );
}

export type FindingInput = {
  title: string;
  summary: string;
  body: string;
  imageIds: number[];
  imageSize: ImageSize;
  published: boolean;
  sortOrder: number;
};

export async function createFinding(input: FindingInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO findings (title, summary, body, published, sort_order, image_size)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [input.title, input.summary, input.body, input.published, input.sortOrder, input.imageSize],
  );
  await setFindingImages(row!.id, input.imageIds);
  return row!.id;
}

export async function updateFinding(id: number, input: FindingInput): Promise<void> {
  await query(
    `UPDATE findings
     SET title = $2, summary = $3, body = $4,
         published = $5, sort_order = $6, image_size = $7, updated_at = now()
     WHERE id = $1`,
    [id, input.title, input.summary, input.body, input.published, input.sortOrder, input.imageSize],
  );
  await setFindingImages(id, input.imageIds);
}

/**
 * Replaces the whole set of attached images in their given order.
 *
 * Delete-then-insert rather than working out which rows changed. The set is a
 * handful of rows, the order is part of the value, and reconciling additions,
 * removals and moves separately is where an ordering bug would live.
 */
async function setFindingImages(findingId: number, mediaIds: number[]): Promise<void> {
  await query("DELETE FROM finding_images WHERE finding_id = $1", [findingId]);
  for (const [position, mediaId] of mediaIds.entries()) {
    await query(
      "INSERT INTO finding_images (finding_id, media_id, position) VALUES ($1, $2, $3)",
      [findingId, mediaId, position],
    );
  }
}

export async function deleteFinding(id: number): Promise<void> {
  // `finding_images` cascades; the `media` rows themselves are left alone so an
  // image used by two entries does not vanish from the other.
  await query("DELETE FROM findings WHERE id = $1", [id]);
}

/* --------------------------------------------------------------------------
 * Publications
 * ----------------------------------------------------------------------- */

const PUBLICATION_COLUMNS =
  "id, title, authors, venue, year, doi, url, published, sort_order";

export function listPublishedPublications(): Promise<Publication[]> {
  return safeRead(
    () =>
      query<Publication>(`
        SELECT ${PUBLICATION_COLUMNS} FROM publications
        WHERE published
        ORDER BY sort_order, year DESC NULLS LAST, title
      `),
    [],
    "publications",
  );
}

export function listAllPublications(): Promise<Publication[]> {
  return query<Publication>(`
    SELECT ${PUBLICATION_COLUMNS} FROM publications
    ORDER BY sort_order, year DESC NULLS LAST, title
  `);
}

export function getPublication(id: number): Promise<Publication | null> {
  return queryOne<Publication>(
    `SELECT ${PUBLICATION_COLUMNS} FROM publications WHERE id = $1`,
    [id],
  );
}

export type PublicationInput = {
  title: string;
  authors: string;
  venue: string;
  year: number | null;
  doi: string | null;
  url: string | null;
  published: boolean;
  sortOrder: number;
};

export async function createPublication(input: PublicationInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO publications (title, authors, venue, year, doi, url, published, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [input.title, input.authors, input.venue, input.year, input.doi, input.url, input.published, input.sortOrder],
  );
  return row!.id;
}

export async function updatePublication(id: number, input: PublicationInput): Promise<void> {
  await query(
    `UPDATE publications
     SET title = $2, authors = $3, venue = $4, year = $5, doi = $6, url = $7,
         published = $8, sort_order = $9, updated_at = now()
     WHERE id = $1`,
    [id, input.title, input.authors, input.venue, input.year, input.doi, input.url, input.published, input.sortOrder],
  );
}

export async function deletePublication(id: number): Promise<void> {
  await query("DELETE FROM publications WHERE id = $1", [id]);
}

/* --------------------------------------------------------------------------
 * News and events
 * ----------------------------------------------------------------------- */

const NEWS_COLUMNS = `
  n.id, n.kind, n.title, n.summary, n.body, n.image_size,
  to_char(n.published_on, 'YYYY-MM-DD') AS published_on,
  to_char(n.event_date, 'YYYY-MM-DD') AS event_date,
  n.location, n.published,
  ${imagesJson("news_images", "news_id", "n")}
`;

/**
 * Dates come back as `YYYY-MM-DD` strings via `to_char`, not as `Date` objects.
 *
 * `pg` maps `DATE` to a JavaScript `Date` at midnight in the *server's* local
 * zone, so an event on the 1st can render as the 31st for anyone west of it.
 * Formatting in SQL keeps a calendar date a calendar date.
 */
export function listPublishedNews(): Promise<NewsItem[]> {
  return safeRead(
    () =>
      query<NewsItem>(`
        SELECT ${NEWS_COLUMNS}
        FROM news_items n
        WHERE n.published
        ORDER BY COALESCE(n.event_date, n.published_on) DESC, n.id DESC
      `),
    [],
    "news",
  );
}

export function listAllNews(): Promise<NewsItem[]> {
  return query<NewsItem>(`
    SELECT ${NEWS_COLUMNS}
    FROM news_items n
    ORDER BY COALESCE(n.event_date, n.published_on) DESC, n.id DESC
  `);
}

export function getNewsItem(id: number): Promise<NewsItem | null> {
  return queryOne<NewsItem>(
    `SELECT ${NEWS_COLUMNS} FROM news_items n WHERE n.id = $1`,
    [id],
  );
}

export type NewsInput = {
  kind: "news" | "event";
  title: string;
  summary: string;
  body: string;
  imageIds: number[];
  imageSize: ImageSize;
  publishedOn: string;
  eventDate: string | null;
  location: string | null;
  published: boolean;
};

export async function createNewsItem(input: NewsInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO news_items
       (kind, title, summary, body, published_on, event_date, location, published, image_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [input.kind, input.title, input.summary, input.body,
     input.publishedOn, input.eventDate, input.location, input.published, input.imageSize],
  );
  await setNewsImages(row!.id, input.imageIds);
  return row!.id;
}

export async function updateNewsItem(id: number, input: NewsInput): Promise<void> {
  await query(
    `UPDATE news_items
     SET kind = $2, title = $3, summary = $4, body = $5,
         published_on = $6, event_date = $7, location = $8, published = $9,
         image_size = $10, updated_at = now()
     WHERE id = $1`,
    [id, input.kind, input.title, input.summary, input.body,
     input.publishedOn, input.eventDate, input.location, input.published, input.imageSize],
  );
  await setNewsImages(id, input.imageIds);
}

/** Same delete-then-insert reasoning as `setFindingImages`. */
async function setNewsImages(newsId: number, mediaIds: number[]): Promise<void> {
  await query("DELETE FROM news_images WHERE news_id = $1", [newsId]);
  for (const [position, mediaId] of mediaIds.entries()) {
    await query(
      "INSERT INTO news_images (news_id, media_id, position) VALUES ($1, $2, $3)",
      [newsId, mediaId, position],
    );
  }
}

export async function deleteNewsItem(id: number): Promise<void> {
  await query("DELETE FROM news_items WHERE id = $1", [id]);
}

/* --------------------------------------------------------------------------
 * Publishing
 * ----------------------------------------------------------------------- */

/** The three tables carrying a `published` flag. */
export type PublishableTable = "findings" | "publications" | "news_items";

const PUBLISHABLE: readonly PublishableTable[] = ["findings", "publications", "news_items"];

/**
 * Sets an entry's published flag.
 *
 * The table name cannot be parameterised in SQL, so it is interpolated — and is
 * therefore checked against a fixed list first. That check is the only thing
 * standing between a caller's string and the query text, so do not remove it
 * and do not widen it to accept arbitrary input.
 */
export async function setPublished(
  table: PublishableTable,
  id: number,
  published: boolean,
): Promise<void> {
  if (!PUBLISHABLE.includes(table)) {
    throw new Error(`Refusing to publish against an unknown table: ${table}`);
  }
  await query(
    `UPDATE ${table} SET published = $2, updated_at = now() WHERE id = $1`,
    [id, published],
  );
}

/* --------------------------------------------------------------------------
 * Contact messages
 * ----------------------------------------------------------------------- */

export async function createMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await query(
    `INSERT INTO messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`,
    [input.name, input.email, input.subject, input.message],
  );
}

export function listMessages(): Promise<Message[]> {
  return query<Message>(`
    SELECT id, name, email, subject, message,
           to_char(read_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS read_at,
           to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS created_at
    FROM messages ORDER BY created_at DESC
  `);
}

export async function countUnreadMessages(): Promise<number> {
  const row = await queryOne<{ n: string }>(
    "SELECT count(*)::text AS n FROM messages WHERE read_at IS NULL",
  );
  return Number(row?.n ?? 0);
}

export async function markMessageRead(id: number): Promise<void> {
  await query("UPDATE messages SET read_at = now() WHERE id = $1 AND read_at IS NULL", [id]);
}

export async function deleteMessage(id: number): Promise<void> {
  await query("DELETE FROM messages WHERE id = $1", [id]);
}

/* --------------------------------------------------------------------------
 * Media
 * ----------------------------------------------------------------------- */

export type MediaSummary = {
  id: number;
  filename: string;
  mime: string;
  byte_size: number;
  alt: string;
};

export async function createMedia(input: {
  filename: string;
  mime: string;
  data: Buffer;
  alt: string;
  width: number | null;
  height: number | null;
  uploadedBy: number;
}): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO media (filename, mime, byte_size, data, alt, width, height, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [input.filename, input.mime, input.data.byteLength, input.data, input.alt,
     input.width, input.height, input.uploadedBy],
  );
  return row!.id;
}

/** Updates the alt text on images already attached to an entry. */
export async function setMediaAlt(id: number, alt: string): Promise<void> {
  await query("UPDATE media SET alt = $2 WHERE id = $1", [id, alt]);
}

export function listMedia(): Promise<MediaSummary[]> {
  return query<MediaSummary>(
    "SELECT id, filename, mime, byte_size, alt FROM media ORDER BY created_at DESC",
  );
}

export function getMediaBytes(
  id: number,
): Promise<{ data: Buffer; mime: string } | null> {
  return queryOne<{ data: Buffer; mime: string }>(
    "SELECT data, mime FROM media WHERE id = $1",
    [id],
  );
}

export async function deleteMedia(id: number): Promise<void> {
  // Rows referencing this image have `ON DELETE SET NULL`, so an item whose
  // picture is removed keeps its text rather than disappearing with it.
  await query("DELETE FROM media WHERE id = $1", [id]);
}
