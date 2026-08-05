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

export type Finding = {
  id: number;
  title: string;
  summary: string;
  body: string;
  image_id: number | null;
  image_alt: string | null;
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
  image_id: number | null;
  image_alt: string | null;
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

const FINDING_COLUMNS = `
  f.id, f.title, f.summary, f.body, f.image_id, m.alt AS image_alt,
  f.published, f.sort_order
`;

export function listPublishedFindings(): Promise<Finding[]> {
  return safeRead(
    () =>
      query<Finding>(`
        SELECT ${FINDING_COLUMNS}
        FROM findings f
        LEFT JOIN media m ON m.id = f.image_id
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
    LEFT JOIN media m ON m.id = f.image_id
    ORDER BY f.sort_order, f.created_at DESC
  `);
}

export function getFinding(id: number): Promise<Finding | null> {
  return queryOne<Finding>(
    `SELECT ${FINDING_COLUMNS}
     FROM findings f LEFT JOIN media m ON m.id = f.image_id
     WHERE f.id = $1`,
    [id],
  );
}

export type FindingInput = {
  title: string;
  summary: string;
  body: string;
  imageId: number | null;
  published: boolean;
  sortOrder: number;
};

export async function createFinding(input: FindingInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO findings (title, summary, body, image_id, published, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [input.title, input.summary, input.body, input.imageId, input.published, input.sortOrder],
  );
  return row!.id;
}

export async function updateFinding(id: number, input: FindingInput): Promise<void> {
  await query(
    `UPDATE findings
     SET title = $2, summary = $3, body = $4, image_id = $5,
         published = $6, sort_order = $7, updated_at = now()
     WHERE id = $1`,
    [id, input.title, input.summary, input.body, input.imageId, input.published, input.sortOrder],
  );
}

export async function deleteFinding(id: number): Promise<void> {
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
  n.id, n.kind, n.title, n.summary, n.body, n.image_id, m.alt AS image_alt,
  to_char(n.published_on, 'YYYY-MM-DD') AS published_on,
  to_char(n.event_date, 'YYYY-MM-DD') AS event_date,
  n.location, n.published
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
        FROM news_items n LEFT JOIN media m ON m.id = n.image_id
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
    FROM news_items n LEFT JOIN media m ON m.id = n.image_id
    ORDER BY COALESCE(n.event_date, n.published_on) DESC, n.id DESC
  `);
}

export function getNewsItem(id: number): Promise<NewsItem | null> {
  return queryOne<NewsItem>(
    `SELECT ${NEWS_COLUMNS}
     FROM news_items n LEFT JOIN media m ON m.id = n.image_id
     WHERE n.id = $1`,
    [id],
  );
}

export type NewsInput = {
  kind: "news" | "event";
  title: string;
  summary: string;
  body: string;
  imageId: number | null;
  publishedOn: string;
  eventDate: string | null;
  location: string | null;
  published: boolean;
};

export async function createNewsItem(input: NewsInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO news_items
       (kind, title, summary, body, image_id, published_on, event_date, location, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [input.kind, input.title, input.summary, input.body, input.imageId,
     input.publishedOn, input.eventDate, input.location, input.published],
  );
  return row!.id;
}

export async function updateNewsItem(id: number, input: NewsInput): Promise<void> {
  await query(
    `UPDATE news_items
     SET kind = $2, title = $3, summary = $4, body = $5, image_id = $6,
         published_on = $7, event_date = $8, location = $9, published = $10,
         updated_at = now()
     WHERE id = $1`,
    [id, input.kind, input.title, input.summary, input.body, input.imageId,
     input.publishedOn, input.eventDate, input.location, input.published],
  );
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
  uploadedBy: number;
}): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO media (filename, mime, byte_size, data, alt, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [input.filename, input.mime, input.data.byteLength, input.data, input.alt, input.uploadedBy],
  );
  return row!.id;
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
