import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Serve images straight from /public: the services rewrite in vercel.json
  // routes /_next/image to the app, so the optimizer 404s in production.
  images: { unoptimized: true },
  // Each product used to have its own page at /services/<slug>; they're now sections
  // of the one products & services page, so old links land on the product's section.
  async redirects() {
    return ["websites", "crm", "automation", "growth", "cto-support"].map((slug) => ({
      source: `/services/${slug}`,
      destination: `/services#${slug}`,
      permanent: true,
    }));
  },
  // Tailwind is compiled through PostCSS (see postcss.config.mjs).
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
