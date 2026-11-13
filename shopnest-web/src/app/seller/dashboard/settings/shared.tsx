"use client";
import { API_URL } from "../../../../lib/seo";

export const MUTED = "rgba(243,227,208,0.5)";
const FONT = "Jost, sans-serif";
export const card: React.CSSProperties = { background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)", marginBottom: "1.2rem" };
export const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(185,130,90,0.3)", borderRadius: "8px", padding: "0.7rem 0.9rem", color: "var(--cream)", fontSize: "0.9rem", fontFamily: FONT, outline: "none" };
export const lbl: React.CSSProperties = { display: "block", color: "var(--latte)", fontSize: "0.78rem", letterSpacing: "0.04em", marginBottom: "0.35rem" };
export const primary: React.CSSProperties = { background: "var(--latte)", color: "var(--espresso)", border: "none", borderRadius: "8px", padding: "0.65rem 1.3rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: FONT };
export const ghost: React.CSSProperties = { background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", borderRadius: "8px", padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer", fontFamily: FONT };
export type Note = { ok: boolean; text: string } | null;
export type Result = { ok: boolean; status: number; data: any; error: string };

export async function api(method: string, path: string, body?: unknown): Promise<Result> {
  const token = localStorage.getItem("shopnest_token");
  try {
    const res = await fetch(API_URL + path, { method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + (token || "") }, body: body === undefined ? undefined : JSON.stringify(body) });
    let data: any = null;
    try { data = await res.json(); } catch { data = null; }
    if (res.ok) return { ok: true, status: res.status, data, error: "" };
    const m = data && data.message;
    const error = res.status === 401 ? "Your session ended. Please sign in again." : res.status === 429 ? "Too many tries. Wait a minute and try again." : Array.isArray(m) ? m.join(". ") : typeof m === "string" ? m : "Something went wrong.";
    return { ok: false, status: res.status, data, error };
  } catch {
    return { ok: false, status: 0, data: null, error: "Could not reach the server. Is the backend running?" };
  }
}

export function saveSession(data: any) {
  if (!data || !data.access_token) return;
  localStorage.setItem("shopnest_token", data.access_token);
  if (data.user) localStorage.setItem("shopnest_user", JSON.stringify(data.user));
}

export function pickImage(file: File, done: (url: string) => void, fail: () => void) {
  if (!file.type.startsWith("image/")) { fail(); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1280 / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * s);
      cv.height = Math.round(img.height * s);
      const ctx = cv.getContext("2d");
      if (!ctx) { fail(); return; }
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      done(cv.toDataURL("image/webp", 0.82));
    };
    img.onerror = fail;
    img.src = String(reader.result);
  };
  reader.onerror = fail;
  reader.readAsDataURL(file);
}

export function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h3 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.35rem", color: "var(--cream)", margin: 0 }}>{title}</h3>
      {hint ? <p style={{ color: MUTED, fontSize: "0.82rem", margin: "0.3rem 0 1.2rem 0", lineHeight: 1.5 }}>{hint}</p> : <div style={{ height: "1rem" }} />}
      {children}
    </section>
  );
}
export function Msg({ m }: { m: Note }) {
  if (!m) return null;
  return <p role="status" style={{ color: m.ok ? "#27c93f" : "#ff5f56", fontSize: "0.82rem", margin: "0.8rem 0 0 0", lineHeight: 1.4 }}>{m.text}</p>;
}
export function Field({ name, children }: { name: string; children: React.ReactNode }) {
  return <label style={{ display: "block", marginBottom: "1rem" }}><span style={lbl}>{name}</span>{children}</label>;
}

export function exactTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Dar_es_Salaam", weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
export function deviceName(ua: string | null) {
  if (!ua) return "Unknown device";
  const b = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /^node/i.test(ua) ? "Script" : "Browser";
  const o = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
  return o ? b + " on " + o : b;
}
export function placeName(ip: string | null) {
  if (!ip) return "Unknown IP";
  return ip === "::1" || ip === "127.0.0.1" ? "this computer (local)" : ip;
}
