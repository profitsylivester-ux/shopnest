import type { Metadata } from "next";
import InfoPage, { ComingSoon } from "../../components/InfoPage";
import { SITE_URL, clip, getJson } from "../../lib/seo";

const SLUG = "support";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getJson("/content/pages/" + SLUG, 60);
  if (!p) return { title: "ShopNest", robots: { index: false, follow: false } };
  return {
    title: p.titleEn + " | ShopNest",
    description: clip(p.bodyEn, 160),
    alternates: { canonical: SITE_URL + "/" + SLUG },
  };
}

export default async function Page() {
  const p = await getJson("/content/pages/" + SLUG, 60);
  if (!p) return <ComingSoon slug={SLUG} />;
  return <InfoPage page={p} />;
}
