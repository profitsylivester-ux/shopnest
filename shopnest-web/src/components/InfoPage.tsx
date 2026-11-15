"use client";
import Link from "next/link";
import { Fragment } from "react";
import { useLang } from "../lib/i18n";
import SiteShell from "./SiteShell";

export type PageData = { slug: string; titleEn: string; titleSw: string | null; bodyEn: string; bodySw: string | null; updatedAt: string };

// Page text is plain text: "## " starts a heading, "### " a smaller heading, "- " a bullet, and a blank line ends a paragraph.
// Nothing is ever inserted as HTML, so admin text cannot inject markup.
function RichText({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let para: string[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (para.length) { out.push(<p key={out.length}>{para.map((l, j) => <Fragment key={j}>{j > 0 ? <br /> : null}{l}</Fragment>)}</p>); para = []; }
    if (bullets.length) { out.push(<ul key={out.length}>{bullets.map((l, j) => <li key={j}>{l}</li>)}</ul>); bullets = []; }
  };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    if (l.startsWith("### ")) { flush(); out.push(<h3 key={out.length}>{l.slice(4)}</h3>); continue; }
    if (l.startsWith("## ")) { flush(); out.push(<h2 key={out.length}>{l.slice(3)}</h2>); continue; }
    if (l.startsWith("- ")) { if (para.length) flush(); bullets.push(l.slice(2)); continue; }
    if (bullets.length) flush();
    para.push(l);
  }
  flush();
  return <>{out}</>;
}

export default function InfoPage({ page }: { page: PageData }) {
  const [lang] = useLang();
  const title = lang === "SW" && page.titleSw ? page.titleSw : page.titleEn;
  const body = lang === "SW" && page.bodySw ? page.bodySw : page.bodyEn;
  const updated = new Date(page.updatedAt);
  return (
    <SiteShell>
      <div className="sn-wrap sn-info">
        <nav className="sn-crumbs" aria-label="Breadcrumb"><Link href="/">ShopNest</Link><span>/</span><span>{title}</span></nav>
        <article className="sn-info-card">
          <h1>{title}</h1>
          {!isNaN(updated.getTime()) && <p className="sn-info-date">{lang === "SW" ? "Imesasishwa" : "Last updated"}: {updated.toLocaleDateString(lang === "SW" ? "sw-TZ" : "en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>}
          <div className="sn-info-body"><RichText text={body} /></div>
        </article>
      </div>
    </SiteShell>
  );
}

const SOON: Record<string, { en: string; sw: string }> = {
  faq: { en: "FAQs", sw: "Maswali" },
  about: { en: "About us", sw: "Kuhusu sisi" },
  privacy: { en: "Privacy policy", sw: "Sera ya faragha" },
  terms: { en: "Terms of use", sw: "Masharti ya matumizi" },
  support: { en: "Support", sw: "Msaada" },
};

// Shown instead of "not found" while one of the standard pages is still a draft.
export function ComingSoon({ slug }: { slug: string }) {
  const [lang] = useLang();
  const t = SOON[slug] || { en: "This page", sw: "Ukurasa huu" };
  const title = lang === "SW" ? t.sw : t.en;
  return (
    <SiteShell>
      <div className="sn-wrap sn-info">
        <nav className="sn-crumbs" aria-label="Breadcrumb"><Link href="/">ShopNest</Link><span>/</span><span>{title}</span></nav>
        <article className="sn-info-card sn-soon">
          <h1>{title}</h1>
          <p>{lang === "SW" ? "Ukurasa huu unaandaliwa na utachapishwa hivi karibuni. Tafadhali rudi baadaye." : "This page is being prepared and will be published soon. Please check back later."}</p>
          <div className="sn-soon-actions">
            <Link href="/" className="sn-btn sn-btn-dark">{lang === "SW" ? "Rudi mwanzo" : "Back to home"}</Link>
            <Link href="/marketplace" className="sn-btn sn-btn-line">{lang === "SW" ? "Tazama soko" : "Browse the marketplace"}</Link>
          </div>
        </article>
      </div>
    </SiteShell>
  );
}
