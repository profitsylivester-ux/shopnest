"use client";
import { useEffect, useState } from "react";
import { api, MUTED } from "./shared";
import ProfileCard from "./ProfileCard";
import ShopLinkCard from "./ShopLinkCard";
import VacationCard from "./VacationCard";
import StorefrontCard from "./StorefrontCard";
import AccountCard from "./AccountCard";
import PasswordCard from "./PasswordCard";
import SignInsCard from "./SignInsCard";

const GROUPS = [["shop", "Shop"], ["storefront", "Storefront"], ["security", "Security"]];

export default function SettingsTab({ onOpenActivity, onChanged }: { onOpenActivity: () => void; onChanged?: () => void }) {
  const [store, setStore] = useState<any>(null);
  const [error, setError] = useState("");
  const [group, setGroup] = useState("shop");
  const saved = (s: any) => { setStore(s); if (onChanged) onChanged(); };
  useEffect(() => {
    api("GET", "/stores/me").then((r) => {
      if (r.ok) setStore(r.data); else setError(r.status === 404 ? "You have no shop yet." : r.error);
    });
  }, []);
  const wait = group !== "security" && !store;
  return (
    <div style={{ maxWidth: "820px" }}>
      <h2 style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.8rem", color: "var(--cream)", margin: 0 }}>Shop settings</h2>
      <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.3rem 0 1.2rem 0" }}>Run your shop and keep your account safe. Each section saves on its own.</p>
      <div role="group" aria-label="Settings sections" style={{ display: "inline-flex", gap: "0.3rem", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: "10px", border: "1px solid rgba(185,130,90,0.15)", marginBottom: "1.5rem" }}>
        {GROUPS.map((g) => (
          <button key={g[0]} onClick={() => setGroup(g[0])} aria-pressed={group === g[0]} style={{ background: group === g[0] ? "var(--latte)" : "transparent", color: group === g[0] ? "var(--espresso)" : "var(--latte)", border: "none", borderRadius: "7px", padding: "0.5rem 1.1rem", fontSize: "0.85rem", cursor: "pointer", fontFamily: "Jost, sans-serif", fontWeight: group === g[0] ? 600 : 400 }}>{g[1]}</button>
        ))}
      </div>
      {wait && <p style={{ color: error ? "#ff5f56" : MUTED, fontSize: "0.9rem" }}>{error || "Loading your shop..."}</p>}
      {group === "shop" && store && (<><ProfileCard store={store} onSaved={saved} /><ShopLinkCard store={store} onSaved={saved} /><VacationCard store={store} onSaved={saved} /></>)}
      {group === "storefront" && store && <StorefrontCard store={store} onSaved={saved} />}
      {group === "security" && (<><AccountCard onChanged={onChanged} /><PasswordCard /><SignInsCard onOpenActivity={onOpenActivity} /></>)}
    </div>
  );
}
