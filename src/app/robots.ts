import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

// Everything is crawlable; the sitemap gives Google every page (and the favicon on each) to recrawl
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
