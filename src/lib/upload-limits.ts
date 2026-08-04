/**
 * Upload limits, shared by the server validator and the client form.
 *
 * Separate from `upload.ts` purely because that file is `server-only` — it
 * reads file bytes and must never be bundled into the browser. The admin form
 * still needs to *state* the limit to the editor, so the numbers live here
 * where both sides can import them.
 *
 * The client uses these for the `accept` attribute and the hint text. Neither
 * is a check: `src/lib/upload.ts` re-derives the real format from the file's
 * magic bytes and enforces the size again on the server.
 */

/** 5 MB. Comfortable for a photograph, small enough that the database is not an object store. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * SVG is deliberately absent. It can carry script, and these files are served
 * back from our own origin at /media/[id].
 */
export const ACCEPTED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const ACCEPT_ATTRIBUTE = ACCEPTED_MIME.join(",");
