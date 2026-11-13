"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/seo";
import TrendChart from "./TrendChart";

type Props = {
  store: any;
  products: any[];
  onAddProduct: () => void;
  onOpenTab: (tab: string) => void;
};

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "all", label: "All time" },
];
const SOURCE_LABEL: Record<string, string> = { home: "Home marketplace", store: "Your shop page", product: "Product page" };
const MUTED = "rgba(243,227,208,0.5)";
const card: React.CSSProperties = { background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" };
const heading: React.CSSProperties = { fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--cream)", margin: 0 };

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return min + " min ago";
  const h = Math.floor(min / 60);
  if (h < 24) return h + " h ago";
  const d = Math.floor(h / 24);
  if (d < 7) return d + " d ago";
  return new Date(iso).toLocaleDateString("en-GB", { timeZone: "Africa/Dar_es_Salaam", day: "numeric", month: "short", year: "numeric" });
}

export default function HomeTab({ store, products, onAddProduct, onOpenTab }: Props) {
  const [period, setPeriod] = useState("week");
  const [summary, setSummary] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("shopnest_token");
    if (!token) return undefined;
    setError("");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/events/me/summary?period=${period}`, { headers }),
      fetch(`${API_URL}/events/me/recent?limit=8`, { headers }),
    ])
      .then(async ([a, b]) => {
        if (!a.ok || !b.ok) throw new Error("bad status");
        const [s, r] = await Promise.all([a.json(), b.json()]);
        if (!cancelled) { setSummary(s); setRecent(r); }
      })
      .catch(() => { if (!cancelled) setError("Could not load your activity. Is the backend running?"); });
    return () => { cancelled = true; };
  }, [period]);

  const stock = (p: any) => p.stockQuantity ?? 1;
  const live = products.filter((p) => p.status === "ACTIVE" && stock(p) > 0);
  const soldOut = products.filter((p) => p.status === "ACTIVE" && stock(p) <= 0);
  const low = products.filter((p) => p.status === "ACTIVE" && stock(p) >= 1 && stock(p) <= 3);
  const hidden = products.filter((p) => p.status === "HIDDEN");

  const t = summary ? summary.totals : null;
  const tiles: { label: string; value: number | null; hint: string }[] = [
    { label: "WhatsApp clicks", value: t ? t.whatsappClicks : null, hint: "Buyers who tapped WhatsApp" },
    { label: "Product views", value: t ? t.productViews : null, hint: "Opens of a product page" },
    { label: "Shop views", value: t ? t.shopViews : null, hint: "Visits to your shop page" },
    { label: "Products", value: live.length, hint: soldOut.length + " sold out | " + hidden.length + " hidden" },
  ];

  const attention: { color: string; text: string }[] = [];
  if (store.status === "PENDING") attention.push({ color: "var(--latte)", text: "Your shop is under review. Buyers cannot see it until it is approved." });
  if (store.status === "SUSPENDED") attention.push({ color: "#ff5f56", text: "Your shop is suspended and hidden from buyers." });
  soldOut.forEach((p) => attention.push({ color: "#ff5f56", text: p.name + " is sold out" }));
  low.forEach((p) => attention.push({ color: "#e8a33d", text: p.name + " - only " + stock(p) + " left" }));
  if (hidden.length > 0) attention.push({ color: MUTED, text: hidden.length + (hidden.length === 1 ? " product is hidden from buyers" : " products are hidden from buyers") });

  const top = (summary ? summary.products : []).filter((p: any) => p.views > 0 || p.clicks > 0).slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.8rem", color: "var(--cream)", margin: 0 }}>Overview</h2>
          <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.3rem 0 0 0" }}>How buyers are finding and contacting your shop</p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <div role="group" aria-label="Time period" style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: "10px", border: "1px solid rgba(185,130,90,0.15)" }}>
            {PERIODS.map((p) => (
              <button key={p.key} onClick={() => setPeriod(p.key)} aria-pressed={period === p.key} style={{ background: period === p.key ? "var(--latte)" : "transparent", color: period === p.key ? "var(--espresso)" : "var(--latte)", border: "none", borderRadius: "7px", padding: "0.45rem 0.9rem", fontSize: "0.8rem", cursor: "pointer", fontFamily: "Jost, sans-serif", fontWeight: period === p.key ? 600 : 400 }}>{p.label}</button>
            ))}
          </div>
          <button onClick={onAddProduct} style={{ background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.55rem 1.1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Jost, sans-serif" }}>+ Add product</button>
        </div>
      </div>

      {error && <p style={{ color: "#ff5f56", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "0.8rem" }}>
        {tiles.map((tile) => (
          <div key={tile.label} style={{ ...card, padding: "1.3rem" }}>
            <p style={{ margin: 0, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--latte)" }}>{tile.label}</p>
            <p style={{ margin: "0.6rem 0 0.3rem 0", fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--cream)", lineHeight: 1 }}>{tile.value === null ? "-" : tile.value.toLocaleString()}</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: MUTED }}>{tile.hint}</p>
          </div>
        ))}
      </div>
      <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>A WhatsApp click means a buyer opened a chat with you from your shop or listings. It is not a completed sale - deals are agreed on WhatsApp. Your own visits are not counted.</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <TrendChart buckets={summary ? summary.buckets : []} granularity={summary ? summary.granularity : "day"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={card}>
          <h3 style={{ ...heading, marginBottom: "1.2rem" }}>Needs attention</h3>
          {attention.length === 0 ? (
            <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>Everything looks good. No sold out, low stock or hidden products.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {attention.slice(0, 6).map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                  <span style={{ color: "var(--cream)", fontSize: "0.9rem" }}>{a.text}</span>
                </div>
              ))}
              {attention.length > 6 && <span style={{ color: MUTED, fontSize: "0.8rem" }}>+ {attention.length - 6} more</span>}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ ...heading, marginBottom: "1.2rem" }}>Top products</h3>
          {top.length === 0 ? (
            <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>No activity on your products in this period yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {top.map((p: any, i: number) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontFamily: "Playfair Display, serif", color: "var(--latte)", width: "18px" }}>{i + 1}</span>
                  <span style={{ color: "var(--cream)", fontSize: "0.9rem", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  <span style={{ color: MUTED, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{p.views} {p.views === 1 ? "view" : "views"} | {p.clicks} {p.clicks === 1 ? "click" : "clicks"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h3 style={heading}>Recent inquiries</h3>
          {recent && recent.total > recent.items.length && (
            <button onClick={() => onOpenTab("Messages")} style={{ background: "none", border: "none", color: "var(--latte)", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Jost, sans-serif" }}>View all ({recent.total})</button>
          )}
        </div>
        {!recent || recent.items.length === 0 ? (
          <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>No inquiries yet. When a buyer taps WhatsApp on one of your products, it appears here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recent.items.map((r: any) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.8rem 0", borderBottom: "1px solid rgba(185,130,90,0.08)" }}>
                <span style={{ color: "var(--cream)", fontSize: "0.9rem", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.product ? r.product.name : "Product removed"}</span>
                <span style={{ color: MUTED, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{SOURCE_LABEL[r.source] || "Website"}</span>
                <span style={{ color: "var(--latte)", fontSize: "0.8rem", whiteSpace: "nowrap", minWidth: "80px", textAlign: "right" }}>{timeAgo(r.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
