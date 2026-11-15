"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../lib/seo";
import { T, type Lang } from "../lib/i18n";
import type { SessionUser } from "../lib/site";

declare global { interface Window { google?: any } }

// Shown only when this is set in shopnest-web/.env.local (NEXT_PUBLIC_GOOGLE_CLIENT_ID).
const GOOGLE_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

let gsiPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google && window.google.accounts && window.google.accounts.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { gsiPromise = null; reject(new Error("Google script blocked")); };
    document.head.appendChild(s);
  });
  return gsiPromise;
}
let gsiInited = false;
let gsiHandler: (credential: string) => void = () => {};

type Mode = "login" | "signup";
type Role = "BUYER" | "SELLER";

const Icon = ({ d, extra }: { d: string; extra?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} />{extra ? <path d={extra} /> : null}</svg>
);

export default function AuthModal({ open, onClose, lang, theme = "light", initialMode = "login", initialRole = "BUYER", onAuthed }: { open: boolean; onClose: () => void; lang: Lang; theme?: "light" | "dark"; initialMode?: Mode; initialRole?: Role; onAuthed?: (u: SessionUser) => void }) {
  const d = T[lang];
  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [gState, setGState] = useState<"off" | "loading" | "ready" | "failed">(GOOGLE_ID ? "loading" : "off");
  const gBox = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setMode(initialMode); setRole(initialRole); setErr(""); } }, [open, initialMode, initialRole]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => first.current && first.current.focus(), 80);
    return () => { document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open, onClose]);

  const finish = (data: any) => {
    localStorage.setItem("shopnest_token", data.access_token);
    localStorage.setItem("shopnest_user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("shopnest-auth"));
    if (data.user.role === "SELLER") { window.location.href = "/seller/dashboard"; return; }
    if (data.user.role === "ADMIN") { window.location.href = "/admin"; return; }
    onAuthed && onAuthed(data.user);
    onClose();
  };

  const post = async (path: string, body: object) => {
    setBusy(true); setErr("");
    try {
      const res = await fetch(API_URL + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      let data: any = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok) {
        const m = data && data.message;
        throw new Error(Array.isArray(m) ? m.join(", ") : typeof m === "string" ? m : d.authFail);
      }
      finish(data);
    } catch (e: any) {
      setErr(e && e.message ? (e.message === "Failed to fetch" ? d.networkError : e.message) : d.authFail);
    }
    setBusy(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (mode === "login") post("/auth/login", { email: email.trim(), password });
    else post("/auth/register", { email: email.trim(), password, name: name.trim(), role });
  };

  // Keep the Google callback pointing at the latest choices (buyer or seller).
  gsiHandler = (credential: string) => { post("/auth/google", mode === "signup" ? { credential, role } : { credential }); };

  useEffect(() => {
    if (!open || !GOOGLE_ID) return undefined;
    let dead = false;
    setGState("loading");
    loadGsi().then(() => {
      if (dead || !window.google || !gBox.current) return;
      if (!gsiInited) {
        window.google.accounts.id.initialize({ client_id: GOOGLE_ID, callback: (r: any) => { if (r && r.credential) gsiHandler(r.credential); }, ux_mode: "popup" });
        gsiInited = true;
      }
      gBox.current.innerHTML = "";
      window.google.accounts.id.renderButton(gBox.current, { type: "standard", theme: "outline", size: "large", shape: "pill", text: mode === "login" ? "signin_with" : "signup_with", logo_alignment: "left", width: 340 });
      setGState("ready");
    }).catch(() => { if (!dead) setGState("failed"); });
    return () => { dead = true; };
  }, [open, mode]);

  return (
    <div className={"sn-auth-overlay" + (open ? " open" : "")} data-theme={theme} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-hidden={!open}>
      <div className="sn-auth-card" role="dialog" aria-modal="true" aria-label={mode === "login" ? d.welcomeBack : d.joinTitle}>
        <button type="button" className="sn-auth-close" onClick={onClose} aria-label={d.close}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="sn-auth-mark" aria-hidden="true">S</div>
        <h2 className="sn-auth-title">{mode === "login" ? d.welcomeBack : d.joinTitle}</h2>
        <p className="sn-auth-sub">{mode === "login" ? d.loginDesc : d.joinDesc}</p>

        {err && <div className="sn-auth-err" role="alert">{err}</div>}

        {mode === "signup" && (
          <div className="sn-auth-seg" role="tablist">
            <button type="button" role="tab" aria-selected={role === "BUYER"} className={role === "BUYER" ? "on" : ""} onClick={() => setRole("BUYER")}>{d.buyer}</button>
            <button type="button" role="tab" aria-selected={role === "SELLER"} className={role === "SELLER" ? "on" : ""} onClick={() => setRole("SELLER")}>{d.seller}</button>
          </div>
        )}

        {GOOGLE_ID && gState !== "failed" && (
          <div className="sn-auth-google" style={{ minHeight: 44 }}>
            <div ref={gBox} />
          </div>
        )}
        {GOOGLE_ID && <div className="sn-auth-or"><span>{d.orEmail}</span></div>}

        <form onSubmit={submit} noValidate={false}>
          {mode === "signup" && (
            <label className="sn-auth-field">
              <span className="sn-auth-ico"><Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" extra="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></span>
              <input ref={first} type="text" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder={d.fullName} aria-label={d.fullName} autoComplete="name" />
            </label>
          )}
          <label className="sn-auth-field">
            <span className="sn-auth-ico"><Icon d="M4 6h16v12H4z" extra="M4 7l8 6 8-6" /></span>
            <input ref={mode === "login" ? first : undefined} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={d.email} aria-label={d.email} autoComplete="email" />
          </label>
          <label className="sn-auth-field">
            <span className="sn-auth-ico"><Icon d="M6 11V8a6 6 0 0 1 12 0v3" extra="M5 11h14v10H5z" /></span>
            <input type={show ? "text" : "password"} required minLength={mode === "signup" ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? d.password + " (" + d.pwHint + ")" : d.password} aria-label={d.password} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            <button type="button" className="sn-auth-eye" onClick={() => setShow(!show)} aria-label={show ? d.hidePw : d.showPw}>
              {show ? <Icon d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" /> : <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" extra="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />}
            </button>
          </label>
          <button type="submit" className="sn-auth-submit" disabled={busy}>
            <span>{busy ? d.working : mode === "login" ? d.signInBtn : d.createBtn}</span>
            <span className="sn-auth-arrow" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </button>
        </form>

        <p className="sn-auth-switch">
          {mode === "login" ? d.noAccount : d.haveAccount}{" "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>{mode === "login" ? d.signUp : d.signIn}</button>
        </p>
      </div>
    </div>
  );
}
