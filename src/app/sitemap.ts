import type { MetadataRoute } from "next";
import { adflexContent } from "@/content/adflex";
import { siteUrl } from "@/lib/site";

/**
 * `/sitemap.xml`.
 *
 * Listed by hand rather than crawled from the filesystem, because only some
 * routes belong in it. `/admin` is private, `/media/[id]` serves images, and
 * `/design-system` is internal documentation carrying `noindex` — none of the
 * three is a page of the ADFLEX website.
 *
 * The legal pages come from `legal.pages` rather than a repeated literal, so a
 * fourth policy appears here the moment it is added to the content file.
 *
 * ---------------------------------------------------------------------------
 * EMPTY UNTIL A SITE URL IS CONFIGURED
 * ---------------------------------------------------------------------------
 * A sitemap entry has to be an absolute URL. With no production domain
 * supplied for ADFLEX, the honest output is an empty sitemap rather than one
 * listing nine addresses on a guessed host. Set `NEXT_PUBLIC_SITE_URL` and
 * every route below is published; see `siteUrl()`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  if (!base) return [];

  const routes = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/outcomes", priority: 0.8 },
    { path: "/news", priority: 0.8 },
    { path: "/contact", priority: 0.6 },
    ...adflexContent.legal.pages.map((page) => ({
      path: `/legal/${page.slug}`,
      priority: 0.3,
    })),
  ];

  return routes.map(({ path, priority }) => ({
    url: new URL(path, base).toString(),
    changeFrequency: "monthly" as const,
    priority,
  }));
}
