"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard, { toCardStore } from "../../../components/ProductCard";
import Reviews from "../../../components/Reviews";
import { RatingLine, VerifiedBadge } from "../../../components/Trust";
import SiteShell from "../../../components/SiteShell";
import { imgSrc } from "../../../lib/images";
import { T, useLang } from "../../../lib/i18n";
import { API_URL, SITE_URL } from "../../../lib/seo";
import { trackEvent, trackViewOnce } from "../../../lib/track";

const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SW = ["Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi", "Jumapili"];
type Day = { closed: boolean; open: string; close: string };

function parseHours(raw: string | null): Day[] | null {
  try {
    const a = JSON.parse(raw || "");
    return Array.isArray(a) && a.length === 7 ? a : null;
  } catch { return null; }
}

export default function PublicStorefront() {
  const params = useParams();
  const slug = params.slug as string;
  const [lang] = useLang();
  const d = T[lang];
  const [store, setStore] = useState<any>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "network">("loading");
  const [copied, setCopied] = useState(false);

  // Reloads the shop (rating and badge) after a review is written, edited or deleted.
  const refreshStore = () => { fetch(API_URL + "/stores/" + encodeURIComponent(slug)).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j) setStore(j); }).catch(() => {}); };

  useEffect(() => {
    if (!slug) return;
    let dead = false;
    fetch(API_URL + "/stores/" + encodeURIComponent(slug))
      .then(async (res) => {
        if (dead) return;
        if (res.status === 200) {
          setStore(await res.json());
          setState("ok");
          trackViewOnce({ type: "SHOP_VIEW", storeSlug: slug, source: "store" });
        } else {
          const mv = await fetch(API_URL + "/stores/" + encodeURIComponent(slug) + "/moved").then((m) => (m.status === 200 ? m.json() : null)).catch(() => null);
          if (mv && typeof mv.slug === "string" && mv.slug !== slug) { window.location.replace("/store/" + encodeURIComponent(mv.slug)); return; }
          if (!dead) setState("missing");
        }
      })
      .catch(() => { if (!dead) setState("network"); });
    return () => { dead = true; };
  }, [slug]);

  if (state !== "ok" || !store) {
    return (
      <SiteShell>
        <div className="sn-wrap sn-pad"><div className="sn-empty"><p>{state === "loading" ? d.loading : state === "network" ? d.networkError : d.storeMissing}</p><Link href="/shops" className="sn-btn sn-btn-dark">{d.allShops}</Link></div></div>
      </SiteShell>
    );
  }

  const hours = parseHours(store.openingHours);
  const days = lang === "SW" ? DAYS_SW : DAYS_EN;
  const socials = [["Instagram", store.instagramUrl], ["Facebook", store.facebookUrl], ["TikTok", store.tiktokUrl]].filter((s) => typeof s[1] === "string" && s[1].startsWith("https://"));
  const typeLabel = store.shopType === "Physical" ? d.physical : store.shopType === "Online" ? d.online : store.shopType === "Both" ? d.both : "";
  const products: any[] = Array.isArray(store.products) ? store.products : [];
  const pageUrl = SITE_URL + "/store/" + store.slug;
  const phone = String(store.whatsappNumber || "").replace(/[^0-9]/g, "");
  const chat = () => {
    trackEvent({ type: "WHATSAPP_CLICK", storeSlug: store.slug, source: "store" });
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent("Hi " + store.name + ", I found your shop on ShopNest."), "_blank", "noopener");
  };
  const share = () => window.open("https://wa.me/?text=" + encodeURIComponent(store.name + "\n" + pageUrl), "_blank", "noopener");
  const copy = async () => { try { await navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ } };

  return (
    <SiteShell>
      {store.announcement ? <div role="note" className="sn-announce">{store.announcement}</div> : null}
      <div className="sn-wrap">
        <header className="sn-store-head">
          <div className="sn-store-banner">{store.bannerUrl ? <img src={imgSrc(store.bannerUrl)} alt="" /> : null}</div>
          <div className="sn-store-id">
            <div className="sn-store-logo">{store.logoUrl ? <img src={imgSrc(store.logoUrl)} alt="" /> : <span>{String(store.name).slice(0, 2).toUpperCase()}</span>}</div>
            <div className="sn-store-text">
              <h1>{store.name}</h1>
              <div className="sn-store-trust">
                <VerifiedBadge t={store} lang={lang} showReason />
                <a href="#reviews" className="sn-store-rate"><RatingLine t={store} lang={lang} /></a>
              </div>
              <div className="sn-shop-meta">
                {store.location ? <span>{store.location}</span> : null}
                {typeLabel ? <span>{typeLabel}</span> : null}
              </div>
              {store.description ? <p>{store.description}</p> : null}
            </div>
            <div className="sn-store-actions">
              {phone ? (
                <button type="button" className="sn-btn sn-btn-sm sn-store-chat" onClick={chat}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span>{d.chatBtn}</span>
                </button>
              ) : null}
              <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={share}>{d.share}</button>
              <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={copy}>{copied ? d.copied : d.copy}</button>
            </div>
          </div>
        </header>

        <section>
          <h2 className="sn-h2">{d.storeProducts}</h2>
          {products.length === 0 ? (
            <div className="sn-empty"><p>{store.isPaused ? d.storePaused : d.storeEmpty}</p></div>
          ) : (
            <div className="sn-grid">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} lang={lang} source="store" store={toCardStore(store)} />
              ))}
            </div>
          )}
        </section>

        <Reviews slug={store.slug} lang={lang} onChanged={refreshStore} />

        {(hours || store.deliveryReturns || socials.length > 0) && (
          <section className="sn-store-info">
            {hours && (
              <div>
                <h3>{d.hours}</h3>
                {hours.map((h, i) => (
                  <div key={DAYS_EN[i]} className="sn-hours-row"><span>{days[i]}</span><span>{h.closed ? d.closed : h.open + " - " + h.close}</span></div>
                ))}
              </div>
            )}
            {store.deliveryReturns && (
              <div>
                <h3>{d.delivery}</h3>
                <p style={{ whiteSpace: "pre-line" }}>{store.deliveryReturns}</p>
              </div>
            )}
            {socials.length > 0 && (
              <div>
                <h3>{d.follow}</h3>
                <div className="sn-social">
                  {socials.map((s) => (<a key={s[0]} href={s[1]} target="_blank" rel="noopener noreferrer">{s[0]}</a>))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </SiteShell>
  );
}
