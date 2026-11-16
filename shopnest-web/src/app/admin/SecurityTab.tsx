"use client";
import { useState } from "react";
import { C, Btn, Field, Notice, PageTitle, Panel, SectionNote, api, inputStyle, useNotice } from "./ui";

// The site owner changes his own password here. Every change is written to the activity log.
export default function SecurityTab() {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [n, say, clear] = useNotice();
  const t = show ? "text" : "password";

  const save = async () => {
    if (busy) return;
    if (!cur) { say("error", "Enter your current password."); return; }
    if (nw.length < 8 || nw.length > 72) { say("error", "The new password must be 8 to 72 characters."); return; }
    if (nw !== again) { say("error", "The two new passwords do not match."); return; }
    if (nw === cur) { say("error", "The new password must be different from the current one."); return; }
    setBusy(true); clear();
    const r = await api("/auth/change-password", { method: "POST", data: { currentPassword: cur, newPassword: nw } });
    setBusy(false);
    if (!r.ok) { say("error", r.error); return; }
    // the server signed this device in again with a fresh key (every other device was signed out)
    try {
      if (r.data && r.data.access_token) localStorage.setItem("shopnest_token", r.data.access_token);
      if (r.data && r.data.user) localStorage.setItem("shopnest_user", JSON.stringify(r.data.user));
    } catch { /* ignore */ }
    setCur(""); setNw(""); setAgain("");
    say("ok", "Password changed. Other devices were signed out. You stay signed in here.");
  };

  return (
    <>
      <PageTitle title="Change password" sub="Use at least 8 characters. Changing it signs you out on every other device." />
      <Notice n={n} onClose={clear} />
      <Panel style={{ maxWidth: "460px" }}>
        <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: "grid", gap: "1rem" }}>
          <Field label="Current password"><input type={t} autoComplete="current-password" style={inputStyle} value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
          <Field label="New password"><input type={t} autoComplete="new-password" maxLength={72} style={inputStyle} value={nw} onChange={(e) => setNw(e.target.value)} /></Field>
          <Field label="Repeat new password"><input type={t} autoComplete="new-password" maxLength={72} style={inputStyle} value={again} onChange={(e) => setAgain(e.target.value)} /></Field>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: C.muted, fontSize: "0.82rem" }}><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Show passwords</label>
          <div><Btn kind="primary" type="submit" disabled={busy}>{busy ? "Saving..." : "Change password"}</Btn></div>
        </form>
      </Panel>
      <div style={{ marginTop: "1.2rem", maxWidth: "460px" }}>
        <SectionNote>Each change is recorded in My admin activity with the time, IP address and device. The password itself is never shown or stored in readable form.</SectionNote>
      </div>
    </>
  );
}
