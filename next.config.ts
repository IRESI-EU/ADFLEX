import type { NextConfig } from "next";

/**
 * Response headers for every route.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE IS NO CONTENT-SECURITY-POLICY HERE
 * ---------------------------------------------------------------------------
 * A useful CSP for an App Router site needs a per-request nonce threaded
 * through `proxy.ts` and onto Next's own inline bootstrap scripts. Done wrong
 * it either blocks hydration outright or degrades to `'unsafe-inline'`, which
 * is a CSP in name only. It is worth doing properly and it is not a five-line
 * change, so it is recorded as a follow-up rather than half-added here. The one
 * route that serves attacker-supplied bytes — `/media/[id]` — already sets its
 * own strict `default-src 'none'; sandbox` policy, which is where it matters
 * most.
 *
 * The four below have no such trade-off: they are inert for a site that frames
 * nothing, embeds nothing and asks for no device permissions.
 */
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryBasePath = isGitHubPages ? "/ADFLEX" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repositoryBasePath,
  assetPrefix: repositoryBasePath,
  env: { NEXT_PUBLIC_BASE_PATH: repositoryBasePath },
  images: { unoptimized: true },
  /**
   * `X-Powered-By: Next.js` on every response names the framework and, by
   * extension, the CVE list worth trying. It buys nothing.
   */
  poweredByHeader: false,

  experimental: {
    /**
     * Fixes scrolling to the top when a route is opened from a scrolled page.
     *
     * -----------------------------------------------------------------------
     * THE BUG THIS TURNS OFF
     * -----------------------------------------------------------------------
     * Scroll part-way down the home page, click "News and Events" or
     * "Outputs", and you land part-way down the page you just opened — on
     * `/news` the heading ended up 75px above the top of the screen. Every
     * other route was fine.
     *
     * Those two are the only routes with a `loading.tsx`. On a navigation that
     * goes through a loading boundary, Next's default scroll handler never
     * scrolls to the top at all: the browser carries the old scroll offset
     * over, clamped to the placeholder's height, and the handler does not fire.
     * Chrome's scroll anchoring then drags the offset further down as the real
     * content grows the document.
     *
     * `appNewScrollHandler` is Next's own rewrite of that handler — the
     * default-path source in `layout-router.js` names it as the fix. With it
     * on, the scroll goes to 0 within ~40ms of the click, and back/forward
     * scroll restoration still works, which was the thing worth not breaking.
     *
     * -----------------------------------------------------------------------
     * IT IS AN EXPERIMENTAL FLAG, SO: WHEN YOU UPGRADE NEXT
     * -----------------------------------------------------------------------
     * `next` is pinned exactly (`16.2.12`, no caret), so this cannot change
     * underneath us on an install. On a Next upgrade, check whether the flag
     * still exists — if the behaviour has become the default, drop this line;
     * if it has been renamed, follow it. Either way re-test the case above,
     * because nothing here will fail a build if it silently stops working.
     */
    appNewScrollHandler: true,
  },
};

export default nextConfig;
