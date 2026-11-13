import type { Metadata } from "next";
import { SITE_URL, getJson, clip, productImageUrl, jsonLd } from "../../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getJson(`/stores/${encodeURIComponent(slug)}`);
  if (!s) return { title: "Store not found | ShopNest", robots: { index: false, follow: false } };
  const title = `${s.name} | ShopNest`;
  const description =
    clip(s.description, 160) || `Shop ${s.name} on ShopNest. Browse products and contact the seller on WhatsApp.`;
  const image = Array.isArray(s.products) && s.products.length > 0 ? productImageUrl(s.products[0]) : null;
  const url = `${SITE_URL}/store/${encodeURIComponent(slug)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "ShopNest", type: "website", images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function StoreLayout({ params, children }: { params: Promise<{ slug: string }>; children: React.ReactNode }) {
  const { slug } = await params;
  const s = await getJson(`/stores/${encodeURIComponent(slug)}`);
  const data = s
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: s.name,
        description: clip(s.description, 300) || undefined,
        url: `${SITE_URL}/store/${encodeURIComponent(slug)}`,
      }
    : null;
  return (
    <>
      {data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />}
      {children}
    </>
  );
}
