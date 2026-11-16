"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../../lib/seo";
import { T, useLang, type Lang } from "../../../lib/i18n";

const S: Record<Lang, Record<string, string>> = {
  EN: {
    title: "Change password",
    sub: "Use at least 8 characters. Changing it signs you out on every other device. You stay signed in here.",
    cur: "Current password", nw: "New password", again: "Repeat new password", show: "Show passwords",
    save: "Change password", saving: "Saving...",
    done: "Password changed. Other devices were signed out. You stay signed in here.",
    needCur: "Enter your current password.", len: "The new password must be 8 to 72 characters.",
    mismatch: "The two new passwords do not match.", same: "The new password must be different from the current one.",
    needSignIn: "Please sign in to change your password.",
    net: "Could not reach the server. Try again in a moment.", many: "Too many tries. Wait a minute and try again.",
    wrong: "Current password is incorrect", google: "This account signs in with Google, so it has no password to change.",
  },
  SW: {
    title: "Badilisha nenosiri",
    sub: "Tumia angalau herufi 8. Kubadilisha kunakutoa kwenye vifaa vingine vyote. Unabaki umeingia hapa.",
    cur: "Nenosiri la sasa", nw: "Nenosiri jipya", again: "Rudia nenosiri jipya", show: "Onyesha nenosiri",
    save: "Badilisha nenosiri", saving: "Inahifadhi...",
    done: "Nenosiri limebadilishwa. Vifaa vingine vimetolewa. Unabaki umeingia hapa.",
    needCur: "Weka nenosiri lako la sasa.", len: "Nenosiri jipya liwe na herufi 8 hadi 72.",
    mismatch: "Nenosiri mbili mpya hazilingani.", same: "Nenosiri jipya lazima liwe tofauti na la sasa.",
    needSignIn: "Tafadhali ingia ili kubadilisha nenosiri lako.",
    net: "Seva haipatikani. Jaribu tena baada ya muda mfupi.", many: "Majaribio mengi sana. Subiri dakika moja ujaribu tena.",
    wrong: "Nenosiri la sasa si sahihi.", google: "Akaunti hii inaingia kwa Google, kwa hiyo haina nenosiri la kubadilisha.",
  },
};

function readToken(): string {
  try { return localStorage.getItem("shopnest_token") || ""; } catch { return ""; }
}

// Any signed-in person (buyer, seller or the site owner) can change their own password here.
// The server records the change in that account's activity log; the password itself is never stored in readable form.
export default function PasswordClient() {
  const [lang] = useLang();
  const d = T[lang];
  const s = S[lang];
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const sync = () => { setSignedIn(!!readToken()); setReady(true); };
    sync();
    window.addEventListener("shopnest-auth", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("shopnest-auth", sync); window.removeEventListener("storage", sync); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!cur) { setMsg({ ok: false, text: s.needCur }); return; }
    if (nw.length < 8 || nw.length > 72) { setMsg({ ok: false, text: s.len }); return; }
    if (nw !== again) { setMsg({ ok: false, text: s.mismatch }); return; }
    if (nw === cur) { setMsg({ ok: false, text: s.same }); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(API_URL + "/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + readToken() },
        body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
      });
      let data: any = null;
      try { data = await res.json(); } catch { /* no body */ }
      if (res.ok) {
        // the server signed this device in again with a fresh key (every other device was signed out)
        try {
          if (data && data.access_token) localStorage.setItem("shopnest_token", data.access_token);
          if (data && data.user) localStorage.setItem("shopnest_user", JSON.stringify(data.user));
        } catch { /* ignore */ }
        setCur(""); setNw(""); setAgain("");
        setMsg({ ok: true, text: s.done });
      } else if (res.status === 429) {
        setMsg({ ok: false, text: s.many });
      } else if (res.status === 401) {
        setSignedIn(false);
      } else {
        const m = data && data.message;
        const raw = Array.isArray(m) ? m.join(", ") : typeof m === "string" ? m : "";
        setMsg({ ok: false, text: raw === "Current password is incorrect" ? s.wrong : raw.indexOf("signs in with Google") >= 0 ? s.google : raw || s.net });
      }
    } catch {
      setMsg({ ok: false, text: s.net });
    }
    setBusy(false);
  };

  const type = show ? "text" : "password";
  return (
    <div className="sn-pw">
      <h1>{s.title}</h1>
      {ready && !signedIn ? (
        <div className="sn-pw-card">
          <p className="sn-pw-sub" style={{ marginBottom: 16 }}>{s.needSignIn}</p>
          <button type="button" className="sn-btn sn-btn-dark" onClick={() => window.dispatchEvent(new CustomEvent("shopnest-open-auth", { detail: { mode: "login" } }))}>{d.signIn}</button>
        </div>
      ) : (
        <>
          <p className="sn-pw-sub">{s.sub}</p>
          <form className="sn-pw-card" onSubmit={submit}>
            <label className="sn-pw-f"><span>{s.cur}</span><input type={type} autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></label>
            <label className="sn-pw-f"><span>{s.nw}</span><input type={type} autoComplete="new-password" maxLength={72} value={nw} onChange={(e) => setNw(e.target.value)} /></label>
            <label className="sn-pw-f"><span>{s.again}</span><input type={type} autoComplete="new-password" maxLength={72} value={again} onChange={(e) => setAgain(e.target.value)} /></label>
            <label className="sn-pw-show"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />{s.show}</label>
            <button type="submit" className="sn-btn sn-btn-dark" disabled={busy || !ready} style={{ opacity: busy ? 0.6 : 1 }}>{busy ? s.saving : s.save}</button>
            {msg && <div className={"sn-pw-msg " + (msg.ok ? "ok" : "err")} role={msg.ok ? "status" : "alert"}>{msg.text}</div>}
          </form>
        </>
      )}
    </div>
  );
}
