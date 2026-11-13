"use client";
import { useState } from "react";
import { Card, Msg, api, primary, MUTED, type Note } from "./shared";

export default function VacationCard({ store, onSaved }: { store: any; onSaved: (s: any) => void }) {
  const on = !!store.isPaused;
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<Note>(null);
  const toggle = async () => {
    setBusy(true); setM(null);
    const r = await api("PATCH", "/stores/me", { isPaused: !on });
    setBusy(false);
    if (r.ok) { onSaved(r.data); setM({ ok: true, text: on ? "Vacation mode is off. Your shop is visible again." : "Vacation mode is on. Your shop and products are hidden." }); } else setM({ ok: false, text: r.error });
  };
  return (
    <Card title="Vacation mode" hint="Taking a break? Hide your products from the marketplace and search. Your shop link stays open and tells buyers you are on a break.">
      <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 1rem 0", color: on ? "#e8a33d" : "#27c93f", fontSize: "0.88rem" }}>
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: on ? "#e8a33d" : "#27c93f" }} />
        {on ? "ON - buyers cannot see your products" : "OFF - your shop is open"}
      </p>
      <button onClick={toggle} disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>{busy ? "Saving..." : on ? "Turn vacation mode off" : "Turn vacation mode on"}</button>
      <p style={{ color: MUTED, fontSize: "0.75rem", margin: "0.8rem 0 0 0" }}>Your products are not deleted. Turning it off brings everything back.</p>
      <Msg m={m} />
    </Card>
  );
}
