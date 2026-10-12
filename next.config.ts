import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Serve images straight from /public: the services rewrite in vercel.json
  // routes /_next/image to the app, so the optimizer 404s in production.
  images: { unoptimized: true },
  // Tailwind is compiled through PostCSS (see postcss.config.mjs).
};

export default nextConfig;
