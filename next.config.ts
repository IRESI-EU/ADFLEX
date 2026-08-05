import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /**
       * Raised from Next's 1 MB default so image uploads reach our own check.
       *
       * The admin accepts images up to 5 MB (`MAX_UPLOAD_BYTES` in
       * `src/lib/upload-limits.ts`). At the default, the framework rejected the
       * whole request first and an editor attaching any ordinary photograph got
       * a runtime error page instead of a message saying the file was too big.
       *
       * **Keep this comfortably above `MAX_UPLOAD_BYTES`.** The limit applies to
       * the raw HTTP body, so it also carries multipart boundaries, part headers
       * and every other field in the form. 6 MB leaves about a megabyte of
       * headroom over a 5 MB file, which keeps our own validator — and its
       * readable error — the thing that rejects an oversized image.
       *
       * If the file limit is ever raised, raise this with it.
       */
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
