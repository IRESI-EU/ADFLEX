import "server-only";

/**
 * Upload validation.
 *
 * The rule here is that the browser is not trusted about anything. `file.type`
 * is whatever the client claimed, and a filename extension is just text, so
 * both are checked against the file's actual leading bytes before the data goes
 * anywhere near the database.
 */

import { MAX_UPLOAD_BYTES, MAX_UPLOAD_TOTAL_BYTES, mb } from "./upload-limits";
import { readDimensions } from "./image-size";

export type UploadResult =
  | {
      ok: true;
      filename: string;
      mime: string;
      data: Buffer;
      /** Null when the header could not be read; the renderer falls back. */
      width: number | null;
      height: number | null;
    }
  | { ok: false; error: string };

/**
 * Reads the real format from the file's magic bytes.
 *
 * Returns null for anything that is not one of the four raster formats we
 * accept — which is what stops an HTML or SVG file being stored and later
 * served back from our own origin. An SVG is a script execution vector, so it
 * is deliberately not in the list.
 */
function sniffMime(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // WebP: "RIFF" .... "WEBP"
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }

  // GIF: "GIF87a" or "GIF89a"
  const gif = bytes.toString("ascii", 0, 6);
  if (gif === "GIF87a" || gif === "GIF89a") {
    return "image/gif";
  }

  return null;
}

/** Strips anything that is not a plain filename. Never used as a filesystem path, but it is displayed. */
function safeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "image";
  return base.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "image";
}

export async function readUpload(file: File | null): Promise<UploadResult | null> {
  // No file chosen is not an error — the image is optional on every form.
  if (!file || file.size === 0) return null;

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB — please resize it and try again.`,
    };
  }

  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(data);

  if (!mime) {
    return {
      ok: false,
      error: "That file is not a PNG, JPEG, WebP or GIF image. (SVG is not accepted.)",
    };
  }

  const size = readDimensions(data, mime);

  return {
    ok: true,
    filename: safeFilename(file.name),
    mime,
    data,
    width: size?.width ?? null,
    height: size?.height ?? null,
  };
}

/**
 * Reads every file from one multi-file field.
 *
 * Stops at the first bad file and reports it, rather than storing the good ones
 * and quietly dropping the rest — a partial save an editor did not ask for is
 * harder to notice than an outright refusal.
 *
 * **Checks the combined size as well as each file.** Every chosen file arrives
 * in one Server Action request body, so a batch can be far larger than any
 * single file in it. Without this the framework's own body limit was the thing
 * that refused the upload, and it does that with a runtime error page rather
 * than something an editor can act on.
 */
export async function readUploads(
  files: File[],
): Promise<{ ok: true; uploads: Extract<UploadResult, { ok: true }>[] } | { ok: false; error: string }> {
  const chosen = files.filter((file) => file.size > 0);

  const total = chosen.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_UPLOAD_TOTAL_BYTES) {
    return {
      ok: false,
      error: `Those ${chosen.length} images come to ${(total / 1024 / 1024).toFixed(1)} MB together. The limit is ${mb(MAX_UPLOAD_TOTAL_BYTES)} per save — add them in two goes, or resize them first.`,
    };
  }

  const uploads: Extract<UploadResult, { ok: true }>[] = [];

  for (const file of chosen) {
    const result = await readUpload(file);
    if (!result) continue;
    if (!result.ok) return { ok: false, error: `${file.name}: ${result.error}` };
    uploads.push(result);
  }

  return { ok: true, uploads };
}
