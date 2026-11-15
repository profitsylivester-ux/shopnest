"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, Btn, C, Empty, fmtDateTime, Notice, PageTitle, Panel, Pager, Pill, SearchBox, Table, Toggle, td, th, useDebounced, useNotice } from "./ui";

const LIMIT = 20;
const FILTERS: { v: string; l: string }[] = [{ v: "", l: "All" }, { v: "PENDING", l: "Waiting" }, { v: "VISIBLE", l: "Public" }, { v: "HIDDEN", l: "Hidden" }];
const stars = (n: number) => "\u2605".repeat(n) + "\u2606".repeat(5 - n);

export default function ReviewsTab() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [approval, setApproval] = useState(false);
  const [notice, show, clear, clearError] = useNotice();
  const dq = useDebounced(q);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api("/admin/reviews?limit=" + LIMIT + "&page=" + (Math.floor(skip / LIMIT) + 1) + (status ? "&status=" + status : "") + (dq.trim() ? "&q=" + encodeURIComponent(dq.trim()) : ""));
    setLoading(false);
    if (r.ok) { setData(r.data); setApproval(!!r.data.approvalRequired); clearError(); } else show("error", r.error);
  }, [status, dq, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSkip(0); }, [status, dq]);

  async function setReview(id: string, next: "VISIBLE" | "HIDDEN", done: string) {
    setBusy(id);
    const r = await api("/admin/reviews/" + id, { method: "PATCH", data: { status: next } });
    setBusy("");
    if (r.ok) { show("ok", done); load(); } else show("error", r.error);
  }

  async function switchApproval(on: boolean) {
    const r = await api("/settings", { method: "PATCH", data: { reviewsRequireApproval: on ? "true" : "false" } });
    if (r.ok) { setApproval(on); show("ok", on ? "Approval is ON: new reviews wait here until you approve them." : "Approval is OFF: new reviews are public at once."); load(); } else show("error", r.error);
  }

  const counts = data?.counts;
  const total = counts ? counts.VISIBLE + counts.PENDING + counts.HIDDEN : null;

  return (
    <>
      <PageTitle title="Reviews" sub="Buyers write reviews about shops. You can hide any review that breaks the rules, and switch on approval if the site is being abused." />
      <Notice n={notice} onClose={clear} />
      <Panel style={{ marginBottom: "1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <Toggle on={approval} onChange={switchApproval} label="Approve new reviews before they appear" />
          <div><div style={{ fontWeight: 500 }}>Approve new reviews before they appear</div><div style={{ color: C.muted, fontSize: "0.78rem" }}>Switch this on if someone is posting fake or abusive reviews.</div></div>
        </div>
        <p style={{ color: C.muted, fontSize: "0.8rem", margin: "0.6rem 0 0 0", lineHeight: 1.5 }}>{approval ? "Approval is ON. New and edited reviews stay in Waiting until you approve them. Buyers see a note that reviews are checked first." : "Approval is OFF. New reviews are public at once and you can still hide any of them here."}</p>
      </Panel>
      <Panel>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.2rem" }}>
          {FILTERS.map((f) => {
            const on = status === f.v;
            const n = counts ? (f.v === "" ? total : counts[f.v]) : null;
            return <button key={f.v} onClick={() => setStatus(f.v)} style={{ padding: "0.45rem 1rem", borderRadius: "999px", cursor: "pointer", fontFamily: "Jost, sans-serif", fontSize: "0.82rem", background: on ? "var(--latte)" : "transparent", color: on ? "var(--espresso)" : "var(--latte)", border: "1px solid rgba(185,130,90,0.4)" }}>{f.l}{n !== null ? " (" + n + ")" : ""}</button>;
          })}
          <div style={{ flex: 1 }} />
          <SearchBox value={q} onChange={setQ} placeholder="Search comment, shop or email" />
        </div>
        {loading && !data ? <Empty>Loading...</Empty> : data && data.items.length === 0 ? <Empty>No reviews match.</Empty> : data && (
          <Table>
            <thead><tr><th style={th}>Shop</th><th style={th}>Reviewer</th><th style={th}>Rating</th><th style={th}>Comment</th><th style={th}>Date</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {data.items.map((r: any) => (
                <tr key={r.id}>
                  <td style={td}><Link href={"/store/" + r.store.slug} target="_blank" style={{ color: "var(--latte)" }}>{r.store.name}</Link></td>
                  <td style={td}><div>{r.user.name}</div><div style={{ color: C.muted, fontSize: "0.75rem" }}>{r.user.email}</div></td>
                  <td style={{ ...td, color: "#e0a526", whiteSpace: "nowrap" }} aria-label={r.rating + " out of 5"}>{stars(r.rating)}</td>
                  <td style={{ ...td, maxWidth: "320px", overflowWrap: "anywhere" }}>{r.comment || <span style={{ color: C.muted }}>No comment</span>}</td>
                  <td style={td}>{fmtDateTime(r.createdAt)}</td>
                  <td style={td}><Pill tone={r.status === "VISIBLE" ? "ok" : r.status === "PENDING" ? "warn" : "bad"}>{r.status === "VISIBLE" ? "Public" : r.status === "PENDING" ? "Waiting" : "Hidden"}</Pill></td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {r.status === "PENDING" && <Btn small kind="primary" disabled={busy === r.id} onClick={() => setReview(r.id, "VISIBLE", "Review approved and now public.")}>Approve</Btn>}
                      {r.status !== "HIDDEN" && <Btn small kind="danger" disabled={busy === r.id} onClick={() => setReview(r.id, "HIDDEN", "Review hidden from the public.")}>Hide</Btn>}
                      {r.status === "HIDDEN" && <Btn small kind="primary" disabled={busy === r.id} onClick={() => setReview(r.id, "VISIBLE", "Review restored.")}>Restore</Btn>}
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
