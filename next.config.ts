import type { NextConfig } from "next";

// GitHub Pages hosts this project below /ADFLEX. Local development stays at /.
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryBasePath = isGitHubPages ? "/ADFLEX" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repositoryBasePath,
  assetPrefix: repositoryBasePath,
  env: { NEXT_PUBLIC_BASE_PATH: repositoryBasePath },
  images: { unoptimized: true },
  poweredByHeader: false,

  experimental: {
    // Keeps route navigation scrolling to the top with the loading boundaries
    // used by News and Outcomes on the pinned Next.js version.
    appNewScrollHandler: true,
  },
};

export default nextConfig;