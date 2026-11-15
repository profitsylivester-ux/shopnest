"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../lib/i18n";
import { useTheme, type Theme } from "../lib/theme";
import { SUPPORT_WA, START_IDS, UI, entryById, reply, type Link as GuideLink } from "../lib/assistant";

type Msg = { role: "user" | "bot"; text: string; links?: GuideLink[]; related?: string[]; help?: boolean };
const KEY = "shopnest_bot_v1";

// One line of an answer: **bold** pieces become <strong>, nothing else is treated as markup.
function inline(s: string, k: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={k + i}>{p.slice(2, -2)}</strong> : <span key={k + i}>{p}</span>));
}
function Rich({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      const first = parseInt(line, 10) || 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; }
      blocks.push(<ol key={"o" + i} start={first}>{items.map((t, j) => <li key={j}>{inline(t, "o" + i + j)}</li>)}</ol>);
    } else if (/^-\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s/.test(lines[i])) { items.push(lines[i].replace(/^-\s/, "")); i++; }
      blocks.push(<ul key={"u" + i}>{items.map((t, j) => <li key={j}>{inline(t, "u" + i + j)}</li>)}</ul>);
    } else if (line.trim() === "") {
      i++;
    } else {
      blocks.push(<p key={"p" + i}>{inline(line, "p" + i)}</p>);
      i++;
    }
  }
  return <>{blocks}</>;
}

export default function Assistant({ defaultTheme = "light", forceTheme }: { defaultTheme?: Theme; forceTheme?: Theme }) {
  const [lang] = useLang();
  const [t] = useTheme(defaultTheme);
  const theme = forceTheme || t;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [ready, setReady] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) { const v = JSON.parse(raw); if (Array.isArray(v)) setMsgs(v.slice(-40)); }
    } catch { /* storage blocked or damaged: start fresh */ }
    setReady(true);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch { /* storage blocked */ }
  }, [msgs, ready]);
  // A new answer scrolls to its first line (so a list of steps is read from step 1); your own message and the typing dots scroll to the end.
  useEffect(() => {
    const box = body.current;
    if (!open || !box) return;
    const last = msgs[msgs.length - 1];
    if (last && last.role === "bot" && !typing) {
      const items = box.querySelectorAll(".sn-bot-msg");
      const el = items[items.length - 1] as HTMLElement | undefined;
      if (el) { box.scrollTop = Math.max(0, el.offsetTop - 10); return; }
    }
    box.scrollTop = box.scrollHeight;
  }, [msgs, typing, open]);
  useEffect(() => { if (open && field.current) field.current.focus(); }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = useCallback((text: string) => {
    const q = text.trim().slice(0, 300);
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = reply(q, lang);
      setMsgs((m) => [...m, { role: "bot", text: r.text, links: r.links, related: r.related, help: r.kind === "none" || r.kind === "blocked" }]);
      setTyping(false);
    }, 350);
  }, [lang]);

  const chip = (id: string) => {
    const e = entryById(id);
    if (!e) return null;
    return <button type="button" key={id} className="sn-bot-chip" onClick={() => ask(e.q[lang])}>{e.q[lang]}</button>;
  };
  const lastBot = (() => { for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "bot") return i; return -1; })();
  const waHref = "https://wa.me/" + SUPPORT_WA + "?text=" + encodeURIComponent(lang === "SW" ? "Habari ShopNest, nahitaji msaada." : "Hello ShopNest, I need help.");

  return (
    <div className="sn-bot" data-theme={theme} data-open={open ? "1" : "0"}>
      {open && (
        <section className="sn-bot-panel" role="dialog" aria-label={UI.title[lang]}>
          <header className="sn-bot-head">
            <span className="sn-bot-mark" aria-hidden="true">S</span>
            <div className="sn-bot-title"><strong>{UI.title[lang]}</strong><span>{UI.sub[lang]}</span></div>
            {msgs.length > 0 && <button type="button" className="sn-bot-link" onClick={() => setMsgs([])}>{UI.clear[lang]}</button>}
            <button type="button" className="sn-bot-x" onClick={() => setOpen(false)} aria-label={UI.close[lang]}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </header>
          <div className="sn-bot-body" ref={body}>
            <div className="sn-bot-msg bot"><p>{UI.hello[lang]}</p></div>
            {msgs.length === 0 && <div className="sn-bot-chips">{START_IDS.map(chip)}</div>}
            {msgs.map((m, i) => (
              <div key={i} className={"sn-bot-msg " + m.role}>
                {m.role === "bot" ? <Rich text={m.text} /> : <p>{m.text}</p>}
                {m.role === "bot" && m.links && m.links.length > 0 && (
                  <div className="sn-bot-links">{m.links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label[lang]}</Link>)}</div>
                )}
                {m.role === "bot" && m.help && <a className="sn-bot-wa" href={waHref} target="_blank" rel="noopener noreferrer">{UI.whatsapp[lang]}</a>}
                {m.role === "bot" && i === lastBot && m.related && m.related.length > 0 && !typing && (
                  <div className="sn-bot-rel"><span>{UI.related[lang]}</span><div className="sn-bot-chips">{m.related.map(chip)}</div></div>
                )}
              </div>
            ))}
            {typing && <div className="sn-bot-msg bot sn-bot-typing" aria-label="..."><i /><i /><i /></div>}
          </div>
          <form className="sn-bot-form" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input ref={field} value={input} onChange={(e) => setInput(e.target.value)} placeholder={UI.placeholder[lang]} maxLength={300} aria-label={UI.placeholder[lang]} />
            <button type="submit" className="sn-bot-send" aria-label={UI.send[lang]} disabled={!input.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </form>
          <p className="sn-bot-note">{UI.note[lang]}</p>
        </section>
      )}
      {!open && (
        <button type="button" className="sn-bot-fab" onClick={() => setOpen(true)} aria-label={UI.title[lang]} title={UI.title[lang]}>
          <span className="sn-bot-tip">{UI.title[lang]}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" /></svg>
        </button>
      )}
    </div>
  );
}
