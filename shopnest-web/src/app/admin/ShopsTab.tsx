"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { thumbSrc } from "../../lib/images";
import ActivityPanel from "./ActivityPanel";
import { api, Btn, C, ConfirmBtn, Empty, fmtDate, Notice, PageTitle, Panel, Pager, Pill, SearchBox, Select, Table, td, th, useDebounced, useNotice } from "./ui";

const LIMIT = 20;
const FILTERS: { v: string; l: string }[] = [{ v: "", l: "All" }, { v: "PENDING", l: "Pending" }, { v: "ACTIVE", l: "Active" }, { v: "SUSPENDED", l: "Suspended" }];

export default function ShopsTab({ initialStatus }: { initialStatus?: string }) {
  const [status, setStatus] = useState(initialStatus || "");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [activity, setActivity] = useState<{ id: string; name: string } | null>(null);
  const [notice, show, clear, clearError] = useNotice();
  const dq = useDebounced(q);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api("/admin/shops?limit=" + LIMIT + "&skip=" + skip + "&sort=" + sort + (status ? "&status=" + status : "") + (dq.trim() ? "&q=" + encodeURIComponent(dq.trim()) : ""));
    setLoading(false);
    if (r.ok) { setData(r.data); clearError(); } else show("error", r.error);
  }, [status, dq, sort, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSkip(0); }, [status, dq, sort]);

  async function setShopStatus(id: string, name: string, next: string, verb: string) {
    setBusy(id);
    const r = await api("/stores/admin/" + id + "/status", { method: "PATCH", data: { status: next } });
    setBusy("");
    if (r.ok) { show("ok", name + " " + verb + "."); load(); } else show("error", r.error);
  }

  const counts = data?.counts;

  return (
    <>
      <PageTitle title="Shops" sub="Approve new shops, suspend shops that break the rules, and see how each shop is doing." />
      <Notice n={notice} onClose={clear} />
      {activity && <ActivityPanel userId={activity.id} title={"Activity of " + activity.name} onClose={() => setActivity(null)} />}
      <Panel>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.2rem" }}>
          {FILTERS.map((f) => {
            const on = status === f.v;
            const n = counts ? (f.v === "" ? counts.all : counts[f.v]) : null;
            return <button key={f.v} onClick={() => setStatus(f.v)} style={{ padding: "0.45rem 1rem", borderRadius: "999px", cursor: "pointer", fontFamily: "Jost, sans-serif", fontSize: "0.82rem", background: on ? "var(--latte)" : "transparent", color: on ? "#1a0f0a" : "var(--latte)", border: "1px solid rgba(185,130,90,0.4)" }}>{f.l}{n !== null ? " (" + n + ")" : ""}</button>;
          })}
          <div style={{ flex: 1 }} />
          <SearchBox value={q} onChange={setQ} placeholder="Search shop, owner or email" />
          <Select label="Sort shops" value={sort} onChange={setSort}>
            <option value="newest" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>Newest first</option>
            <option value="oldest" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>Oldest first</option>
            <option value="name" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>Name A-Z</option>
            <option value="status" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>By status</option>
          </Select>
        </div>
        {loading && !data ? <Empty>Loading...</Empty> : data && data.items.length === 0 ? <Empty>No shops match.</Empty> : data && (
          <Table>
            <thead><tr><th style={th}>Shop</th><th style={th}>Owner</th><th style={th}>Status</th><th style={th}>Products</th><th style={th}>Enquiries</th><th style={th}>Joined</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {data.items.map((s: any) => (
                <tr key={s.id}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", overflow: "hidden", flexShrink: 0 }}>{s.logoUrl && <img src={thumbSrc(s.logoUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
                      <div><div style={{ fontWeight: 500 }}>{s.name}</div><div style={{ color: C.muted, fontSize: "0.75rem" }}>/{s.slug}{s.location ? " - " + s.location : ""}</div></div>
                    </div>
                  </td>
                  <td style={td}><div>{s.ownerName}</div><div style={{ color: C.muted, fontSize: "0.75rem" }}>{s.ownerEmail}</div></td>
                  <td style={td}><Pill tone={s.status === "ACTIVE" ? "ok" : s.status === "PENDING" ? "warn" : "bad"}>{s.status === "ACTIVE" ? "Active" : s.status === "PENDING" ? "Pending" : "Suspended"}</Pill>{s.isPaused && <div style={{ marginTop: "0.3rem" }}><Pill tone="muted">Paused by owner</Pill></div>}</td>
                  <td style={td}>{s.products}</td>
                  <td style={td}>{s.enquiries}</td>
                  <td style={td}>{fmtDate(s.createdAt)}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {s.status === "PENDING" && <Btn small kind="primary" disabled={busy === s.id} onClick={() => setShopStatus(s.id, s.name, "ACTIVE", "approved")}>Approve</Btn>}
                      {s.status === "ACTIVE" && <ConfirmBtn label="Suspend" confirmLabel="Confirm suspend" kind="danger" disabled={busy === s.id} onConfirm={() => setShopStatus(s.id, s.name, "SUSPENDED", "suspended")} />}
                      {s.status === "SUSPENDED" && <Btn small kind="primary" disabled={busy === s.id} onClick={() => setShopStatus(s.id, s.name, "ACTIVE", "reactivated")}>Reactivate</Btn>}
                      {s.status === "PENDING" && <ConfirmBtn label="Suspend" confirmLabel="Confirm suspend" kind="danger" disabled={busy === s.id} onConfirm={() => setShopStatus(s.id, s.name, "SUSPENDED", "suspended")} />}
                      {s.status === "ACTIVE" && <Link href={"/store/" + s.slug} target="_blank" style={{ color: "var(--latte)", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.78rem", textDecoration: "none" }}>Open shop</Link>}
                      <Btn small onClick={() => { setActivity({ id: s.ownerId, name: s.name }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Activity</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {data && <Pager total={data.total} skip={skip} limit={LIMIT} onChange={setSkip} />}
      </Panel>
    </>
  );
}
