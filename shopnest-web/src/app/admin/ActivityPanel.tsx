"use client";
import { useCallback, useEffect, useState } from "react";
import { api, Btn, C, Empty, fmtDateTime, Panel, Select } from "./ui";

type Item = { id: string; action: string; summary: string; details: any; ip: string | null; userAgent: string | null; byAdmin: boolean; createdAt: string };

const CATEGORIES = [
  { v: "", l: "Everything" },
  { v: "security", l: "Sign-in and security" },
  { v: "shop", l: "Shop" },
  { v: "products", l: "Products" },
  { v: "admin", l: "Admin actions" },
];

// Activity log of any account. Used from the shop and user screens and for the admin's own actions.
export default function ActivityPanel({ userId, title, onClose }: { userId: string; title: string; onClose?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (skip: number, cat: string, append: boolean) => {
    setLoading(true);
    setError("");
    const r = await api("/audit/user/" + encodeURIComponent(userId) + "?limit=20&skip=" + skip + (cat ? "&category=" + cat : ""));
    setLoading(false);
    if (!r.ok) { setError(r.error); return; }
    setTotal(r.data.total);
    setItems((prev) => (append ? [...prev, ...r.data.items] : r.data.items));
  }, [userId]);

  useEffect(() => { load(0, category, false); }, [load, category]);

  return (
    <Panel style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", margin: 0 }}>{title}</h3>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <Select label="Filter activity" value={category} onChange={setCategory}>
            {CATEGORIES.map((c) => <option key={c.v} value={c.v} style={{ background: "#1a0f0a", color: "#f3e3d0" }}>{c.l}</option>)}
          </Select>
          {onClose && <Btn small onClick={onClose}>Close</Btn>}
        </div>
      </div>
      {error && <p role="alert" style={{ color: C.bad, fontSize: "0.88rem" }}>{error}</p>}
      {!error && !loading && items.length === 0 && <Empty>No activity recorded yet.</Empty>}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((i) => (
          <div key={i.id} style={{ padding: "0.7rem 0", borderBottom: "1px solid rgba(185,130,90,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.9rem" }}>{i.summary}{i.byAdmin && <span style={{ color: C.warn, fontSize: "0.75rem", marginLeft: "0.5rem" }}>(by an admin)</span>}</span>
              <span style={{ color: C.muted, fontSize: "0.78rem", whiteSpace: "nowrap" }}>{fmtDateTime(i.createdAt)}</span>
            </div>
            <div style={{ color: C.muted, fontSize: "0.75rem", marginTop: "0.2rem" }}>{i.action}{i.ip ? " - " + i.ip : ""}</div>
          </div>
        ))}
      </div>
      {loading && <p style={{ color: C.muted, fontSize: "0.85rem", marginTop: "0.8rem" }}>Loading...</p>}
      {!loading && items.length < total && <div style={{ marginTop: "1rem" }}><Btn small onClick={() => load(items.length, category, true)}>Load more ({total - items.length} left)</Btn></div>}
    </Panel>
  );
}
