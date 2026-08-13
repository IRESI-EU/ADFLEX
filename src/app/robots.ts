import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * `/robots.txt`.
 *
 * The site had none, so every crawler fell back to its own defaults and the
 * admin and the media route were as fair game as the public pages. They are
 * already guarded — `/admin` by `requireUser()`, and `noindex` is set in the
 * admin layout — but saying so here stops a crawler spending its budget on
 * pages it will only be turned away from.
 *
 * `/media/` is disallowed because those are images belonging to entries that
 * are already indexed through the pages that show them; indexing them a second
 * time as bare files adds nothing.
 *
 * The `Sitemap:` line only appears once a site URL is configured — see
 * `siteUrl()` for why no domain is assumed.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/media/"],
    },
    ...(base ? { sitemap: new URL("/sitemap.xml", base).toString() } : {}),
  };
}
