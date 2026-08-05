import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
