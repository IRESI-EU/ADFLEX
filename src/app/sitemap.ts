import type { MetadataRoute } from "next";
import { adflexContent } from "@/content/adflex";
import { absoluteUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Sitemap for public, indexable ADFLEX pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl()) return [];

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

  return routes.flatMap(({ path, priority }) => {
    const url = absoluteUrl(path);
    return url
      ? [{ url, changeFrequency: "monthly" as const, priority }]
      : [];
  });
}