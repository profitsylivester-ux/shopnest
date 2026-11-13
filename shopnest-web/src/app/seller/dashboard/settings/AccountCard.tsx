"use client";
import { useEffect, useState } from "react";
import { Card, Field, Msg, api, saveSession, input, primary, MUTED, type Note } from "./shared";

export default function AccountCard({ onChanged }: { onChanged?: () => void }) {
  const [acct, setAcct] = useState<any>(null);
  const [name, setName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState("");
  const [nm, setNm] = useState<Note>(null);
  const [em, setEm] = useState<Note>(null);
  useEffect(() => {
    api("GET", "/auth/account").then((r) => {
      if (r.ok) { setAcct(r.data); setName(r.data.name || ""); } else setNm({ ok: false, text: r.error });
    });
  }, []);
  const saveName = async () => {
    if (!name.trim()) { setNm({ ok: false, text: "Your name cannot be empty." }); return; }
    setBusy("name"); setNm(null);
    const r = await api("PATCH", "/auth/profile", { name });
    setBusy("");
    if (r.ok) {
      try { const u = JSON.parse(localStorage.getItem("shopnest_user") || "{}"); u.name = r.data.name; localStorage.setItem("shopnest_user", JSON.stringify(u)); } catch { /* ignore */ }
      setName(r.data.name); setAcct({ ...acct, name: r.data.name }); setNm({ ok: true, text: "Name saved." }); if (onChanged) onChanged();
    } else setNm({ ok: false, text: r.error });
  };
  const saveEmail = async () => {
    if (!newEmail.trim() || !pw) { setEm({ ok: false, text: "Enter the new email and your password." }); return; }
    setBusy("email"); setEm(null);
    const r = await api("POST", "/auth/change-email", { password: pw, newEmail: newEmail.trim() });
    setBusy("");
    if (r.ok) { saveSession(r.data); setAcct({ ...acct, email: r.data.user.email }); setNewEmail(""); setPw(""); setEm({ ok: true, text: "Email changed. Other devices were signed out. You stay signed in here." }); } else setEm({ ok: false, text: r.error });
  };
  const since = acct && acct.createdAt ? new Date(acct.createdAt).toLocaleDateString("en-GB", { timeZone: "Africa/Dar_es_Salaam", day: "numeric", month: "long", year: "numeric" }) : "";
  const sub: React.CSSProperties = { color: "var(--cream)", fontSize: "1rem", fontWeight: 600, margin: "1.6rem 0 0.8rem 0", paddingTop: "1.2rem", borderTop: "1px solid rgba(185,130,90,0.12)" };
  return (
    <Card title="Your account" hint={acct ? "Signed in as " + acct.email + (since ? " - member since " + since : "") : "Loading your account..."}>
      <Field name="Display name"><input style={input} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></Field>
      <button onClick={saveName} disabled={busy === "name" || !acct} style={{ ...primary, opacity: busy === "name" ? 0.6 : 1 }}>{busy === "name" ? "Saving..." : "Save name"}</button>
      <Msg m={nm} />
      <h4 style={sub}>Change email</h4>
      <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0 0 0.8rem 0", lineHeight: 1.5 }}>This is the email you sign in with. We ask for your password to be safe, and other devices are signed out.</p>
      <Field name="New email"><input type="email" autoComplete="email" style={input} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></Field>
      <Field name="Your password"><input type="password" autoComplete="current-password" style={input} value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <button onClick={saveEmail} disabled={busy === "email" || !acct} style={{ ...primary, opacity: busy === "email" ? 0.6 : 1 }}>{busy === "email" ? "Saving..." : "Change email"}</button>
      <Msg m={em} />
    </Card>
  );
}
