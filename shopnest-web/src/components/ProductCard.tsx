"use client";
import Link from "next/link";
import { thumbSrc } from "../lib/images";
import { T, fill, type Lang } from "../lib/i18n";
import { RatingLine, VerifiedTick, type TrustInfo } from "./Trust";

export type CardStore = { name: string; slug: string; location?: string | null; whatsapp?: string | null } & TrustInfo;

// Builds the shop part of a card from any API shop object (keeps the real rating and Verified facts).
export function toCardStore(s: any, fallback?: { name?: string; slug?: string }): CardStore {
  return { name: s?.name || fallback?.name || "", slug: s?.slug || fallback?.slug || "", location: s?.location, whatsapp: s?.whatsappNumber ?? s?.whatsapp, ratingAvg: s?.ratingAvg ?? null, ratingCount: s?.ratingCount ?? 0, topRated: !!s?.topRated, verified: !!s?.verified, vProducts: s?.vProducts ?? 0, vVisitors: s?.vVisitors ?? 0 };
}
export type CardProduct = { id: string; name: string; price: number; wasPrice?: number | null; description?: string | null; imageUrl?: string | null; stockQuantity?: number | null; createdAt?: string | null };

const WEEK = 7 * 24 * 60 * 60 * 1000;

// The one product card used on every public page. Every tag on it is computed from real data:
// "New" only for products added in the last 7 days (and only on the seller's shop page), a discount only when the seller entered a higher old price,
// stars only when the shop has real reviews. There is no chat button on the card: the whole card opens the product,
// and the WhatsApp button lives on the product page.
export default function ProductCard({ p, store, source, lang }: { p: CardProduct; store: CardStore; source: "home" | "marketplace" | "store" | "product"; lang: Lang }) {
  const d = T[lang];
  const stock = p.stockQuantity ?? 1;
  const soldOut = stock <= 0;
  const onStorePage = source === "store"; // the shop is already named in the page header
  // "New" is shown only inside the seller's own shop page, so older products on the marketplace never look outdated next to it.
  const isNew = onStorePage && !!p.createdAt && Date.now() - new Date(p.createdAt).getTime() < WEEK;
  const off = p.wasPrice && p.wasPrice > p.price ? Math.round((1 - p.price / p.wasPrice) * 100) : 0;
  const img = thumbSrc(p.imageUrl);
  const priceText = p.price.toLocaleString("en-US");
  const showWas = off >= 1 && !!p.wasPrice;
  const showLow = !soldOut && stock <= 3;

  return (
    <article className={"sn-pc" + (soldOut ? " is-sold" : "")} data-source={source}>
      <div className="sn-pc-media">
        {img ? (
          <>
            <img className="sn-pc-bg" src={img} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <img className="sn-pc-img" src={img} alt={p.name} loading="lazy" decoding="async" />
          </>
        ) : (
          <div className="sn-pc-nophoto">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></svg>
            <span>{d.noPhoto}</span>
          </div>
        )}
        {!soldOut && (isNew || off >= 1) && (
          <div className="sn-pc-tags">
            {isNew && <span className="sn-pc-tag">{d.newTag}</span>}
            {off >= 1 && <span className="sn-pc-tag is-off">-{off}%</span>}
          </div>
        )}
        {soldOut && <span className="sn-pc-sold"><span>{d.sold}</span></span>}
      </div>

      <div className="sn-pc-body">
        <h3 className="sn-pc-name"><Link href={"/product/" + p.id} className="sn-pc-link">{p.name}</Link></h3>

        {!onStorePage && (
        <div className="sn-pc-shop">
          {store.slug ? <Link href={"/store/" + store.slug} className="sn-pc-shoplink">{store.name}</Link> : <span className="sn-pc-shoplink">{store.name}</span>}
          <VerifiedTick t={store} lang={lang} />
        </div>
        )}

        {!onStorePage && (store.location || (store.ratingCount || 0) > 0) && (
          <div className="sn-pc-meta">
            <RatingLine t={store} lang={lang} />
            {store.location ? (
              <span className="sn-pc-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></svg>
                <span>{store.location}</span>
              </span>
            ) : null}
          </div>
        )}

        <div className="sn-pc-buy">
          <div className="sn-pc-pricebox">
            {(showWas || showLow) && (
              <span className="sn-pc-sub">
                {showWas ? <s>TZS {p.wasPrice!.toLocaleString("en-US")}</s> : null}
                {showLow ? <em>{fill(d.lowStock, { n: stock })}</em> : null}
              </span>
            )}
            <strong className="sn-pc-price" style={{ ["--n" as string]: priceText.length } as React.CSSProperties}><small>TZS</small> {priceText}</strong>
          </div>
          <span className="sn-pc-go" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </div>
    </article>
  );
}
