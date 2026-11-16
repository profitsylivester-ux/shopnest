"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { T, type Lang } from "../lib/i18n";
import { signOutUser, type SessionUser } from "../lib/site";
import InstallApp from "./InstallApp";

// Signed-in account button. Opens a small card with the name, email, the shop dashboard (sellers) and Sign out.
export default function AccountMenu({ user, lang, theme, onSignedOut }: { user: SessionUser; lang: Lang; theme: "light" | "dark"; onSignedOut?: () => void }) {
  const d = T[lang];
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDoc = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, [open]);
  const first = (user.name || user.email || "?").trim().split(" ")[0];
  const initial = first.charAt(0).toUpperCase();
  const role = user.role === "SELLER" ? d.seller : user.role === "BUYER" ? d.buyer : "";
  const out = () => { setOpen(false); signOutUser(); onSignedOut && onSignedOut(); };
  return (
    <div className="sn-acct" data-theme={theme} ref={root}>
      <button type="button" className="sn-acct-btn" onClick={() => setOpen(!open)} aria-haspopup="true" aria-expanded={open}>
        <span className="sn-acct-av" aria-hidden="true">{initial}</span>
        <span className="sn-acct-name">{first}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 4l4 4 4-4" /></svg>
      </button>
      {open && (
        <div className="sn-acct-card" role="menu">
          <div className="sn-acct-top">
            <span className="sn-acct-av sn-acct-av-lg" aria-hidden="true">{initial}</span>
            <div className="sn-acct-who">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              {role && <em>{role}</em>}
            </div>
          </div>
          {user.role === "SELLER" && <Link href="/seller/dashboard" role="menuitem" className="sn-acct-row" onClick={() => setOpen(false)}>{d.dashboard}</Link>}
          <Link href="/account/password" role="menuitem" className="sn-acct-row" onClick={() => setOpen(false)}>{lang === "SW" ? "Badilisha nenosiri" : "Change password"}</Link>
          <InstallApp lang={lang} variant="row" />
          <button type="button" role="menuitem" className="sn-acct-row sn-acct-out" onClick={out}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
            {d.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
