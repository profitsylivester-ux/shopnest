"use client";
import { useCallback, useEffect, useState } from "react";
import ActivityPanel from "./ActivityPanel";
import { api, Btn, C, ConfirmBtn, Empty, fmtDate, Notice, PageTitle, Panel, Pager, Pill, SearchBox, Select, Table, td, th, useDebounced, useNotice } from "./ui";

const LIMIT = 20;

export default function UsersTab({ selfId }: { selfId: string }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<{ id: string; name: string } | null>(null);
  const [notice, show, clear, clearError] = useNotice();
  const dq = useDebounced(q);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api("/admin/users?limit=" + LIMIT + "&skip=" + skip + (role ? "&role=" + role : "") + (dq.trim() ? "&q=" + encodeURIComponent(dq.trim()) : ""));
    setLoading(false);
    if (r.ok) { setData(r.data); clearError(); } else show("error", r.error);
  }, [role, dq, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSkip(0); }, [role, dq]);

  async function signOutEverywhere(id: string, name: string) {
    const r = await api("/admin/users/" + id + "/force-logout", { method: "POST" });
    if (r.ok) show("ok", name + " was signed out of every device. They can sign in again with their password."); else show("error", r.error);
  }

  return (
    <>
      <PageTitle title="Users" sub="Everyone with an account. You can end a person's sessions on every device if you think their account is at risk." />
      <Notice n={notice} onClose={clear} />
      {activity && <ActivityPanel userId={activity.id} title={"Activity of " + activity.name} onClose={() => setActivity(null)} />}
      <Panel>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.2rem" }}>
          <SearchBox value={q} onChange={setQ} placeholder="Search name or email" />
          <Select label="Filter by role" value={role} onChange={setRole}>
            <option value="" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>All roles</option>
            <option value="BUYER" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>Buyers</option>
            <option value="SELLER" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>Sellers</option>
            <option value="ADMIN" style={{ background: "#1a0f0a", color: "#f3e3d0" }}>Admins</option>
          </Select>
          {data && <span style={{ color: C.muted, fontSize: "0.85rem" }}>{data.total} account{data.total === 1 ? "" : "s"}</span>}
        </div>
        {loading && !data ? <Empty>Loading...</Empty> : data && data.items.length === 0 ? <Empty>No accounts match.</Empty> : data && (
          <Table>
            <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Shop</th><th style={th}>Joined</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {data.items.map((u: any) => (
                <tr key={u.id}>
                  <td style={td}>{u.name}{u.id === selfId && <span style={{ color: C.muted, fontSize: "0.75rem" }}> (you)</span>}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><Pill tone={u.role === "ADMIN" ? "warn" : u.role === "SELLER" ? "ok" : "muted"}>{u.role === "ADMIN" ? "Admin" : u.role === "SELLER" ? "Seller" : "Buyer"}</Pill></td>
                  <td style={td}>{u.store ? <span>{u.store.name} <span style={{ color: C.muted, fontSize: "0.75rem" }}>({u.store.status.toLowerCase()})</span></span> : <span style={{ color: C.muted }}>-</span>}</td>
                  <td style={td}>{fmtDate(u.createdAt)}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <Btn small onClick={() => { setActivity({ id: u.id, name: u.name }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Activity</Btn>
                      {u.id !== selfId && <ConfirmBtn label="Sign out everywhere" confirmLabel="Confirm sign out" kind="danger" onConfirm={() => signOutEverywhere(u.id, u.name)} />}
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
