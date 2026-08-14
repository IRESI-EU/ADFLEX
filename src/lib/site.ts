/** The configured public site URL, normalised to a directory-style base. */
export function siteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.pathname.endsWith("/")) url.pathname += "/";
    return url;
  } catch {
    return null;
  }
}

/**
 * Resolve a public root-relative asset/link below the repository base path.
 * External and already-relative URLs are returned unchanged.
 */
export function publicPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

/** Absolute URL within the configured public site, preserving its /ADFLEX base. */
export function absoluteUrl(path: string): string | null {
  const base = siteUrl();
  if (!base) return null;
  const relative = path.replace(/^\/+/, "");
  return new URL(relative, base).toString();
}

/** Metadata fragment naming a page's canonical URL when a public base is set. */
export function canonical(path: string): { alternates?: { canonical: string } } {
  const url = absoluteUrl(path);
  return url ? { alternates: { canonical: url } } : {};
}