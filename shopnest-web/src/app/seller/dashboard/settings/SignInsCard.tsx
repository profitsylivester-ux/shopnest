"use client";
import { useEffect, useState } from "react";
import { Card, Msg, api, saveSession, primary, ghost, MUTED, exactTime, deviceName, placeName, type Note } from "./shared";

export default function SignInsCard({ onOpenActivity }: { onOpenActivity: () => void }) {
  const [items, setItems] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<Note>(null);
  const load = async () => {
    const r = await api("GET", "/audit/me?category=security&limit=30");
    if (r.ok) setItems((r.data.items || []).filter((x: any) => x.action === "AUTH_LOGIN" || x.action === "AUTH_LOGIN_FAILED").slice(0, 6));
    else { setItems([]); setM({ ok: false, text: r.error }); }
  };
  useEffect(() => { load(); }, []);
  const out = async () => {
    setBusy(true); setM(null);
    const r = await api("POST", "/auth/logout-all");
    setBusy(false);
    if (r.ok) { saveSession(r.data); setM({ ok: true, text: "Done. Every other device is signed out. You stay signed in here." }); load(); } else setM({ ok: false, text: r.error });
  };
  return (
    <Card title="Sign-ins and devices" hint="Your latest sign-in attempts. See one you do not know? Change your password, then sign out everywhere.">
      {items === null ? (
        <p style={{ color: MUTED, fontSize: "0.85rem", margin: 0 }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: MUTED, fontSize: "0.85rem", margin: 0 }}>No sign-ins recorded yet.</p>
      ) : (
        items.map((x: any) => (
          <div key={x.id} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(185,130,90,0.08)" }}>
            <div>
              <span style={{ color: x.action === "AUTH_LOGIN" ? "#27c93f" : "#ff5f56", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{x.action === "AUTH_LOGIN" ? "Signed in" : "Failed attempt"}</span>
              <p style={{ margin: "0.2rem 0 0 0", color: MUTED, fontSize: "0.78rem" }}>{deviceName(x.userAgent) + " - " + placeName(x.ip)}</p>
            </div>
            <span style={{ color: "var(--cream)", fontSize: "0.8rem" }}>{exactTime(x.createdAt)}</span>
          </div>
        ))
      )}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1.2rem" }}>
        <button onClick={out} disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>{busy ? "Working..." : "Sign out of all other devices"}</button>
        <button onClick={onOpenActivity} style={ghost}>See full activity log</button>
      </div>
      <Msg m={m} />
    </Card>
  );
}
