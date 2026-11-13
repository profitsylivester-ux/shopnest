"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/seo";
import TrendChart from "./TrendChart";

const PERIODS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "all", label: "All time" },
];
const MUTED = "rgba(243,227,208,0.5)";
const card: React.CSSProperties = { background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" };
const th: React.CSSProperties = { textAlign: "left", fontWeight: 500, padding: "0 0 0.8rem 0", color: MUTED, fontSize: "0.8rem", borderBottom: "1px solid rgba(185,130,90,0.2)" };
const td: React.CSSProperties = { padding: "0.8rem 0", borderBottom: "1px solid rgba(185,130,90,0.06)", fontSize: "0.9rem", color: "var(--cream)" };

function per100(clicks: number, views: number) {
  return views > 0 ? String(Math.round((clicks / views) * 100)) : "-";
}

export default function AnalyticsTab() {
  const [period, setPeriod] = useState("month");
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("shopnest_token");
    if (!token) return undefined;
    setError("");
    fetch(`${API_URL}/events/me/summary?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error("bad status");
        const s = await res.json();
        if (!cancelled) setSummary(s);
      })
      .catch(() => { if (!cancelled) setError("Could not load your analytics. Is the backend running?"); });
    return () => { cancelled = true; };
  }, [period]);

  const t = summary ? summary.totals : null;
  const tiles = [
    { label: "WhatsApp clicks", value: t ? t.whatsappClicks.toLocaleString() : "-", hint: "Buyers who tapped WhatsApp" },
    { label: "Product views", value: t ? t.productViews.toLocaleString() : "-", hint: "Opens of a product page" },
    { label: "Shop views", value: t ? t.shopViews.toLocaleString() : "-", hint: "Visits to your shop page" },
    { label: "Clicks per 100 views", value: t ? per100(t.whatsappClicks, t.productViews) : "-", hint: "WhatsApp clicks for every 100 product views" },
  ];
  const rows: any[] = summary ? summary.products : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.8rem", color: "var(--cream)", margin: 0 }}>Analytics</h2>
          <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.3rem 0 0 0" }}>The full numbers behind your shop</p>
        </div>
        <div role="group" aria-label="Time period" style={{ display: "flex", gap: "0.3rem", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: "10px", border: "1px solid rgba(185,130,90,0.15)" }}>
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)} aria-pressed={period === p.key} style={{ background: period === p.key ? "var(--latte)" : "transparent", color: period === p.key ? "var(--espresso)" : "var(--latte)", border: "none", borderRadius: "7px", padding: "0.45rem 0.9rem", fontSize: "0.8rem", cursor: "pointer", fontFamily: "Jost, sans-serif", fontWeight: period === p.key ? 600 : 400 }}>{p.label}</button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "#ff5f56", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "0.8rem" }}>
        {tiles.map((tile) => (
          <div key={tile.label} style={{ ...card, padding: "1.3rem" }}>
            <p style={{ margin: 0, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--latte)" }}>{tile.label}</p>
            <p style={{ margin: "0.6rem 0 0.3rem 0", fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--cream)", lineHeight: 1 }}>{tile.value}</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: MUTED }}>{tile.hint}</p>
          </div>
        ))}
      </div>
      <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>A WhatsApp click is a chat opened, not a completed sale. Views count once per visitor visit, clicks count every time, so clicks per 100 views can go above 100. Your own visits are not counted.</p>

      <div style={{ marginBottom: "1.5rem" }}>
        <TrendChart buckets={summary ? summary.buckets : []} granularity={summary ? summary.granularity : "day"} />
      </div>

      <div style={card}>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--cream)", margin: "0 0 1.2rem 0" }}>Your products</h3>
        {rows.length === 0 ? (
          <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>Add a product to see its numbers here.</p>
        ) : (
          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Product</th>
                  <th style={{ ...th, textAlign: "right" }}>Views</th>
                  <th style={{ ...th, textAlign: "right" }}>WhatsApp clicks</th>
                  <th style={{ ...th, textAlign: "right" }}>Clicks per 100 views</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ ...td, maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</td>
                    <td style={{ ...td, textAlign: "right" }}>{p.views}</td>
                    <td style={{ ...td, textAlign: "right" }}>{p.clicks}</td>
                    <td style={{ ...td, textAlign: "right", color: "var(--latte)" }}>{per100(p.clicks, p.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
