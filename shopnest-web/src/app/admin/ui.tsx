"use client";
import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../lib/seo";

export const C = {
  cream: "var(--cream)",
  latte: "var(--latte)",
  copper: "var(--copper)",
  muted: "rgba(243,227,208,0.55)",
  line: "rgba(185,130,90,0.15)",
  panel: "#1a0f0a",
  ok: "#7bd88f",
  bad: "#ff7b72",
  warn: "#e9c46a",
};

export type ApiResult = { ok: boolean; status: number; data: any; error: string };

// One place that talks to the API with the admin's token. Never throws.
export async function api(path: string, opts?: { method?: string; data?: unknown }): Promise<ApiResult> {
  let token: string | null = null;
  try { token = localStorage.getItem("shopnest_token"); } catch { /* ignore */ }
  if (!token) return { ok: false, status: 401, data: null, error: "You are signed out. Please sign in again." };
  try {
    const res = await fetch(API_URL + path, {
      method: opts?.method || "GET",
      headers: { Authorization: "Bearer " + token, ...(opts?.data !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: opts?.data !== undefined ? JSON.stringify(opts.data) : undefined,
    });
    let data: any = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (res.ok) return { ok: true, status: res.status, data, error: "" };
    const m = data && data.message;
    const msg = Array.isArray(m) ? m.join(", ") : typeof m === "string" ? m : "Something went wrong (" + res.status + ").";
    return { ok: false, status: res.status, data, error: res.status === 401 ? "Your session ended. Please sign in again." : res.status === 403 ? "You do not have access to this." : msg };
  } catch {
    return { ok: false, status: 0, data: null, error: "Could not reach the server. Check that the backend is running." };
  }
}

export function fmtDate(v: string | Date | null | undefined) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(v: string | Date | null | undefined) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export type NoticeState = { kind: "ok" | "error"; text: string } | null;

export function useNotice(): [NoticeState, (kind: "ok" | "error", text: string) => void, () => void, () => void] {
  const [n, setN] = useState<NoticeState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timer.current) clearTimeout(timer.current); setN(null); };
  // used after a successful reload: removes an old error but keeps a success message the admin has not read yet
  const clearError = () => setN((cur) => (cur && cur.kind === "error" ? null : cur));
  const show = (kind: "ok" | "error", text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setN({ kind, text });
    if (kind === "ok") timer.current = setTimeout(() => setN(null), 5000);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return [n, show, clear, clearError];
}

export function Notice({ n, onClose }: { n: NoticeState; onClose?: () => void }) {
  if (!n) return null;
  const good = n.kind === "ok";
  return (
    <div role={good ? "status" : "alert"} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", margin: "0 0 1.2rem 0", padding: "0.8rem 1rem", borderRadius: "10px", fontSize: "0.9rem", background: good ? "rgba(123,216,143,0.1)" : "rgba(255,123,114,0.1)", border: "1px solid " + (good ? "rgba(123,216,143,0.4)" : "rgba(255,123,114,0.4)"), color: good ? C.ok : C.bad }}>
      <span>{n.text}</span>
      {onClose && <button onClick={onClose} aria-label="Dismiss" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}>x</button>}
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
      <div>
        <h1 style={{ fontSize: "2.2rem", fontFamily: "Playfair Display, serif", margin: 0, fontStyle: "italic" }}>{title}</h1>
        {sub && <p style={{ color: C.muted, marginTop: "0.4rem", fontSize: "0.9rem", maxWidth: "640px" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.panel, border: "1px solid " + C.line, borderRadius: "14px", padding: "1.4rem", ...style }}>{children}</div>;
}

export function SectionNote({ children }: { children: React.ReactNode }) {
  return <div style={{ margin: "0 0 1.5rem 0", padding: "0.8rem 1rem", borderRadius: "10px", fontSize: "0.85rem", color: C.warn, background: "rgba(233,196,106,0.07)", border: "1px solid rgba(233,196,106,0.3)" }}>{children}</div>;
}

export const inputStyle: React.CSSProperties = { width: "100%", padding: "0.7rem 0.9rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(185,130,90,0.3)", borderRadius: "8px", color: "var(--cream)", fontFamily: "Jost, sans-serif", fontSize: "0.9rem", outline: "none" };
export const optionStyle: React.CSSProperties = { background: "#1a0f0a", color: "#f3e3d0" };
export const th: React.CSSProperties = { textAlign: "left", padding: "0.8rem 1rem", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--copper)", borderBottom: "1px solid " + C.line, whiteSpace: "nowrap" };
export const td: React.CSSProperties = { padding: "0.9rem 1rem", fontSize: "0.88rem", borderBottom: "1px solid rgba(185,130,90,0.08)", verticalAlign: "middle" };

export function Field({ label, hint, children, style }: { label: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: "block", ...style }}>
      <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: "0.4rem" }}>{label}</span>
      {children}
      {hint && <span style={{ display: "block", fontSize: "0.78rem", color: C.muted, marginTop: "0.35rem" }}>{hint}</span>}
    </label>
  );
}

