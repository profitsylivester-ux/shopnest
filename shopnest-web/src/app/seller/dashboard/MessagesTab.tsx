"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/seo";

const PAGE = 20;
const MUTED = "rgba(243,227,208,0.5)";
const SOURCE_LABEL: Record<string, string> = { home: "Home marketplace", store: "Your shop page", product: "Product page" };
const card: React.CSSProperties = { background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Dar_es_Salaam", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return min + " min ago";
  const h = Math.floor(min / 60);
  if (h < 24) return h + " h ago";
  return Math.floor(h / 24) + " d ago";
}

export default function MessagesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (skip: number) => {
    const token = localStorage.getItem("shopnest_token");
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/events/me/recent?limit=${PAGE}&skip=${skip}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      setTotal(data.total);
      setItems((prev) => (skip === 0 ? data.items : [...prev, ...data.items]));
      setLoaded(true);
    } catch {
      setError("Could not load your inquiries. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(0); }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.8rem", color: "var(--cream)", margin: 0 }}>Messages</h2>
          <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.3rem 0 0 0" }}>{loaded ? total.toLocaleString() + (total === 1 ? " inquiry" : " inquiries") + " in total" : "Every time a buyer taps WhatsApp on your shop"}</p>
        </div>
        <button onClick={() => load(0)} disabled={busy} style={{ background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.55rem 1.1rem", borderRadius: "8px", cursor: busy ? "default" : "pointer", fontSize: "0.85rem", fontFamily: "Jost, sans-serif", opacity: busy ? 0.6 : 1 }}>{busy ? "Loading..." : "Refresh"}</button>
      </div>
      <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>Each row is a buyer who opened a WhatsApp chat with you. WhatsApp chats are private, so we only see that the chat was opened, never what was said. Your own visits are not counted.</p>
      {error && <p style={{ color: "#ff5f56", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}
      <div style={card}>
        {loaded && items.length === 0 ? (
          <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>No inquiries yet. When a buyer taps WhatsApp on one of your products, it appears here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((r: any) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", padding: "0.9rem 0", borderBottom: "1px solid rgba(185,130,90,0.08)" }}>
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <p style={{ margin: 0, color: "var(--cream)", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.product ? r.product.name : "Product removed"}</p>
                  {r.product && <p style={{ margin: "0.2rem 0 0 0", color: "var(--latte)", fontSize: "0.8rem" }}>TZS {r.product.price.toLocaleString()}</p>}
                </div>
                <span style={{ color: MUTED, fontSize: "0.8rem", minWidth: "130px" }}>{SOURCE_LABEL[r.source] || "Website"}</span>
                <div style={{ textAlign: "right", minWidth: "150px" }}>
                  <p style={{ margin: 0, color: "var(--cream)", fontSize: "0.8rem" }}>{when(r.createdAt)}</p>
                  <p style={{ margin: "0.2rem 0 0 0", color: "var(--latte)", fontSize: "0.75rem" }}>{timeAgo(r.createdAt)}</p>
                </div>
                {r.product ? <a href={"/product/" + r.product.id} target="_blank" rel="noreferrer" style={{ color: "var(--latte)", fontSize: "0.8rem", textDecoration: "none", border: "1px solid rgba(185,130,90,0.3)", borderRadius: "6px", padding: "0.3rem 0.7rem" }}>View product</a> : <span style={{ minWidth: "92px" }} />}
              </div>
            ))}
          </div>
        )}
        {items.length < total && (
          <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
            <button onClick={() => load(items.length)} disabled={busy} style={{ background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.55rem 1.4rem", borderRadius: "8px", cursor: busy ? "default" : "pointer", fontSize: "0.85rem", fontFamily: "Jost, sans-serif" }}>{busy ? "Loading..." : "Load more"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
