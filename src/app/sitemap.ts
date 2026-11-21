import type { MetadataRoute } from "next";
import { SITE_URL, productHref, products } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...products.map((p) => ({ url: `${SITE_URL}${productHref(p.slug)}`, priority: 0.8 })),
    { url: `${SITE_URL}/contact`, priority: 0.8 },
  ];
}
