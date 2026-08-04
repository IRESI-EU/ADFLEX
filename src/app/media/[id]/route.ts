import { NextResponse } from "next/server";
import { getMediaBytes } from "@/lib/repo";

/**
 * Serves an uploaded image from the database.
 *
 * Public on purpose: these are pictures attached to published findings and news
 * items, so they have to be readable without a session. Ids are sequential, so
 * an unpublished item's image is guessable — do not put anything confidential
 * through this route.
 *
 * Not cached by Next (route handlers are uncached by default), but the response
 * carries an immutable `Cache-Control` so browsers and any CDN in front keep it.
 * That is safe because a row's bytes never change: editing an item's picture
 * uploads a new row with a new id rather than overwriting this one.
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
      "Cache-Control": "public, max-age=31536000, immutable",
      // The bytes were format-checked on upload, but this is belt and braces:
      // it stops a browser deciding a stored file is HTML and rendering it.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
