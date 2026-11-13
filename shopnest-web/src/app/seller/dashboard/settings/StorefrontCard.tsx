"use client";
import { useState } from "react";
import { Card, Field, Msg, api, input, lbl, primary, ghost, MUTED, type Note } from "./shared";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
type Day = { closed: boolean; open: string; close: string };
const START: Day[] = DAYS.map((_, i) => ({ closed: i === 6, open: "08:00", close: "18:00" }));
const sub: React.CSSProperties = { color: "var(--cream)", fontSize: "1rem", fontWeight: 600, margin: "1.6rem 0 0.8rem 0", paddingTop: "1.2rem", borderTop: "1px solid rgba(185,130,90,0.12)" };

function parseHours(raw: string | null): Day[] | null {
  try {
    const a = JSON.parse(raw || "");
    return Array.isArray(a) && a.length === 7 ? a.map((d: any) => ({ closed: !!d.closed, open: d.open || "08:00", close: d.close || "18:00" })) : null;
  } catch { return null; }
}

export default function StorefrontCard({ store, onSaved }: { store: any; onSaved: (s: any) => void }) {
  const saved = parseHours(store.openingHours);
  const [ann, setAnn] = useState<string>(store.announcement || "");
  const [ig, setIg] = useState<string>(store.instagramUrl || "");
  const [fb, setFb] = useState<string>(store.facebookUrl || "");
  const [tt, setTt] = useState<string>(store.tiktokUrl || "");
  const [show, setShow] = useState(!!saved);
  const [hours, setHours] = useState<Day[]>(saved || START);
  const [dr, setDr] = useState<string>(store.deliveryReturns || "");
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<Note>(null);
  const setDay = (i: number, patch: Partial<Day>) => setHours(hours.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  const save = async () => {
    if (show && hours.some((d) => !d.closed && (!d.open || !d.close))) { setM({ ok: false, text: "Fill in the opening and closing time for every open day." }); return; }
    setBusy(true); setM(null);
    const r = await api("PATCH", "/stores/me", { announcement: ann, instagramUrl: ig, facebookUrl: fb, tiktokUrl: tt, openingHours: show ? JSON.stringify(hours) : "", deliveryReturns: dr });
    setBusy(false);
    if (r.ok) { onSaved(r.data); setM({ ok: true, text: "Saved. Your storefront is updated." }); } else setM({ ok: false, text: r.error });
  };
  return (
    <Card title="Storefront extras" hint="Optional details shown on your public shop. Leave a box empty to hide it.">
      <Field name={"Announcement bar (" + ann.length + "/160)"}><input style={input} value={ann} maxLength={160} onChange={(e) => setAnn(e.target.value)} /></Field>
      <h4 style={sub}>Social links</h4>
      <Field name="Instagram"><input style={input} value={ig} maxLength={200} onChange={(e) => setIg(e.target.value)} /></Field>
      <Field name="Facebook"><input style={input} value={fb} maxLength={200} onChange={(e) => setFb(e.target.value)} /></Field>
      <Field name="TikTok"><input style={input} value={tt} maxLength={200} onChange={(e) => setTt(e.target.value)} /></Field>
      <p style={{ color: MUTED, fontSize: "0.75rem", margin: "-0.4rem 0 0 0" }}>Links must start with https:// and the site name, for example https://instagram.com/yourshop</p>
      <h4 style={sub}>Opening hours</h4>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--latte)", fontSize: "0.85rem", marginBottom: "0.8rem" }}><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Show opening hours on my shop</label>
      {show && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.8rem" }}>
          {hours.map((d, i) => (
            <div key={DAYS[i]} style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
              <span style={{ ...lbl, width: "92px", margin: 0 }}>{DAYS[i]}</span>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--latte)", fontSize: "0.82rem", width: "78px" }}><input type="checkbox" checked={d.closed} onChange={(e) => setDay(i, { closed: e.target.checked })} />Closed</label>
              <input type="time" aria-label={DAYS[i] + " opens"} style={{ ...input, width: "auto", opacity: d.closed ? 0.4 : 1 }} disabled={d.closed} value={d.open} onChange={(e) => setDay(i, { open: e.target.value })} />
              <span style={{ color: MUTED, fontSize: "0.8rem" }}>to</span>
              <input type="time" aria-label={DAYS[i] + " closes"} style={{ ...input, width: "auto", opacity: d.closed ? 0.4 : 1 }} disabled={d.closed} value={d.close} onChange={(e) => setDay(i, { close: e.target.value })} />
            </div>
          ))}
          <div><button type="button" style={ghost} onClick={() => setHours(hours.map(() => ({ ...hours[0] })))}>Copy Monday to every day</button></div>
        </div>
      )}
      <h4 style={sub}>Delivery and returns</h4>
      <Field name={"What buyers should know (" + dr.length + "/600)"}><textarea style={{ ...input, minHeight: "90px", resize: "vertical" }} value={dr} maxLength={600} onChange={(e) => setDr(e.target.value)} /></Field>
      <button onClick={save} disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>{busy ? "Saving..." : "Save storefront"}</button>
      <Msg m={m} />
    </Card>
  );
}
