"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { T, useLang, type Lang } from "../lib/i18n";
import { useTheme, type Theme } from "../lib/theme";
import { readUser, useMenu, type SessionUser } from "../lib/site";
import AuthModal from "./AuthModal";
import AccountMenu from "./AccountMenu";
import NavMenu from "./NavMenu";

type AuthState = { open: boolean; mode: "login" | "signup"; role: "BUYER" | "SELLER" };

function Header({ lang, setLang, theme, toggleTheme, openAuth }: { lang: Lang; setLang: (l: Lang) => void; theme: Theme; toggleTheme: () => void; openAuth: (mode: "login" | "signup", role: "BUYER" | "SELLER") => void }) {
  const d = T[lang];
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const sync = () => setUser(readUser());
    sync();
    window.addEventListener("shopnest-auth", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("shopnest-auth", sync); window.removeEventListener("storage", sync); };
  }, []);
  // The admin page is never advertised to visitors: an admin signs in through the same card and is taken there.
  return (
    <header className="sn-header" data-open={menuOpen ? "1" : "0"}>
      <div className="sn-header-in">
        <Link href="/" className="sn-logo" aria-label="ShopNest"><span className="sn-logo-mark">S</span><span className="sn-logo-text">ShopNest</span></Link>
        <button type="button" className="sn-burger" aria-label={d.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        <div className="sn-header-panel">
          <NavMenu tone="light" lang={lang} onSell={() => { setMenuOpen(false); openAuth("signup", "SELLER"); }} />
          <div className="sn-header-actions">
            <button type="button" className="sn-pill sn-theme" onClick={toggleTheme} aria-label={theme === "dark" ? d.lightMode : d.darkMode} title={theme === "dark" ? d.lightMode : d.darkMode}>
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
            <button type="button" className="sn-pill" onClick={() => setLang(lang === "EN" ? "SW" : "EN")} aria-label="Language">{lang === "EN" ? "SW" : "EN"}</button>
            {user ? (
              <AccountMenu user={user} lang={lang} theme={theme} onSignedOut={() => setUser(null)} />
            ) : (
              <>
                <button type="button" className="sn-btn sn-btn-line sn-signin" onClick={() => openAuth("login", "BUYER")}>{d.signIn}</button>
                <button type="button" className="sn-btn sn-btn-dark" onClick={() => openAuth("signup", "BUYER")}>{d.signUp}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer({ lang, openAuth }: { lang: Lang; openAuth: (mode: "login" | "signup", role: "BUYER" | "SELLER") => void }) {
  const d = T[lang];
  const menu = useMenu();
  type L = { label: string; href: string; sell?: boolean };
  const adminCols = menu && menu.footer.length > 0
    ? (() => {
        const lab = (m: { labelEn: string; labelSw: string | null }) => (lang === "SW" && m.labelSw ? m.labelSw : m.labelEn);
        const cols: { title: string; links: L[] }[] = [];
        const loose: L[] = [];
        for (const it of menu.footer) {
          if (it.children.length > 0) cols.push({ title: lab(it), links: it.children.map((c) => ({ label: lab(c), href: c.href })) });
          else loose.push({ label: lab(it), href: it.href });
        }
        if (loose.length) cols.push({ title: "ShopNest", links: loose });
        return cols;
      })()
    : null;
  const cols = adminCols || [
    { title: d.footShop, links: [{ label: d.marketplace, href: "/marketplace" }, { label: d.newArrivals, href: "/marketplace?sort=newest" }, { label: d.allShops, href: "/shops" }] },
    { title: d.footSell, links: [{ label: d.openShop, href: "#sell", sell: true }, { label: d.sellerDash, href: "/seller/dashboard" }] },
    { title: d.footHelp, links: [{ label: d.support, href: "/support" }, { label: d.faqs, href: "/faq" }, { label: d.about, href: "/about" }] },
    { title: d.footLegal, links: [{ label: d.privacy, href: "/privacy" }, { label: d.terms, href: "/terms" }] },
  ];
  return (
    <footer className="sn-footer">
      <div className="sn-footer-in">
        <div className="sn-footer-brand">
          <Link href="/" className="sn-logo sn-logo-dark"><span className="sn-logo-mark">S</span><span className="sn-logo-text">ShopNest</span></Link>
          <p>{d.footTag}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="sn-footer-col">
            <h4>{c.title}</h4>
            <ul>
              {c.links.map((l) => (
                <li key={l.label + l.href}>
                  {l.sell || l.href === "#sell"
                    ? <a href="#sell" onClick={(e) => { e.preventDefault(); openAuth("signup", "SELLER"); }}>{l.label}</a>
                    : /^https?:\/\//.test(l.href) ? <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a> : <Link href={l.href}>{l.label}</Link>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="sn-footer-bottom"><span>{d.rights}</span></div>
    </footer>
  );
}

// The shared frame for the light pages: header with dropdown menus, the login card, and the footer.
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useLang();
  const [theme, toggleTheme] = useTheme();
  const [auth, setAuth] = useState<AuthState>({ open: false, mode: "login", role: "BUYER" });
  const openAuth = useCallback((mode: "login" | "signup", role: "BUYER" | "SELLER") => setAuth({ open: true, mode, role }), []);
  const closeAuth = useCallback(() => setAuth((a) => ({ ...a, open: false })), []);
  return (
    <div className="sn-page" data-theme={theme}>
      <Header lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} openAuth={openAuth} />
      <div className="sn-main">{children}</div>
      <Footer lang={lang} openAuth={openAuth} />
      <AuthModal open={auth.open} onClose={closeAuth} lang={lang} theme={theme} initialMode={auth.mode} initialRole={auth.role} />
    </div>
  );
}
