"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { imgSrc, thumbSrc } from "../../lib/images";
import { T, fill, useLang } from "../../lib/i18n";
import { getJsonClient } from "../../lib/site";

type Shop = { id: string; name: string; slug: string; description: string | null; logoUrl: string | null; bannerUrl: string | null; location: string | null; shopType: string | null; productCount: number };

export default function ShopsClient() {
  const [lang] = useLang();
  const d = T[lang];
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    getJsonClient("/stores/list").then((j) => {
      if (Array.isArray(j)) setShops(j); else setError(true);
    });
  }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!shops) return [];
    if (!s) return shops;
    return shops.filter((x) => x.name.toLowerCase().includes(s) || (x.location || "").toLowerCase().includes(s));
  }, [shops, q]);

  const typeLabel = (t: string | null) => (t === "Physical" ? d.physical : t === "Online" ? d.online : t === "Both" ? d.both : "");

  return (
    <div className="sn-wrap">
      <div className="sn-pagehead">
        <div>
          <h1>{d.shopsTitle}</h1>
          <p>{d.shopsSub}</p>
        </div>
        <div className="sn-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={d.searchShops} aria-label={d.searchShops} />
        </div>
      </div>

      {error && <div className="sn-empty"><p>{d.loadError}</p></div>}
      {!error && !shops && <div className="sn-empty"><p>{d.loading}</p></div>}
      {!error && shops && shops.length === 0 && <div className="sn-empty"><p>{d.noShops}</p></div>}
      {!error && shops && shops.length > 0 && shown.length === 0 && <div className="sn-empty"><p>{d.noShopMatch}</p></div>}

      {shown.length > 0 && (
        <div className="sn-shop-grid">
          {shown.map((s) => (
            <Link key={s.id} href={"/store/" + s.slug} className="sn-shop-card">
              <div className="sn-shop-banner">{s.bannerUrl ? <img src={imgSrc(s.bannerUrl)} alt="" loading="lazy" /> : null}</div>
              <div className="sn-shop-logo">{s.logoUrl ? <img src={thumbSrc(s.logoUrl)} alt="" loading="lazy" /> : <span>{s.name.slice(0, 1).toUpperCase()}</span>}</div>
              <div className="sn-shop-body">
                <h3>{s.name}</h3>
                <div className="sn-shop-meta">
                  {s.location ? <span>{s.location}</span> : null}
                  {typeLabel(s.shopType) ? <span>{typeLabel(s.shopType)}</span> : null}
                </div>
                {s.description ? <p>{s.description}</p> : null}
                <div className="sn-shop-foot">
                  <span>{s.productCount === 1 ? d.oneProduct : fill(d.nProducts, { n: s.productCount })}</span>
                  <span className="sn-shop-visit">{d.visit} &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
