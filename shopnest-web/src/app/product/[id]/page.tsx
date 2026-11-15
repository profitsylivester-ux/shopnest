"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "../../../components/ProductCard";
import SiteShell from "../../../components/SiteShell";
import { imgSrc, thumbSrc } from "../../../lib/images";
import { T, fill, useLang } from "../../../lib/i18n";
import { API_URL, SITE_URL } from "../../../lib/seo";
import { getJsonClient } from "../../../lib/site";
import { trackEvent, trackViewOnce } from "../../../lib/track";

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const [lang] = useLang();
  const d = T[lang];
  const [product, setProduct] = useState<any>(null);
  const [more, setMore] = useState<any[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "network">("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    let dead = false;
    setState("loading");
    fetch(API_URL + "/products/public/" + id)
      .then(async (res) => {
        if (dead) return;
        if (res.status === 200) {
          const p = await res.json();
          setProduct(p);
          setState("ok");
          trackViewOnce({ type: "PRODUCT_VIEW", productId: id, source: "product" });
          if (p.store && p.store.slug) {
            getJsonClient("/products/browse?shop=" + encodeURIComponent(p.store.slug) + "&limit=6").then((j) => {
              if (!dead && j && Array.isArray(j.items)) setMore(j.items.filter((x: any) => x.id !== id).slice(0, 4));
            });
          }
        } else setState("missing");
      })
      .catch(() => { if (!dead) setState("network"); });
    return () => { dead = true; };
  }, [id]);

  if (state !== "ok" || !product) {
    return (
      <SiteShell>
        <div className="sn-wrap sn-pad"><div className="sn-empty"><p>{state === "loading" ? d.loading : state === "network" ? d.networkError : d.productMissing}</p><Link href="/marketplace" className="sn-btn sn-btn-dark">{d.backToMarket}</Link></div></div>
      </SiteShell>
    );
  }

  const stock = product.stockQuantity ?? 1;
  const soldOut = stock <= 0;
  const phone = String(product.store?.whatsappNumber || "").replace(/[^0-9]/g, "");
  const off = product.wasPrice && product.wasPrice > product.price ? Math.round((1 - product.price / product.wasPrice) * 100) : 0;
  const pageUrl = SITE_URL + "/product/" + product.id;
  const condKey = product.condition === "New" ? d.condNew : product.condition === "Used" ? d.condUsed : product.condition === "Refurbished" ? d.condRef : product.condition;

  const chat = () => {
    const msg = encodeURIComponent(`Hi ${product.store?.name}, I am interested in buying "${product.name}" (TZS ${product.price.toLocaleString("en-US")}) from your ShopNest storefront.`);
    trackEvent({ type: "WHATSAPP_CLICK", productId: product.id, source: "product" });
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank", "noopener");
  };
  const share = () => {
    const msg = encodeURIComponent(`${product.name} - TZS ${product.price.toLocaleString("en-US")}\n${pageUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener");
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };

  return (
    <SiteShell>
      <div className="sn-wrap">
        <nav className="sn-crumbs" aria-label="Breadcrumb">
          <Link href="/marketplace">{d.marketplace}</Link>
          {product.category ? <><span>/</span><Link href={"/marketplace?category=" + encodeURIComponent(product.category)}>{product.category}</Link></> : null}
        </nav>

        <div className="sn-pd">
          <div className="sn-pd-media">
            {product.imageUrl ? <img src={imgSrc(product.imageUrl)} alt={product.name} /> : <div className="sn-card-nophoto sn-pd-nophoto">{d.noPhoto}</div>}
          </div>

          <div className="sn-pd-info">
            <h1>{product.name}</h1>
            <div className="sn-pd-price">
              <strong>TZS {product.price.toLocaleString("en-US")}</strong>
              {off >= 1 ? <><s>TZS {product.wasPrice.toLocaleString("en-US")}</s><span className="sn-tag sn-tag-off">-{off}%</span></> : null}
            </div>

            <ul className="sn-pd-facts">
              <li><span className={soldOut ? "sn-stock-out" : stock <= 3 ? "sn-stock-low" : "sn-stock-ok"}>{soldOut ? d.sold : stock <= 3 ? fill(d.lowStock, { n: stock }) : d.inStockLabel}</span></li>
              {product.condition ? <li><b>{d.condLabel}:</b> <span>{condKey}</span></li> : null}
              {product.category ? <li><b>{d.catLabel}:</b> <Link href={"/marketplace?category=" + encodeURIComponent(product.category)}>{product.category}</Link></li> : null}
              {product.store?.location ? <li><b>{d.location}:</b> <span>{product.store.location}</span></li> : null}
            </ul>

            {product.description ? (
              <div className="sn-pd-desc">
                <h2>{d.descLabel}</h2>
                <p>{product.description}</p>
              </div>
            ) : null}

            <div className="sn-pd-cta">
              <button type="button" className="sn-wa-btn" onClick={chat} disabled={soldOut || !phone}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
                <span>{soldOut ? d.sold : d.chat}</span>
              </button>
              <div className="sn-pd-secondary">
                <button type="button" className="sn-btn sn-btn-line" onClick={share}>{d.share}</button>
                <button type="button" className="sn-btn sn-btn-line" onClick={copy}>{copied ? d.copied : d.copy}</button>
              </div>
              <p className="sn-pd-note">{soldOut ? d.soldOutNote : d.chatNote}</p>
            </div>

            {product.store ? (
              <Link href={"/store/" + product.store.slug} className="sn-seller">
                <span className="sn-seller-logo">{product.store.logoUrl ? <img src={thumbSrc(product.store.logoUrl)} alt="" /> : String(product.store.name).slice(0, 1).toUpperCase()}</span>
                <span className="sn-seller-text"><small>{d.soldBy}</small><strong>{product.store.name}</strong></span>
                <span className="sn-seller-go">{d.visit} &rarr;</span>
              </Link>
            ) : null}
          </div>
        </div>

        {more.length > 0 && (
          <section className="sn-more">
            <h2 className="sn-h2">{d.moreFrom}</h2>
            <div className="sn-grid sn-grid-4">
              {more.map((p) => (
                <ProductCard key={p.id} p={p} lang={lang} source="product" store={{ name: p.store?.name || product.store?.name || "", slug: product.store?.slug || "", location: p.store?.location, whatsapp: p.store?.whatsappNumber }} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
