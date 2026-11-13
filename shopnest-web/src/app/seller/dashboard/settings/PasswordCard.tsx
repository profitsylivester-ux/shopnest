"use client";
import { useState } from "react";
import { Card, Field, Msg, api, saveSession, input, primary, MUTED, type Note } from "./shared";

export default function PasswordCard() {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<Note>(null);
  const t = show ? "text" : "password";
  const save = async () => {
    if (!cur) { setM({ ok: false, text: "Enter your current password." }); return; }
    if (nw.length < 8 || nw.length > 72) { setM({ ok: false, text: "The new password must be 8 to 72 characters." }); return; }
    if (nw !== again) { setM({ ok: false, text: "The two new passwords do not match." }); return; }
    if (nw === cur) { setM({ ok: false, text: "The new password must be different from the current one." }); return; }
    setBusy(true); setM(null);
    const r = await api("POST", "/auth/change-password", { currentPassword: cur, newPassword: nw });
    setBusy(false);
    if (r.ok) { saveSession(r.data); setCur(""); setNw(""); setAgain(""); setM({ ok: true, text: "Password changed. Other devices were signed out. You stay signed in here." }); } else setM({ ok: false, text: r.error });
  };
  return (
    <Card title="Change password" hint="Use at least 8 characters. Changing it signs out every other device.">
      <Field name="Current password"><input type={t} autoComplete="current-password" style={input} value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
      <Field name="New password"><input type={t} autoComplete="new-password" maxLength={72} style={input} value={nw} onChange={(e) => setNw(e.target.value)} /></Field>
      <Field name="Repeat new password"><input type={t} autoComplete="new-password" maxLength={72} style={input} value={again} onChange={(e) => setAgain(e.target.value)} /></Field>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: MUTED, fontSize: "0.8rem", marginBottom: "1rem" }}><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Show passwords</label>
      <button onClick={save} disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>{busy ? "Saving..." : "Change password"}</button>
      <Msg m={m} />
    </Card>
  );
}
