import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/portfolio`, priority: 0.8 },
    { url: `${SITE_URL}/contact`, priority: 0.8 },
  ];
}
