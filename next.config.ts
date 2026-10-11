import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind is compiled through PostCSS (see postcss.config.mjs).
};

export default nextConfig;
