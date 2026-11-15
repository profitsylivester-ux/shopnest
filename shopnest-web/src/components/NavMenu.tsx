"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { T, type Lang } from "../lib/i18n";
import { catLabel, useCategories, useMenu } from "../lib/site";

type Child = { label: string; href: string; action?: "sell" };
type Item = { key: string; label: string; href?: string; children?: Child[]; cats?: boolean };

export default function NavMenu({ tone, lang, onSell, onHome }: { tone: "light" | "dark"; lang: Lang; onSell: () => void; onHome?: () => void }) {
  const d = T[lang];
  const path = usePathname() || "/";
  const cats = useCategories();
  const menu = useMenu();
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLUListElement>(null);

  const adminItems = menu && menu.navbar.length > 0 ? menu.navbar : null;
  const items: Item[] = adminItems
    ? adminItems.map((m) => ({
        key: m.id,
        label: lang === "SW" && m.labelSw ? m.labelSw : m.labelEn,
        href: m.children.length === 0 || m.href !== "#" ? m.href : undefined,
        children: m.children.map((c) => ({ label: lang === "SW" && c.labelSw ? c.labelSw : c.labelEn, href: c.href })),
      }))
    : [
        { key: "home", label: d.home, href: "/" },
        { key: "market", label: d.marketplace, href: "/marketplace", cats: true, children: [{ label: d.allProducts, href: "/marketplace" }, { label: d.newArrivals, href: "/marketplace?sort=newest" }] },
        { key: "shops", label: d.shops, href: "/shops", children: [{ label: d.allShops, href: "/shops" }, { label: d.topRated, href: "/shops?top=1" }, { label: d.verified, href: "/shops?verified=1" }, { label: d.openShop, href: "#sell", action: "sell" }] },
        { key: "help", label: d.help, children: [{ label: d.support, href: "/support" }, { label: d.faqs, href: "/faq" }, { label: d.about, href: "/about" }] },
      ];

  const cancel = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const openNow = (k: string) => { cancel(); setOpen(k); };
  const closeSoon = () => { cancel(); timer.current = setTimeout(() => setOpen(null), 140); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    const onDoc = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDoc); };
  }, []);
  useEffect(() => { setOpen(null); }, [path]);
  useEffect(() => () => cancel(), []);

  const isActive = (it: Item) => {
    const hrefs = [it.href, ...(it.children || []).map((c) => c.href)].filter((h): h is string => !!h && h !== "#" && !h.startsWith("#"));
    return hrefs.some((h) => { const p = h.split("?")[0]; return p === "/" ? path === "/" : path === p || path.startsWith(p + "/"); });
  };

  const go = (e: React.MouseEvent, c: { href: string; action?: "sell" }) => {
    setOpen(null);
    if (c.action === "sell" || c.href === "#sell") { e.preventDefault(); onSell(); return; }
    if (c.href === "/" && onHome) { e.preventDefault(); onHome(); }
  };
  const linkProps = (c: { href: string; action?: "sell" }) => (/^https?:\/\//.test(c.href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

  return (
    <ul className={"sn-nav sn-nav-" + tone} ref={root}>
      {items.map((it) => {
        const hasMenu = !!(it.children && it.children.length > 0) || !!it.cats;
        const isOpen = open === it.key;
        return (
          <li key={it.key} className={"sn-nav-item" + (isOpen ? " is-open" : "")} onMouseEnter={() => hasMenu && openNow(it.key)} onMouseLeave={() => hasMenu && closeSoon()}>
            <div className="sn-nav-row">
              {it.href ? (
                <Link href={it.href} className={"sn-nav-link" + (isActive(it) ? " is-active" : "")} onClick={(e) => go(e, { href: it.href as string })} {...linkProps({ href: it.href })}>{it.label}</Link>
              ) : (
                <button type="button" className={"sn-nav-link" + (isActive(it) ? " is-active" : "")} aria-haspopup="true" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : it.key)}>{it.label}</button>
              )}
              {hasMenu && (
                <button type="button" className="sn-nav-caret" aria-label={it.label} aria-haspopup="true" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : it.key)}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l4 4 4-4" /></svg>
                </button>
              )}
            </div>
            {hasMenu && (
              <div className={"sn-dd" + (it.cats && cats.length > 0 ? " sn-dd-wide" : "")} role="menu" onMouseEnter={cancel}>
                <div className="sn-dd-col">
                  {(it.children || []).map((c) => (
                    <Link key={c.label + c.href} href={c.href} role="menuitem" className="sn-dd-link" onClick={(e) => go(e, c)} {...linkProps(c)}>{c.label}</Link>
                  ))}
                </div>
                {it.cats && cats.length > 0 && (
                  <div className="sn-dd-cats">
                    <div className="sn-dd-title">{d.categories}</div>
                    <div className="sn-dd-grid">
                      {cats.map((c) => (
                        <Link key={c.id} href={"/marketplace?category=" + encodeURIComponent(c.nameEn)} role="menuitem" className="sn-dd-link" onClick={() => setOpen(null)}>{catLabel(c, lang)}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
