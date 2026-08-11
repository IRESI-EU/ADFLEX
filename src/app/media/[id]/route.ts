import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMediaBytes, isMediaPublic } from "@/lib/repo";

/**
 * Serves an uploaded image from the database.
 *
 * ---------------------------------------------------------------------------
 * NOT PUBLIC BY DEFAULT ANY MORE
 * ---------------------------------------------------------------------------
 * This route used to serve any row to anyone. Ids are sequential, so counting
 * upwards exposed the pictures on unpublished drafts, and images belonging to a
 * deleted entry stayed readable for ever. Both were found in the external review
 * of 9 August 2026 and both were reproducible.
 *
 * An image is now served only when **it is attached to something published**, or
 * **the request comes from a signed-in editor**. Deleting or unpublishing the
 * last entry that used it takes it offline in the same moment, with nothing to
 * remember to tidy up.
 *
 * ---------------------------------------------------------------------------
 * CACHING FOLLOWS THE PERMISSION
 * ---------------------------------------------------------------------------
 * A published image keeps the long immutable cache: a row's bytes never change,
 * because editing a picture uploads a new row with a new id. An image served
 * only because an editor is signed in gets `private, no-store`, so it cannot be
 * left behind in a shared cache for the next person who asks.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/media/[id]">,
) {
  const { id } = await context.params;

  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  /*
   * Permission before bytes. The published test is one indexed lookup and the
   * session check only runs when it fails, so the ordinary case — a visitor
   * loading a published page — costs one extra query and no cookie work.
   *
   * A refused image answers 404, not 403. Saying "forbidden" would confirm that
   * something exists at that id, which is the fact the sequential numbering
   * already makes too easy to enumerate.
   */
  const isPublic = await isMediaPublic(numeric);
  if (!isPublic && (await getCurrentUser()) === null) {
    return new NextResponse("Not found", { status: 404 });
  }

  let row: { data: Buffer; mime: string } | null;
  try {
    row = await getMediaBytes(numeric);
  } catch (error) {
    console.error("[adflex] media read failed:", error);
    return new NextResponse("Image unavailable", { status: 503 });
  }

  if (!row) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(row.data.byteLength),
      "Cache-Control": isPublic
        ? "public, max-age=31536000, immutable"
        : "private, no-store",
      // The bytes were format-checked on upload, but this is belt and braces:
      // it stops a browser deciding a stored file is HTML and rendering it.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
