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
  /** Optional visible caption. Publish only wording supplied or approved by the authorised content publisher. */
  caption?: string;
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

export type RelatedLink = {
  label: string;
  href: string;
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
  related_links?: RelatedLink[];
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
export const newsItems: NewsItem[] = [
  {
    id: "maynooth-business-analytics-engagement-2026",
    kind: "event",
    title: "ADFLEX engagement with MSc Business Analytics students at Maynooth University",
    summary:
      "MSc Business Analytics students explored wholesale market pricing, demand response and data-driven flexibility modelling through Analytics Live Project presentations aligned with ADFLEX.",
    body: `We were delighted to see strong engagement from MSc Business Analytics students at the School of Business, Maynooth University, during their Analytics Live Project presentations aligned with the ADFLEX initiative.

A key highlight of the session was an insightful discussion led by our PI, Fabiano Pallonetto, on the intersection of wholesale market pricing mechanisms, including dynamic and settlement prices, and energy flexibility coordination. Understanding how wholesale price signals and settlement mechanisms can drive demand-side response is central to designing flexibility services that work within real market conditions.

The student projects covered a range of critical topics, including residential load clustering, demand response strategies, and data-driven flexibility modelling in sustainable energy communities.

The session was chaired by Muhammad Waseem and attended by several experts in the field, fostering valuable discussion connecting academic research with practical energy-system challenges.`,
    related_links: [
      {
        label: "School of Business Maynooth University",
        href: "https://www.linkedin.com/company/school-of-business-maynooth-university/",
      },
      {
        label: "Fabiano Pallonetto",
        href: "https://www.linkedin.com/in/fabianopallonetto/",
      },
      {
        label: "Muhammad Waseem",
        href: "https://www.linkedin.com/in/muhammad-waseem-97a073226/",
      },
    ],
    images: [
      {
        id: "maynooth-energy-analytics-presentation",
        src: "/content/events/maynooth-business-analytics-engagement-2026/energy-analytics-presentation.jpg.jpeg",
        alt: "",
        width: 1280,
        height: 574,
      },
      {
        id: "maynooth-analytics-live-project-presentation",
        src: "/content/events/maynooth-business-analytics-engagement-2026/analytics-live-project-presentation.jpg.jpeg",
        alt: "",
        width: 1280,
        height: 574,
      },
    ],
    image_size: "large",
    published_on: "2026-08-15",
    event_date: "2026-04",
    event_time: null,
    event_end_time: null,
    location: "Maynooth University",
    booking_url: null,
    slots_filled: false,
    event_outcome: "",
    event_video_url: null,
    expired: true,
  },
];

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
