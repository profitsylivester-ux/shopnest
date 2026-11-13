"use client";
import { useEffect, useState } from "react";
import { Card, Msg, api, input, primary, ghost, MUTED, type Note } from "./shared";

export default function ShopLinkCard({ store, onSaved }: { store: any; onSaved: (s: any) => void }) {
  const [base, setBase] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(store.slug);
  const [check, setCheck] = useState<{ available: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<Note>(null);
  const clean = draft.trim().toLowerCase();
  useEffect(() => { setBase(window.location.origin + "/store/"); }, []);
  useEffect(() => {
    if (!editing || clean === store.slug) { setCheck(null); return undefined; }
    let dead = false;
    const t = setTimeout(async () => {
      const r = await api("GET", "/stores/me/slug-available?slug=" + encodeURIComponent(clean));
      if (!dead) setCheck(r.ok ? r.data : { available: false, message: r.error });
    }, 400);
    return () => { dead = true; clearTimeout(t); };
  }, [clean, editing, store.slug]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(base + store.slug); setM({ ok: true, text: "Link copied." }); } catch { setM({ ok: false, text: "Could not copy. Select the link and copy it by hand." }); }
  };
  const save = async () => {
    setBusy(true); setM(null);
    const r = await api("PATCH", "/stores/me/slug", { slug: clean });
    setBusy(false);
    if (r.ok) { onSaved(r.data); setEditing(false); setCheck(null); setM({ ok: true, text: "Link changed. Your old link no longer works." }); } else setM({ ok: false, text: r.error });
  };
  const canSave = !busy && clean !== store.slug && !!check && check.available;
  return (
    <Card title="Shop link" hint="The web address you share with buyers.">
      <p style={{ margin: "0 0 0.8rem 0", padding: "0.7rem 0.9rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(185,130,90,0.3)", borderRadius: "8px", color: "var(--cream)", fontSize: "0.88rem", wordBreak: "break-all" }}>{base + store.slug}</p>
      {store.status !== "ACTIVE" && <p style={{ color: "#e8a33d", fontSize: "0.8rem", margin: "0 0 0.8rem 0" }}>{"Your shop is " + (store.status === "PENDING" ? "waiting for admin approval" : "suspended by an admin") + ". This link works for buyers once your shop is active."}</p>}
      {!editing ? (
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button onClick={copy} style={ghost}>Copy link</button>
          <a href={base + store.slug} target="_blank" rel="noopener noreferrer" style={{ ...ghost, textDecoration: "none", display: "inline-block" }}>Open my shop</a>
          <button onClick={() => { setDraft(store.slug); setEditing(true); setM(null); }} style={ghost}>Change link</button>
        </div>
      ) : (
        <div>
          <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0 0 0.4rem 0", wordBreak: "break-all" }}>{base}</p>
          <input style={input} value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} aria-label="New shop link" />
          {check && <p style={{ color: check.available ? "#27c93f" : "#ff5f56", fontSize: "0.8rem", margin: "0.5rem 0 0 0" }}>{check.message}</p>}
          <p style={{ color: "#e8a33d", fontSize: "0.78rem", margin: "0.8rem 0", lineHeight: 1.5 }}>Warning: once you change it, the old link stops working. Anyone who saved or shared the old link will not find your shop.</p>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button onClick={save} disabled={!canSave} style={{ ...primary, opacity: canSave ? 1 : 0.5 }}>{busy ? "Saving..." : "Save new link"}</button>
            <button onClick={() => { setEditing(false); setCheck(null); }} style={ghost}>Cancel</button>
          </div>
        </div>
      )}
      <Msg m={m} />
    </Card>
  );
}
