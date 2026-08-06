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
const securityHeaders = [
  // Stops a browser second-guessing a declared Content-Type — the defence
  // against a stored file being sniffed as HTML and executed.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL to ourselves, origin only to anyone else. Keeps admin
  // paths and query strings out of third-party referer logs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here is meant to be framed, and the admin least of all.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // The site asks for none of these, so nothing is given up by refusing them.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  /**
   * `X-Powered-By: Next.js` on every response names the framework and, by
   * extension, the CVE list worth trying. It buys nothing.
   */
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  experimental: {
    serverActions: {
      /**
       * Raised from Next's 1 MB default so image uploads reach our own checks.
       *
       * **This must stay above `MAX_UPLOAD_TOTAL_BYTES`, not
       * `MAX_UPLOAD_BYTES`.** A Server Action receives every chosen file in one
       * request body, so the number that matters is the total, not the largest
       * file. This was 6 MB — sized for a single 5 MB image — and stayed that
       * way when multi-image upload was added, so three 3 MB photographs
       * tripped the framework limit and produced a runtime error page instead
       * of a readable message.
       *
       * 22 MB leaves ~2 MB of headroom over the 20 MB total for multipart
       * boundaries, part headers and the other form fields, which keeps
       * `readUploads()` — and its readable error — the thing that refuses an
       * oversized batch.
       *
       * Raise `MAX_UPLOAD_TOTAL_BYTES` and this together, or neither.
       */
      bodySizeLimit: "22mb",
    },
  },
};

export default nextConfig;
