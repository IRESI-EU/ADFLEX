import type { ImageSize, MediaRef } from "@/lib/repo";
import styles from "./Gallery.module.css";

/**
 * The images attached to a finding or a news entry.
 *
 * Two things decide the layout, and neither is guessed:
 *
 * **The chosen size** (`small` / `medium` / `large`) sets how much room the
 * images get. `large` puts them across the full width above the text; the other
 * two put them in a column beside it. That is the editor's call, stored on the
 * entry.
 *
 * **The number of images** decides the arrangement within that room. One image
 * stands alone; two sit side by side; three or more flow into a grid that wraps.
 * Nothing here needs configuring — a gallery of five should not look like five
 * separate figures.
 *
 * Each image is drawn **at its own aspect ratio**, taken from the pixel
 * dimensions read out of the file on upload. That is what removed both the crop
 * and the grey letterbox: there is no shared frame for a portrait photograph to
 * be poured into. The `width`/`height` attributes reserve the right space
 * before the bytes arrive, so the page still does not shift as images load.
 *
 * Images uploaded before dimensions were stored have none, and fall back to a
 * 3:2 box — the old behaviour, for the old rows only.
 */
export function Gallery({
  images,
  size,
  className,
}: {
  images: MediaRef[];
  size: ImageSize;
  className?: string;
}) {
  if (images.length === 0) return null;

  return (
    /*
     * The wrapper is the query container, and it has to be a separate element:
     * an element cannot respond to its own container query, so the grid inside
     * asks this one how wide it is.
     *
     * Sizing on the container rather than the viewport is what makes one set of
     * rules work in every slot. The same gallery sits in a 200px column at
     * `small` and across the full page at `large`; a viewport media query would
     * put three images side by side in that narrow column on a desktop screen,
     * which is how the first attempt produced 155px-wide charts.
     */
    <div className={[styles.wrap, styles[size], className].filter(Boolean).join(" ")}>
      <ul className={styles.gallery} data-count={images.length}>
        {images.map((image) => (
          <li key={image.id} className={styles.item}>
            {/* eslint-disable-next-line @next/next/no-img-element -- served from
                the database at /media/[id]. next/image needs a build-time known
                source or a configured loader; this route has neither, and the
                bytes are already sized appropriately on upload. */}
            <img
              className={styles.image}
              src={`/media/${image.id}`}
              alt={image.alt}
              width={image.width ?? undefined}
              height={image.height ?? undefined}
              style={
                image.width && image.height
                  ? { aspectRatio: `${image.width} / ${image.height}` }
                  : undefined
              }
              data-unsized={image.width && image.height ? undefined : ""}
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
