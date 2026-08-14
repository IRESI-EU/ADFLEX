/**
 * Git-backed public news, events and project outcomes.
 *
 * Add reviewed entries to these arrays and place their images/documents under
 * `public/content/`. A merge to `main` rebuilds and publishes the static site.
 * See docs/PUBLISHING.md before changing these records.
 */
export type ImageSize = "small" | "medium" | "large";
export type NewsKind = "news" | "event" | "upcoming";

export type MediaRef = {
  id: string;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type FileRef = {
  id: string;
  href: string;
  filename: string;
  byte_size: number;
  label: string;
};

export type Finding = {
  id: string;
  title: string;
  summary: string;
  body: string;
  images: MediaRef[];
  files: FileRef[];
  image_size: ImageSize;
  published_on: string;
};

export type Publication = {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number | null;
  doi: string | null;
  url: string | null;
  files: FileRef[];
  published_on: string;
};

export type NewsItem = {
  id: string;
  kind: NewsKind;
  title: string;
  summary: string;
  body: string;
  images: MediaRef[];
  image_size: ImageSize;
  published_on: string;
  event_date: string | null;
  event_time: string | null;
  event_end_time: string | null;
  location: string | null;
  booking_url: string | null;
  slots_filled: boolean;
  event_outcome: string;
  event_video_url: string | null;
  /** Maintained by the publishing record when an upcoming event becomes past. */
  expired: boolean;
};

// Editorial order: keep the most relevant/recent public items first unless the
// project team asks for another order.
export const findings: Finding[] = [];
export const publications: Publication[] = [];
export const newsItems: NewsItem[] = [];

export function isEvent(kind: NewsKind): boolean {
  return kind === "event" || kind === "upcoming";
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileKind(filename: string): string {
  const extension = filename.split(".").pop()?.toUpperCase();
  return extension || "FILE";
}

/** Earliest event still eligible for the home-page announcement. */
export function nextUpcomingEvent(): NewsItem | null {
  return (
    newsItems
      .filter((item) => item.kind === "upcoming" && !item.expired && !item.slots_filled)
      .sort((a, b) => (a.event_date || "").localeCompare(b.event_date || ""))[0] ?? null
  );
}