"use client";
import { TZ_REGIONS } from "../../lib/regions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard, { toCardStore } from "../../components/ProductCard";
import { imgSrc, thumbSrc } from "../../lib/images";
import { T, fill, useLang } from "../../lib/i18n";
import { API_URL } from "../../lib/seo";
import { catLabel, getJsonClient, useCategories } from "../../lib/site";

type Facets = { categories: { name: string; count: number; thumb: string | null }[]; locations: string[] };
type Browse = { items: any[]; total: number; page: number; pages: number; limit: number; facets: Facets };
type Banner = { id: string; title: string | null; subtitle: string | null; imageUrl: string; linkUrl: string | null };

function Banners({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);
  if (banners.length === 0) return null;
  const b = banners[i % banners.length];
  const inner = (
    <div className="sn-banner-box">
      <img src={imgSrc(b.imageUrl)} alt={b.title || ""} />
      {(b.title || b.subtitle) && (
        <div className="sn-banner-text">
          {b.title && <h2>{b.title}</h2>}
          {b.subtitle && <p>{b.subtitle}</p>}
        </div>
      )}
    </div>
  );
  const ext = b.linkUrl && /^https?:\/\//.test(b.linkUrl);
  return (
    <div className="sn-banner">
      {b.linkUrl ? (ext ? <a href={b.linkUrl} target="_blank" rel="noopener noreferrer">{inner}</a> : <Link href={b.linkUrl}>{inner}</Link>) : inner}
      {banners.length > 1 && (
        <div className="sn-banner-dots">
          {banners.map((x, n) => <button key={x.id} type="button" className={n === i % banners.length ? "on" : ""} onClick={() => setI(n)} aria-label={"Banner " + (n + 1)} />)}
        </div>
      )}
    </div>
  );
}

