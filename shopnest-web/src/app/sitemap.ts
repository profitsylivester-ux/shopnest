import type { MetadataRoute } from "next";
import { SITE_URL, getJson } from "../lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await getJson("/stores/marketplace", 300);
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/marketplace`, changeFrequency: "daily", priority: 0.8 },
  ];
  for (const s of Array.isArray(stores) ? stores : []) {
    if (s?.slug) entries.push({ url: `${SITE_URL}/store/${encodeURIComponent(s.slug)}`, changeFrequency: "weekly", priority: 0.7 });
    for (const p of Array.isArray(s?.products) ? s.products : []) {
      if (p?.id) {
        entries.push({
          url: `${SITE_URL}/product/${encodeURIComponent(p.id)}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }
  return entries;
}
