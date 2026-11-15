"use client";
import Link from "next/link";
import { thumbSrc } from "../lib/images";
import { T, fill, type Lang } from "../lib/i18n";
import { trackEvent } from "../lib/track";

export type CardStore = { name: string; slug: string; location?: string | null; whatsapp?: string | null };
export type CardProduct = { id: string; name: string; price: number; wasPrice?: number | null; imageUrl?: string | null; stockQuantity?: number | null; createdAt?: string | null };

const WEEK = 7 * 24 * 60 * 60 * 1000;

// The one product card used on every page. Every tag on it is computed from real data:
// "New" only for products added in the last 7 days, a discount only when the seller entered a higher old price.
export default function ProductCard({ p, store, source, lang }: { p: CardProduct; store: CardStore; source: "home" | "marketplace" | "store" | "product"; lang: Lang }) {
  const d = T[lang];
  const stock = p.stockQuantity ?? 1;
  const soldOut = stock <= 0;
  const isNew = !!p.createdAt && Date.now() - new Date(p.createdAt).getTime() < WEEK;
  const off = p.wasPrice && p.wasPrice > p.price ? Math.round((1 - p.price / p.wasPrice) * 100) : 0;
  const phone = (store.whatsapp || "").replace(/[^0-9]/g, "");
  const img = thumbSrc(p.imageUrl);

  const chat = () => {
    const msg = encodeURIComponent(`Hi ${store.name}, I am interested in buying "${p.name}" (TZS ${p.price.toLocaleString("en-US")}) from your ShopNest storefront.`);
    trackEvent({ type: "WHATSAPP_CLICK", productId: p.id, source: source === "marketplace" || source === "home" ? "home" : source });
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank", "noopener");
  };

  return (
    <article className={"sn-card" + (soldOut ? " is-sold" : "")}>
      <div className="sn-card-img">
        {img ? <img src={img} alt={p.name} loading="lazy" decoding="async" /> : <div className="sn-card-nophoto">{d.noPhoto}</div>}
        <div className="sn-card-tags">
          {isNew && !soldOut && <span className="sn-tag sn-tag-new">{d.newTag}</span>}
          {off >= 1 && !soldOut && <span className="sn-tag sn-tag-off">-{off}%</span>}
        </div>
        {soldOut && <span className="sn-card-soldflag">{d.sold}</span>}
      </div>
      <div className="sn-card-body">
        <h3 className="sn-card-name"><Link href={"/product/" + p.id} className="sn-card-link">{p.name}</Link></h3>
        <div className="sn-card-price">
          <strong>TZS {p.price.toLocaleString("en-US")}</strong>
          {off >= 1 && p.wasPrice ? <s>TZS {p.wasPrice.toLocaleString("en-US")}</s> : null}
        </div>
        {!soldOut && stock <= 3 && <div className="sn-card-low">{fill(d.lowStock, { n: stock })}</div>}
        <div className="sn-card-foot">
          <div className="sn-card-shop">
            <span className="sn-card-shopname">{store.name}</span>
            {store.location ? <span className="sn-card-loc">{store.location}</span> : null}
          </div>
          <button type="button" className="sn-card-wa" onClick={chat} disabled={soldOut || !phone} aria-label={d.chatAria} title={d.chatAria}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          </button>
        </div>
      </div>
    </article>
  );
}