type BtnKind = "primary" | "ghost" | "danger";
export function Btn({ kind = "ghost", small, disabled, onClick, children, type, title }: { kind?: BtnKind; small?: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode; type?: "button" | "submit"; title?: string }) {
  const base: React.CSSProperties = { padding: small ? "0.4rem 0.8rem" : "0.65rem 1.3rem", fontSize: small ? "0.78rem" : "0.88rem", borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Jost, sans-serif", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap" };
  const look: React.CSSProperties = kind === "primary" ? { background: "var(--latte)", color: "#1a0f0a", border: "none", fontWeight: 600 } : kind === "danger" ? { background: "transparent", color: C.bad, border: "1px solid rgba(255,123,114,0.5)" } : { background: "transparent", color: "var(--latte)", border: "1px solid rgba(185,130,90,0.4)" };
  return <button type={type || "button"} title={title} disabled={disabled} onClick={onClick} style={{ ...base, ...look }}>{children}</button>;
}

// Two-step button: first click asks, second click does it.
export function ConfirmBtn({ label, confirmLabel, kind = "ghost", small = true, disabled, onConfirm }: { label: string; confirmLabel?: string; kind?: BtnKind; small?: boolean; disabled?: boolean; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  if (!armed) return <Btn kind={kind} small={small} disabled={disabled} onClick={() => setArmed(true)}>{label}</Btn>;
  return <Btn kind="danger" small={small} onClick={() => { setArmed(false); onConfirm(); }}>{confirmLabel || "Confirm?"}</Btn>;
}

export function Pill({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  const col = tone === "ok" ? C.ok : tone === "warn" ? C.warn : tone === "bad" ? C.bad : C.muted;
  return <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", letterSpacing: "0.04em", color: col, border: "1px solid " + col, whiteSpace: "nowrap" }}>{children}</span>;
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ width: "44px", height: "24px", borderRadius: "999px", border: "none", cursor: "pointer", background: on ? "var(--latte)" : "rgba(255,255,255,0.15)", position: "relative", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: "3px", left: on ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: on ? "#1a0f0a" : "#f3e3d0", transition: "left 0.2s" }} />
    </button>
  );
}

export function Pager({ total, skip, limit, onChange }: { total: number; skip: number; limit: number; onChange: (skip: number) => void }) {
  if (total <= limit) return null;
  const from = skip + 1;
  const to = Math.min(skip + limit, total);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", color: C.muted, fontSize: "0.85rem" }}>
      <span>{from}-{to} of {total}</span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Btn small disabled={skip === 0} onClick={() => onChange(Math.max(0, skip - limit))}>Previous</Btn>
        <Btn small disabled={skip + limit >= total} onClick={() => onChange(skip + limit)}>Next</Btn>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: C.muted, fontSize: "0.9rem" }}>{children}</div>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>{children}</table></div>;
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, maxWidth: "320px" }} />;
}

export function Select({ value, onChange, children, label }: { value: string; onChange: (v: string) => void; children: React.ReactNode; label: string }) {
  return <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>{children}</select>;
}
