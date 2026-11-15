"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { imgSrc, thumbSrc } from "../../lib/images";
import { T, fill, useLang } from "../../lib/i18n";
import { getJsonClient } from "../../lib/site";
import { RatingLine, VerifiedBadge } from "../../components/Trust";

type Shop = { id: string; name: string; slug: string; description: string | null; logoUrl: string | null; bannerUrl: string | null; location: string | null; shopType: string | null; productCount: number; ratingAvg: number | null; ratingCount: number; topRated: boolean; verified: boolean; vProducts: number; vVisitors: number };

export default function ShopsClient() {
  const [lang] = useLang();
  const d = T[lang];
  const sp = useSearchParams();
  const router = useRouter();
  const mode = sp.get("top") === "1" ? "top" : sp.get("verified") === "1" ? "verified" : "all";
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let dead = false;
    setShops(null); setError(false);
    getJsonClient("/stores/list" + (mode === "top" ? "?top=1" : mode === "verified" ? "?verified=1" : "")).then((j) => {
      if (dead) return;
      if (Array.isArray(j)) setShops(j); else setError(true);
    });
    return () => { dead = true; };
  }, [mode]);
  const pick = (m: "all" | "verified" | "top") => router.replace(m === "all" ? "/shops" : m === "top" ? "/shops?top=1" : "/shops?verified=1", { scroll: false });

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

      <div className="sn-chips" role="group" aria-label={d.shopsTitle}>
        <button type="button" className={"sn-chip" + (mode === "all" ? " on" : "")} aria-pressed={mode === "all"} onClick={() => pick("all")}>{d.allShopsChip}</button>
        <button type="button" className={"sn-chip" + (mode === "verified" ? " on" : "")} aria-pressed={mode === "verified"} onClick={() => pick("verified")}>{d.verified}</button>
        <button type="button" className={"sn-chip" + (mode === "top" ? " on" : "")} aria-pressed={mode === "top"} onClick={() => pick("top")}>{d.topRated}</button>
      </div>
      {mode !== "all" && <p className="sn-chip-sub">{mode === "top" ? d.topRatedSub : d.verifiedSub}</p>}

      {error && <div className="sn-empty"><p>{d.loadError}</p></div>}
      {!error && !shops && <div className="sn-empty"><p>{d.loading}</p></div>}
      {!error && shops && shops.length === 0 && <div className="sn-empty"><p>{mode === "all" ? d.noShops : d.noShopMatch}</p></div>}
      {!error && shops && shops.length > 0 && shown.length === 0 && <div className="sn-empty"><p>{d.noShopMatch}</p></div>}

      {shown.length > 0 && (
        <div className="sn-shop-grid">
          {shown.map((s) => (
            <Link key={s.id} href={"/store/" + s.slug} className="sn-shop-card">
              <div className="sn-shop-banner">{s.bannerUrl ? <img src={imgSrc(s.bannerUrl)} alt="" loading="lazy" /> : null}</div>
              <div className="sn-shop-logo">{s.logoUrl ? <img src={thumbSrc(s.logoUrl)} alt="" loading="lazy" /> : <span>{s.name.slice(0, 1).toUpperCase()}</span>}</div>
              <div className="sn-shop-body">
                <h3>{s.name}</h3>
                <div className="sn-store-trust"><VerifiedBadge t={s} lang={lang} /><RatingLine t={s} lang={lang} /></div>
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
