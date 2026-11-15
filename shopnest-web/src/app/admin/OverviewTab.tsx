"use client";
import { useCallback, useEffect, useState } from "react";
import TrendChart from "../seller/dashboard/TrendChart";
import { api, Btn, C, Empty, fmtDate, Notice, PageTitle, Panel, Select, useNotice } from "./ui";

type Totals = { shopViews: number; productViews: number; whatsappClicks: number };
const PERIODS = [
  { v: "day", l: "Last 24 hours" },
  { v: "week", l: "Last 7 days" },
  { v: "month", l: "Last 30 days" },
  { v: "year", l: "Last 12 months" },
  { v: "all", l: "All time" },
];

function Stat({ label, value, sub, delta }: { label: string; value: number; sub?: string; delta?: React.ReactNode }) {
  return (
    <Panel style={{ padding: "1.2rem 1.4rem" }}>
      <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.copper }}>{label}</div>
      <div style={{ fontSize: "2.2rem", fontFamily: "Cormorant Garamond, serif", margin: "0.3rem 0" }}>{value.toLocaleString()}</div>
      {sub && <div style={{ fontSize: "0.8rem", color: C.muted }}>{sub}</div>}
      {delta}
    </Panel>
  );
}

function Delta({ cur, prev }: { cur: number; prev: number | null }) {
  if (prev === null) return null;
  if (prev === 0) return <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: "0.3rem" }}>{cur === 0 ? "No activity in the previous period" : "Nothing to compare in the previous period"}</div>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: "0.3rem" }}>No change from the previous period</div>;
  return <div style={{ fontSize: "0.78rem", marginTop: "0.3rem", color: pct > 0 ? C.ok : C.bad }}>{pct > 0 ? "\u25B2 " : "\u25BC "}{Math.abs(pct)}% from the previous period</div>;
}

export default function OverviewTab({ go }: { go: (tab: string, preset?: { status?: string }) => void }) {
  const [period, setPeriod] = useState("month");
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notice, show, clear, clearError] = useNotice();

  const load = useCallback(async (p: string) => {
    setLoading(true);
    const r = await api("/admin/overview?period=" + p);
    setLoading(false);
    if (r.ok) { setD(r.data); clearError(); } else show("error", r.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(period); }, [period, load]);

  const prev: Totals | null = d?.previous ?? null;
  const period_l = PERIODS.find((p) => p.v === period)?.l.toLowerCase() || "";

  return (
    <>
      <PageTitle title="Overview" sub="Live numbers from your marketplace. Nothing here is estimated." right={
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Select label="Period" value={period} onChange={setPeriod}>{PERIODS.map((p) => <option key={p.v} value={p.v} style={{ background: "#1a0f0a", color: "#f3e3d0" }}>{p.l}</option>)}</Select>
          <Btn small onClick={() => load(period)}>Refresh</Btn>
        </div>
      } />
      <Notice n={notice} onClose={clear} />
      {loading && !d && <Empty>Loading...</Empty>}
      {d && (
        <>
          {d.attention.pendingShops.length > 0 && (
            <Panel style={{ marginBottom: "1.5rem", borderColor: "rgba(233,196,106,0.4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ color: C.warn, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Needs your attention</div>
                  <p style={{ margin: "0.4rem 0 0 0" }}>{d.shops.pending} shop{d.shops.pending === 1 ? " is" : "s are"} waiting for approval{d.attention.pendingShops.length < d.shops.pending ? " (oldest shown)" : ""}:</p>
                  <ul style={{ margin: "0.5rem 0 0 1.1rem", color: C.muted, fontSize: "0.88rem" }}>
                    {d.attention.pendingShops.map((s: any) => <li key={s.id}>{s.name} - applied {fmtDate(s.createdAt)}</li>)}
                  </ul>
                </div>
                <Btn kind="primary" onClick={() => go("Shops", { status: "PENDING" })}>Review pending shops</Btn>
              </div>
            </Panel>
          )}

          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.copper, marginBottom: "0.8rem" }}>The marketplace right now</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <Stat label="Active shops" value={d.shops.active} sub={d.shops.pending + " pending, " + d.shops.suspended + " suspended" + (d.shops.paused ? ", " + d.shops.paused + " paused by owner" : "")} />
            <Stat label="Products listed" value={d.products.active} sub={d.products.hidden + " hidden, " + d.products.trashed + " in trash"} />
            <Stat label="Accounts" value={d.users.total} sub={d.users.buyers + " buyers, " + d.users.sellers + " sellers, " + d.users.admins + " admin" + (d.users.admins === 1 ? "" : "s")} />
            <Stat label="Categories in use" value={d.activeCategories} sub="Switched on in Categories" />
          </div>

          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.copper, marginBottom: "0.8rem" }}>Activity - {period_l}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <Stat label="Shop page views" value={d.totals.shopViews} delta={<Delta cur={d.totals.shopViews} prev={prev ? prev.shopViews : null} />} />
            <Stat label="Product views" value={d.totals.productViews} delta={<Delta cur={d.totals.productViews} prev={prev ? prev.productViews : null} />} />
            <Stat label="WhatsApp clicks" value={d.totals.whatsappClicks} delta={<Delta cur={d.totals.whatsappClicks} prev={prev ? prev.whatsappClicks : null} />} />
            <Stat label="Unique visitors" value={d.visitors.unique} sub={d.visitors.whatsappUnique + " of them clicked WhatsApp"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <Stat label="New shops" value={d.newInPeriod.shops} />
            <Stat label="New products" value={d.newInPeriod.products} />
            <Stat label="New accounts" value={d.newInPeriod.users} />
          </div>

          <TrendChart buckets={d.buckets} granularity={d.granularity} />
          <p style={{ color: C.muted, fontSize: "0.78rem", margin: "0.8rem 0 2rem 0" }}>Views and clicks do not count visits by signed-in sellers or admins. Unique visitors are counted per browser, so one person on two devices counts twice. Times are Tanzania time.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
            <Panel>
              <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Top shops</h3>
              {d.topShops.length === 0 ? <Empty>No activity in this period yet.</Empty> : d.topShops.map((s: any, i: number) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(185,130,90,0.08)", fontSize: "0.9rem" }}>
                  <span>{i + 1}. {s.name}</span>
                  <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{s.clicks} WhatsApp / {s.views} views</span>
                </div>
              ))}
            </Panel>
            <Panel>
              <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Top products</h3>
              {d.topProducts.length === 0 ? <Empty>No activity in this period yet.</Empty> : d.topProducts.map((p: any, i: number) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(185,130,90,0.08)", fontSize: "0.9rem" }}>
                  <span>{i + 1}. {p.name} <span style={{ color: C.muted, fontSize: "0.78rem" }}>- {p.shop}</span></span>
                  <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{p.clicks} WhatsApp / {p.views} views</span>
                </div>
              ))}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