export default function MarketplaceClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [lang] = useLang();
  const d = T[lang];
  const cats = useCategories();
  const query = sp.toString();
  const get = (k: string) => sp.get(k) || "";
  const category = get("category");
  const condition = get("condition");
  const location = get("location");
  const sort = get("sort") || "newest";
  const inStock = get("inStock") === "1";
  const onSale = get("sale") === "1";
  const verifiedOnly = get("verified") === "1";
  const page = Math.max(1, parseInt(get("page") || "1", 10) || 1);

  const [data, setData] = useState<Browse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [qInput, setQInput] = useState(get("q"));
  const [minIn, setMinIn] = useState(get("min"));
  const [maxIn, setMaxIn] = useState(get("max"));
  const lastQ = useRef(get("q"));

  const setParams = useCallback((patch: Record<string, string | null>, keepPage = false) => {
    const n = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(patch)) { if (v) n.set(k, v); else n.delete(k); }
    if (!keepPage) n.delete("page");
    const s = n.toString();
    router.replace("/marketplace" + (s ? "?" + s : ""), { scroll: false });
  }, [router]);

  useEffect(() => { getJsonClient("/content/banners").then((b) => { if (Array.isArray(b)) setBanners(b); }); }, []);
  useEffect(() => { setMinIn(get("min")); setMaxIn(get("max")); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wait a moment after typing before searching.
  useEffect(() => {
    if (qInput.trim() === lastQ.current) return undefined;
    const t = setTimeout(() => { lastQ.current = qInput.trim(); setParams({ q: qInput.trim() || null }); }, 350);
    return () => clearTimeout(t);
  }, [qInput, setParams]);
  useEffect(() => { lastQ.current = get("q"); setQInput(get("q")); }, [sp.get("q")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams(query);
    qs.set("limit", "24");
    fetch(API_URL + "/products/browse?" + qs.toString(), { signal: ac.signal })
      .then(async (r) => { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then((j) => { setData(j); setError(false); setLoading(false); })
      .catch((e) => { if (e && e.name === "AbortError") return; setError(true); setLoading(false); });
    return () => ac.abort();
  }, [query]);

  const tiles = useMemo(() => {
    const byName = new Map(cats.map((c) => [c.nameEn, c]));
    return (data?.facets.categories || []).map((f) => {
      const c = byName.get(f.name);
      const image = c && c.imageUrl ? imgSrc(c.imageUrl) : f.thumb ? thumbSrc(f.thumb) : "";
      return { name: f.name, label: c ? catLabel(c, lang) : f.name, count: f.count, image };
    });
  }, [data, cats, lang]);

  const anyFilter = !!(get("q") || category || condition || location || get("min") || get("max") || inStock || onSale || verifiedOnly);
  const total = data ? data.total : 0;
  const applyPrice = () => setParams({ min: minIn.trim() || null, max: maxIn.trim() || null });
  const sel = (label: string, active: boolean, on: () => void, count?: number, k?: string) => (
    <button key={k} type="button" className={"sn-opt" + (active ? " on" : "")} onClick={on} aria-pressed={active}>
      <span className="sn-opt-dot" aria-hidden="true" />
      <span className="sn-opt-label">{label}</span>
      {count !== undefined && <span className="sn-opt-count">{count}</span>}
    </button>
  );

  const side = (
    <aside className={"sn-mp-side" + (showFilters ? " is-open" : "")}>
      <div className="sn-side-head"><h2>{d.filters}</h2>{anyFilter && <button type="button" className="sn-link-btn" onClick={() => { setQInput(""); router.replace("/marketplace", { scroll: false }); }}>{d.clear}</button>}</div>
      <div className="sn-fgroup">
        <h3>{d.category}</h3>
        <div className="sn-flist">
          {sel(d.allCats, !category, () => setParams({ category: null }))}
          {tiles.map((t) => sel(t.label, category === t.name, () => setParams({ category: t.name }), t.count, t.name))}
          {category && !tiles.some((t) => t.name === category) && sel(category, true, () => setParams({ category: null }), 0)}
        </div>
      </div>
      <div className="sn-fgroup">
        <h3>{d.price}</h3>
        <div className="sn-price-row">
          <input inputMode="numeric" placeholder={d.min} value={minIn} onChange={(e) => setMinIn(e.target.value.replace(/[^0-9]/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") applyPrice(); }} aria-label={d.min} />
          <span>-</span>
          <input inputMode="numeric" placeholder={d.max} value={maxIn} onChange={(e) => setMaxIn(e.target.value.replace(/[^0-9]/g, ""))} onKeyDown={(e) => { if (e.key === "Enter") applyPrice(); }} aria-label={d.max} />
        </div>
        <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={applyPrice}>{d.apply}</button>
      </div>
      <div className="sn-fgroup">
        <h3>{d.location}</h3>
        <select className="sn-select" value={location} onChange={(e) => setParams({ location: e.target.value || null })} aria-label={d.location}>
          <option value="">{d.anywhere}</option>
          {TZ_REGIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          {location && !TZ_REGIONS.includes(location) && <option value={location}>{location}</option>}
        </select>
      </div>
      <div className="sn-fgroup">
        <h3>{d.condition}</h3>
        <div className="sn-flist">
          {sel(d.any, !condition, () => setParams({ condition: null }))}
          {sel(d.condNew, condition === "New", () => setParams({ condition: "New" }))}
          {sel(d.condUsed, condition === "Used", () => setParams({ condition: "Used" }))}
          {sel(d.condRef, condition === "Refurbished", () => setParams({ condition: "Refurbished" }))}
        </div>
      </div>
      <div className="sn-fgroup">
        <label className="sn-check"><input type="checkbox" checked={inStock} onChange={(e) => setParams({ inStock: e.target.checked ? "1" : null })} /><span>{d.inStock}</span></label>
        <label className="sn-check"><input type="checkbox" checked={onSale} onChange={(e) => setParams({ sale: e.target.checked ? "1" : null })} /><span>{d.onSale}</span></label>
        <label className="sn-check"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setParams({ verified: e.target.checked ? "1" : null })} /><span>{d.verifiedShopsOnly}</span></label>
      </div>
    </aside>
  );

  return (
    <div className="sn-wrap">
      <Banners banners={banners} />

      <div className="sn-pagehead">
        <div>
          <h1>{d.mpTitle}</h1>
          <p>{d.mpSub}</p>
        </div>
        <div className="sn-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input type="search" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder={d.search} aria-label={d.search} />
        </div>
      </div>

      {!category && !get("q") && tiles.length > 0 && (
        <section className="sn-cats" aria-label={d.shopByCat}>
          <h2 className="sn-h2">{d.shopByCat}</h2>
          <div className="sn-cat-row">
            {tiles.map((t) => (
              <button type="button" key={t.name} className="sn-cat-tile" onClick={() => setParams({ category: t.name })}>
                <span className="sn-cat-img">{t.image ? <img src={t.image} alt="" loading="lazy" /> : <span className="sn-cat-letter">{t.label.slice(0, 1).toUpperCase()}</span>}</span>
                <span className="sn-cat-name">{t.label}</span>
                <span className="sn-cat-count">{fill(t.count === 1 ? d.resultsOne : d.results, { n: t.count })}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="sn-mp">
        {side}
        <div className="sn-mp-main">
          <div className="sn-bar">
            <button type="button" className="sn-btn sn-btn-line sn-btn-sm sn-filter-toggle" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>{d.filters}</button>
            <div className="sn-bar-count" aria-live="polite">{data ? (total === 1 ? d.resultsOne : fill(d.results, { n: total })) : ""}{category ? " \u00b7 " + (tiles.find((t) => t.name === category)?.label || category) : ""}</div>
            <label className="sn-sort"><span>{d.sortBy}</span>
              <select className="sn-select" value={sort} onChange={(e) => setParams({ sort: e.target.value === "newest" ? null : e.target.value })}>
                <option value="newest">{d.newest}</option>
                <option value="price_asc">{d.priceAsc}</option>
                <option value="price_desc">{d.priceDesc}</option>
                <option value="rating">{d.sortRating}</option>
              </select>
            </label>
          </div>

          {error && <div className="sn-empty"><p>{d.loadError}</p></div>}
          {!error && loading && !data && <div className="sn-empty"><p>{d.loading}</p></div>}
          {!error && data && data.items.length === 0 && (
            <div className="sn-empty">
              <h3>{d.none}</h3>
              <p>{d.noneHint}</p>
              {anyFilter && <button type="button" className="sn-btn sn-btn-dark" onClick={() => { setQInput(""); router.replace("/marketplace", { scroll: false }); }}>{d.clear}</button>}
            </div>
          )}
          {!error && data && data.items.length > 0 && (
            <div className={"sn-grid" + (loading ? " is-loading" : "")}>
              {data.items.map((p) => (
                <ProductCard key={p.id} p={p} lang={lang} source="marketplace" store={toCardStore(p.store)} />
              ))}
            </div>
          )}

          {data && data.pages > 1 && (
            <nav className="sn-pager" aria-label="Pages">
              <button type="button" className="sn-btn sn-btn-line sn-btn-sm" disabled={page <= 1} onClick={() => { setParams({ page: String(page - 1) }, true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{d.prev}</button>
              <span>{fill(d.pageOf, { a: data.page, b: data.pages })}</span>
              <button type="button" className="sn-btn sn-btn-line sn-btn-sm" disabled={page >= data.pages} onClick={() => { setParams({ page: String(page + 1) }, true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{d.next}</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
