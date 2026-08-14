import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Public crawler policy for the static site. */
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(sitemap ? { sitemap } : {}),
  };
}