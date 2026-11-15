"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "../../../components/ProductCard";
import SiteShell from "../../../components/SiteShell";
import { imgSrc } from "../../../lib/images";
import { T, useLang } from "../../../lib/i18n";
import { API_URL, SITE_URL } from "../../../lib/seo";
import { trackViewOnce } from "../../../lib/track";

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
              <div className="sn-shop-meta">
                {store.location ? <span>{store.location}</span> : null}
                {typeLabel ? <span>{typeLabel}</span> : null}
              </div>
              {store.description ? <p>{store.description}</p> : null}
            </div>
            <div className="sn-store-actions">
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
                <ProductCard key={p.id} p={p} lang={lang} source="store" store={{ name: store.name, slug: store.slug, location: store.location, whatsapp: store.whatsappNumber }} />
              ))}
            </div>
          )}
        </section>

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
