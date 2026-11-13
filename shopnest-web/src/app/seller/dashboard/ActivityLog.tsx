"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/seo";

const PAGE = 20;
const MUTED = "rgba(243,227,208,0.5)";
const card: React.CSSProperties = { background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" };
const COLORS: Record<string, string> = { ok: "#27c93f", bad: "#ff5f56", warn: "#e8a33d", n: "var(--latte)" };
const CATS = [
  { key: "", label: "All" },
  { key: "security", label: "Sign-ins & security" },
  { key: "shop", label: "Shop" },
  { key: "products", label: "Products" },
  { key: "admin", label: "Admin actions" },
];
const ACTIONS: Record<string, [string, string]> = {
  AUTH_REGISTER: ["Account created", "ok"],
  AUTH_LOGIN: ["Signed in", "ok"],
  AUTH_LOGIN_FAILED: ["Failed sign-in", "bad"],
  AUTH_LOGOUT: ["Signed out", "n"],
  AUTH_LOGOUT_ALL: ["Signed out everywhere", "warn"],
  AUTH_NAME_CHANGED: ["Name changed", "n"],
  AUTH_PASSWORD_CHANGED: ["Password changed", "warn"],
  AUTH_PASSWORD_CHANGE_FAILED: ["Password change refused", "bad"],
  AUTH_EMAIL_CHANGED: ["Email changed", "warn"],
  AUTH_EMAIL_CHANGE_FAILED: ["Email change refused", "bad"],
  STORE_CREATED: ["Shop created", "ok"],
  STORE_UPDATED: ["Shop edited", "n"],
  STORE_SLUG_CHANGED: ["Shop link changed", "warn"],
  STORE_PAUSED: ["Vacation mode on", "warn"],
  STORE_RESUMED: ["Vacation mode off", "ok"],
  PRODUCT_CREATED: ["Product added", "ok"],
  PRODUCT_UPDATED: ["Product edited", "n"],
  PRODUCT_HIDDEN: ["Product hidden", "warn"],
  PRODUCT_SHOWN: ["Product shown", "ok"],
  ADMIN_STORE_STATUS: ["Admin: shop status", "warn"],
  ADMIN_PRODUCT_STATUS: ["Admin: product status", "warn"],
  ADMIN_PRODUCT_RESTORED: ["Admin: product restored", "ok"],
};
const FIELD: Record<string, string> = { name: "Name", email: "Email", slug: "Shop link", description: "Description", whatsappNumber: "WhatsApp number", logoUrl: "Logo", bannerUrl: "Banner", location: "Location", shopType: "Shop type", instagramUrl: "Instagram link", facebookUrl: "Facebook link", tiktokUrl: "TikTok link", openingHours: "Opening hours", deliveryReturns: "Delivery and returns", announcement: "Announcement", isPaused: "Vacation mode", price: "Price", stockQuantity: "Stock", imageUrl: "Image", category: "Category", condition: "Condition", status: "Status" };

function exact(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Dar_es_Salaam", weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function ago(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return s + " s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + " min ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " h ago";
  return Math.floor(h / 24) + " d ago";
}
function device(ua: string | null) {
  if (!ua) return "Unknown device";
  const b = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /^node/i.test(ua) ? "Script" : "Browser";
  const o = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
  return o ? b + " on " + o : b;
}
function place(ip: string | null) {
  if (!ip) return "Unknown IP";
  return ip === "::1" || ip === "127.0.0.1" ? "this computer (local)" : ip;
}
function val(v: any) {
  if (v === null || v === undefined || v === "") return "empty";
  if (typeof v === "boolean") return v ? "on" : "off";
  return String(v).slice(0, 80);
}

export default function ActivityLog() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [live, setLive] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [updated, setUpdated] = useState("");
  const [, setTick] = useState(0);

  const load = async (skip: number, cat: string, silent?: boolean) => {
    const token = localStorage.getItem("shopnest_token");
    if (!token) return;
    if (!silent) { setBusy(true); setError(""); }
    try {
      const res = await fetch(`${API_URL}/audit/me?limit=${PAGE}&skip=${skip}${cat ? "&category=" + cat : ""}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) throw new Error("session");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      setTotal(data.total);
      setItems((prev) => {
        if (skip > 0) return [...prev, ...data.items];
        const ids = new Set(data.items.map((x: any) => x.id));
        return [...data.items, ...prev.filter((x: any) => !ids.has(x.id))];
      });
      setLoaded(true);
      setUpdated(new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Dar_es_Salaam" }));
    } catch (e: any) {
      if (!silent) setError(e && e.message === "session" ? "Your session ended. Please sign in again." : "Could not load your activity. Is the backend running?");
    } finally {
      if (!silent) setBusy(false);
    }
  };

  useEffect(() => { setItems([]); setLoaded(false); load(0, category); }, [category]);
  useEffect(() => {
    if (!live) return undefined;
    const t = setInterval(() => { if (document.visibilityState === "visible") load(0, category, true); }, 15000);
    return () => clearInterval(t);
  }, [live, category]);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 10000); return () => clearInterval(t); }, []);

  const btn: React.CSSProperties = { background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.82rem", fontFamily: "Jost, sans-serif", cursor: "pointer" };

  return (
    <div>
      <style>{"@keyframes snPulse{0%,100%{opacity:1}50%{opacity:.25}}"}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.8rem", color: "var(--cream)", margin: 0 }}>Account activity</h2>
          <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.3rem 0 0 0" }}>{loaded ? total.toLocaleString() + (total === 1 ? " event" : " events") + " recorded" + (updated ? " - updated " + updated : "") : "Everything done in your account"}</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button onClick={() => setLive(!live)} aria-pressed={live} style={{ ...btn, display: "flex", alignItems: "center", gap: "0.5rem", color: live ? "#27c93f" : "var(--latte)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: live ? "#27c93f" : "rgba(243,227,208,0.3)", animation: live ? "snPulse 1.6s infinite" : "none" }} />{live ? "Live" : "Paused"}
          </button>
          <button onClick={() => load(0, category)} disabled={busy} style={{ ...btn, opacity: busy ? 0.6 : 1 }}>{busy ? "Loading..." : "Refresh"}</button>
        </div>
      </div>
      <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0 0 1rem 0", lineHeight: 1.5 }}>Every sign-in and change in your account is recorded here with the exact time (Tanzania time) and the device it came from. Passwords and photos are never stored in this log. If you see something you did not do, change your password in Shop settings.</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        {CATS.map((c) => (
          <button key={c.key} onClick={() => setCategory(c.key)} aria-pressed={category === c.key} style={{ background: category === c.key ? "var(--latte)" : "transparent", color: category === c.key ? "var(--espresso)" : "var(--latte)", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "20px", padding: "0.35rem 0.9rem", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Jost, sans-serif" }}>{c.label}</button>
        ))}
      </div>
      {error && <p style={{ color: "#ff5f56", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}
      <div style={card}>
        {loaded && items.length === 0 ? (
          <p style={{ color: MUTED, fontSize: "0.9rem", margin: 0 }}>Nothing recorded here yet.</p>
        ) : (
          items.map((r: any) => {
            const meta = ACTIONS[r.action] || [r.action, "n"];
            const color = COLORS[meta[1]];
            const changes: any[] = r.details && Array.isArray(r.details.changes) ? r.details.changes : [];
            return (
              <div key={r.id} style={{ padding: "0.9rem 0 0.9rem 0.9rem", borderBottom: "1px solid rgba(185,130,90,0.08)", borderLeft: "3px solid " + color }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                    <span style={{ color, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{meta[0]}</span>
                    <p style={{ margin: "0.25rem 0 0 0", color: "var(--cream)", fontSize: "0.9rem", lineHeight: 1.4, wordBreak: "break-word" }}>{r.summary}</p>
                    <p style={{ margin: "0.3rem 0 0 0", color: MUTED, fontSize: "0.75rem" }}>{r.byAdmin ? "Done by an admin" : device(r.userAgent) + " - " + place(r.ip)}</p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "200px" }}>
                    <p style={{ margin: 0, color: "var(--cream)", fontSize: "0.8rem" }}>{exact(r.createdAt)}</p>
                    <p style={{ margin: "0.2rem 0 0 0", color: "var(--latte)", fontSize: "0.75rem" }}>{ago(r.createdAt)}</p>
                  </div>
                </div>
                {changes.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <button onClick={() => setOpen(open === r.id ? null : r.id)} style={{ background: "none", border: "none", color: "var(--latte)", fontSize: "0.75rem", cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "Jost, sans-serif" }}>{open === r.id ? "Hide details" : "Show details"}</button>
                    {open === r.id && (
                      <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {changes.map((c: any, i: number) => (
                          <p key={i} style={{ margin: 0, color: MUTED, fontSize: "0.78rem", wordBreak: "break-word" }}>{(FIELD[c.field] || c.field) + ": "}{c.note ? "changed" : <>{val(c.from)} &rarr; {val(c.to)}</>}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {items.length < total && (
          <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
            <button onClick={() => load(items.length, category)} disabled={busy} style={btn}>{busy ? "Loading..." : "Load more"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
