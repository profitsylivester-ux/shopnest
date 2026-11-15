import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InfoPage from "../../../components/InfoPage";
import { SITE_URL, clip, getJson } from "../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getJson("/content/pages/" + encodeURIComponent(slug), 60);
  if (!p) return { title: "Page not found | ShopNest", robots: { index: false, follow: false } };
  return {
    title: p.titleEn + " | ShopNest",
    description: clip(p.bodyEn, 160),
    alternates: { canonical: SITE_URL + "/pages/" + encodeURIComponent(slug) },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = await getJson("/content/pages/" + encodeURIComponent(slug), 60);
  if (!p) notFound();
  return <InfoPage page={p} />;
}
