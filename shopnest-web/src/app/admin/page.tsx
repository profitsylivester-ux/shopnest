"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActivityPanel from "./ActivityPanel";
import BannersTab from "./BannersTab";
import CategoriesTab from "./CategoriesTab";
import MenuTab from "./MenuTab";
import OverviewTab from "./OverviewTab";
import PagesTab from "./PagesTab";
import ReviewsTab from "./ReviewsTab";
import ProductsTab from "./ProductsTab";
import SettingsTab from "./SettingsTab";
import ShopsTab from "./ShopsTab";
import UsersTab from "./UsersTab";
import { api, C, PageTitle } from "./ui";

const GROUPS: { title: string; items: { id: string; label: string; icon: string }[] }[] = [
  { title: "Overview", items: [{ id: "Overview", label: "Overview", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" }] },
  {
    title: "Marketplace",
    items: [
      { id: "Shops", label: "Shops", icon: "M3 9l1-5h16l1 5M5 9v11h14V9M9 20v-6h6v6" },
      { id: "Users", label: "Users", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
      { id: "Reviews", label: "Reviews", icon: "M12 2l3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9l1.3-6.9-5-4.8 6.9-.9z" },
      { id: "Products", label: "Products", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
    ],
  },
  {
    title: "Website content",
    items: [
      { id: "Homepage", label: "Homepage", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
      { id: "Categories", label: "Categories", icon: "M4 6h16M4 12h16M4 18h10" },
      { id: "Banners", label: "Banners", icon: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" },
      { id: "Menu", label: "Menu", icon: "M3 6h18M3 12h18M3 18h18" },
      { id: "Pages", label: "Pages", icon: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h8" },
    ],
  },
  { title: "System", items: [{ id: "MyActivity", label: "My admin activity", icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" }] },
];

function tokenUserId(): string {
  try {
    const t = localStorage.getItem("shopnest_token") || "";
    const p = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return String(p?.sub || "");
  } catch {
    return "";
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");
  const [denied, setDenied] = useState("");
  const [tab, setTab] = useState("Overview");
  const [preset, setPreset] = useState<{ status?: string }>({});
  const [selfId, setSelfId] = useState("");

  useEffect(() => {
    let token: string | null = null;
    try { token = localStorage.getItem("shopnest_token"); } catch { /* ignore */ }
    if (!token) { router.push("/"); return; }
    setSelfId(tokenUserId());
    api("/admin/users?limit=1").then((r) => {
      if (r.ok) setState("ok");
      else { setDenied(r.status === 403 ? "Access denied. This area is for administrators only." : r.error); setState("denied"); }
    });
  }, [router]);

  const go = (t: string, p?: { status?: string }) => { setPreset(p || {}); setTab(t); };
  const logout = () => { try { localStorage.removeItem("shopnest_token"); localStorage.removeItem("shopnest_user"); } catch { /* ignore */ } router.push("/"); };

  if (state === "checking") return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--cream)", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>Loading...</div>;
  if (state === "denied") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--cream)", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif", textAlign: "center", padding: "2rem" }}>
        <div>
          <p style={{ color: C.bad, marginBottom: "1rem" }}>{denied}</p>
          <Link href="/" style={{ color: "var(--latte)" }}>Return home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#110a06", fontFamily: "Jost, sans-serif", color: "var(--cream)" }}>
      <aside style={{ width: "250px", flexShrink: 0, borderRight: "1px solid rgba(185,130,90,0.1)", padding: "2rem 1rem", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 1rem", marginBottom: "2rem" }}>
          <div style={{ width: "30px", height: "30px", background: "var(--latte)", color: "var(--espresso)", display: "grid", placeItems: "center", borderRadius: "8px", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: "bold" }}>S</div>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "var(--cream)", margin: 0 }}>ShopNest Admin</h2>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title} style={{ marginBottom: "1.2rem" }}>
            <div style={{ padding: "0 1rem", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--copper)", marginBottom: "0.5rem" }}>{g.title}</div>
            {g.items.map((it) => {
              const on = tab === it.id;
              return (
                <button key={it.id} onClick={() => go(it.id)} aria-current={on ? "page" : undefined} style={{ width: "100%", textAlign: "left", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "Jost, sans-serif", background: on ? "rgba(185,130,90,0.15)" : "transparent", color: on ? "var(--latte)" : "rgba(243,227,208,0.7)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon}></path></svg>
                  <span style={{ fontSize: "0.9rem", fontWeight: on ? 600 : 400 }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        ))}
        <button onClick={logout} style={{ marginTop: "auto", background: "transparent", border: "1px solid rgba(185,130,90,0.3)", color: "var(--latte)", padding: "0.8rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Jost, sans-serif" }}>Sign Out</button>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "2.5rem 3rem" }}>
        {tab === "Overview" && <OverviewTab go={go} />}
        {tab === "Shops" && <ShopsTab key={preset.status || "all"} initialStatus={preset.status} />}
        {tab === "Users" && <UsersTab selfId={selfId} />}
        {tab === "Reviews" && <ReviewsTab />}
        {tab === "Products" && <ProductsTab />}
        {tab === "Homepage" && <SettingsTab />}
        {tab === "Categories" && <CategoriesTab />}
        {tab === "Banners" && <BannersTab />}
        {tab === "Menu" && <MenuTab />}
        {tab === "Pages" && <PagesTab />}
        {tab === "MyActivity" && (
          <>
            <PageTitle title="My admin activity" sub="Every change you make to settings and website content is recorded here." />
            {selfId ? <ActivityPanel userId={selfId} title="Your activity" /> : <p style={{ color: C.muted }}>Could not read your account. Sign in again.</p>}
          </>
        )}
      </main>
    </div>
  );
}
