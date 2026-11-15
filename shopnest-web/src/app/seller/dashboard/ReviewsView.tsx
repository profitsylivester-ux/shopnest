"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/seo";

const MUTED = "rgba(243,227,208,0.5)";
const card: React.CSSProperties = { background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" };

function stars(n: number) { return "\u2605".repeat(n) + "\u2606".repeat(5 - n); }

// The seller's own reviews: what buyers wrote about the shop. Sellers can read them; only the ShopNest team can hide a review.
export default function ReviewsView() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (page: number) => {
    const token = localStorage.getItem("shopnest_token");
    if (!token) return;
    setBusy(true); setError("");
    try {
      const r = await fetch(`${API_URL}/reviews/me?limit=20&page=${page}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("bad");
      const j = await r.json();
      setData((prev: any) => (page === 1 || !prev ? j : { ...j, items: [...prev.items, ...j.items] }));
    } catch { setError("Could not load your reviews. Is the backend running?"); }
    setBusy(false);
  };
  useEffect(() => { load(1); }, []);

  const s = data ? data.summary : null;
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.8rem", color: "var(--cream)", margin: 0 }}>Reviews</h2>
        <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.3rem 0 0 0" }}>{s ? (s.count === 0 ? "No reviews yet" : (s.avg !== null ? s.avg.toFixed(1) + " average from " : "") + s.count + (s.count === 1 ? " review" : " reviews")) : "What buyers say about your shop"}{data && data.awaiting > 0 ? " | " + data.awaiting + " waiting for approval" : ""}</p>
      </div>
      {error && <p style={{ color: "#ff5f56", fontSize: "0.9rem" }}>{error}</p>}
      <div style={card}>
        {data && data.items.length === 0 && <p style={{ color: MUTED, margin: 0, fontSize: "0.9rem" }}>When buyers review your shop, their reviews appear here and on your shop page. Reviews cannot be bought or removed by sellers, which is what makes them trusted.</p>}
        {data && data.items.map((r: any) => (
          <div key={r.id} style={{ padding: "0.9rem 0", borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.9rem", alignItems: "center" }}>
              <strong style={{ color: "var(--cream)", fontSize: "0.95rem" }}>{r.author}</strong>
              <span style={{ color: "#e0a526", letterSpacing: "0.1em" }} aria-label={r.rating + " out of 5 stars"}>{stars(r.rating)}</span>
              <span style={{ color: MUTED, fontSize: "0.8rem" }}>{new Date(r.createdAt).toLocaleDateString("en-GB", { timeZone: "Africa/Dar_es_Salaam", day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            {r.comment ? <p style={{ margin: "0.4rem 0 0 0", color: "var(--cream)", opacity: 0.85, fontSize: "0.92rem", lineHeight: 1.5, overflowWrap: "anywhere" }}>{r.comment}</p> : null}
          </div>
        ))}
        {data && data.items.length < data.total && (
          <button onClick={() => load(Math.floor(data.items.length / 20) + 1)} disabled={busy} style={{ marginTop: "1rem", background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontFamily: "Jost, sans-serif", fontSize: "0.85rem" }}>{busy ? "Loading..." : "Show more"}</button>
        )}
      </div>
    </div>
  );
}
