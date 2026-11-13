"use client";
import MessagesTab from "./MessagesTab";
import ActivityLog from "./ActivityLog";

const TABS = [
  { key: "inquiries", label: "Inquiries" },
  { key: "activity", label: "Account activity" },
];

export default function MessagesAndAudit({ view, onView }: { view: string; onView: (v: string) => void }) {
  return (
    <div>
      <div role="group" aria-label="Messages and audit log" style={{ display: "inline-flex", gap: "0.3rem", background: "rgba(255,255,255,0.03)", padding: "0.3rem", borderRadius: "10px", border: "1px solid rgba(185,130,90,0.15)", marginBottom: "1.5rem" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => onView(t.key)} aria-pressed={view === t.key} style={{ background: view === t.key ? "var(--latte)" : "transparent", color: view === t.key ? "var(--espresso)" : "var(--latte)", border: "none", borderRadius: "7px", padding: "0.5rem 1.1rem", fontSize: "0.85rem", cursor: "pointer", fontFamily: "Jost, sans-serif", fontWeight: view === t.key ? 600 : 400 }}>{t.label}</button>
        ))}
      </div>
      {view === "activity" ? <ActivityLog /> : <MessagesTab />}
    </div>
  );
}
