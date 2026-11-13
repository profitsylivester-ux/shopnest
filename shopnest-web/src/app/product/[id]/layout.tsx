import type { Metadata } from "next";
import { SITE_URL, getJson, clip, productImageUrl, jsonLd } from "../../../lib/seo";

const CONDITIONS: Record<string, string> = {
  New: "https://schema.org/NewCondition",
  Used: "https://schema.org/UsedCondition",
  Refurbished: "https://schema.org/RefurbishedCondition",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getJson(`/products/public/${encodeURIComponent(id)}`);
  if (!p) return { title: "Product not found | ShopNest", robots: { index: false, follow: false } };
  const title = `${p.name} | ShopNest`;
  const description =
    clip(p.description, 160) ||
    `${p.name} for TZS ${Number(p.price).toLocaleString("en-US")} from ${p.store?.name ?? "a ShopNest seller"}. Contact the seller on WhatsApp.`;
  const image = productImageUrl(p);
  const url = `${SITE_URL}/product/${encodeURIComponent(id)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "ShopNest", type: "website", images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductLayout({ params, children }: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id } = await params;
  const p = await getJson(`/products/public/${encodeURIComponent(id)}`);
  const image = p ? productImageUrl(p) : null;
  const data = p
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: clip(p.description, 300) || p.name,
        image: image ? [image] : undefined,
        category: p.category || undefined,
        itemCondition: p.condition ? CONDITIONS[p.condition] : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "TZS",
          price: p.price,
          availability: (p.stockQuantity ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/product/${encodeURIComponent(id)}`,
          seller: p.store?.name ? { "@type": "Organization", name: p.store.name } : undefined,
        },
      }
    : null;
  return (
    <>
      {data && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />}
      {children}
    </>
  );
}
