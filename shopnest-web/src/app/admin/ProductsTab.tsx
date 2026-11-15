"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { thumbSrc } from "../../lib/images";
import { api, Btn, C, ConfirmBtn, Empty, fmtDate, Notice, PageTitle, Panel, Pager, Pill, SearchBox, Select, Table, td, th, useDebounced, useNotice } from "./ui";

const LIMIT = 20;
const O = { background: "#1a0f0a", color: "#f3e3d0" };

export default function ProductsTab() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [shop, setShop] = useState("");
  const [category, setCategory] = useState("");
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<any>(null);
  const [facets, setFacets] = useState<{ shops: { id: string; name: string }[]; categories: string[]; trashed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, show, clear, clearError] = useNotice();
  const dq = useDebounced(q);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = "limit=" + LIMIT + "&skip=" + skip + (status ? "&status=" + status : "") + (shop ? "&storeId=" + shop : "") + (category ? "&category=" + encodeURIComponent(category) : "") + (dq.trim() ? "&q=" + encodeURIComponent(dq.trim()) : "");
    const [r, f] = await Promise.all([api("/admin/products?" + qs), api("/admin/products/facets")]);
    setLoading(false);
    if (f.ok) setFacets(f.data);
    if (r.ok) { setData(r.data); clearError(); } else show("error", r.error);
  }, [status, shop, category, dq, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSkip(0); }, [status, shop, category, dq]);

  async function change(id: string, name: string, next: string, done: string) {
    setBusy(id);
    const r = next === "RESTORE" ? await api("/products/admin/restore/" + id, { method: "PATCH" }) : await api("/products/admin/" + id + "/status", { method: "PATCH", data: { status: next } });
    setBusy("");
    if (r.ok) { show("ok", '"' + name + '" ' + done + "."); load(); } else show("error", r.error);
  }

  return (
    <>
      <PageTitle title="Products" sub="Every product on the marketplace. Hide a product to take it off the site without deleting it." />
      <Notice n={notice} onClose={clear} />
      <Panel>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.2rem" }}>
          <SearchBox value={q} onChange={setQ} placeholder="Search product or shop" />
          <Select label="Filter by status" value={status} onChange={setStatus}>
            <option value="" style={O}>Visible and hidden</option>
            <option value="ACTIVE" style={O}>Visible only</option>
            <option value="HIDDEN" style={O}>Hidden only</option>
            <option value="TRASHED" style={O}>Trash{facets ? " (" + facets.trashed + ")" : ""}</option>
          </Select>
          <Select label="Filter by shop" value={shop} onChange={setShop}>
            <option value="" style={O}>All shops</option>
            {facets?.shops.map((s) => <option key={s.id} value={s.id} style={O}>{s.name}</option>)}
          </Select>
          <Select label="Filter by category" value={category} onChange={setCategory}>
            <option value="" style={O}>All categories</option>
            <option value="__none" style={O}>No category</option>
            {facets?.categories.map((c) => <option key={c} value={c} style={O}>{c}</option>)}
          </Select>
          {data && <span style={{ color: C.muted, fontSize: "0.85rem" }}>{data.total} product{data.total === 1 ? "" : "s"}</span>}
        </div>
        {loading && !data ? <Empty>Loading...</Empty> : data && data.items.length === 0 ? <Empty>No products match.</Empty> : data && (
          <Table>
            <thead><tr><th style={th}>Product</th><th style={th}>Shop</th><th style={th}>Category</th><th style={th}>Price</th><th style={th}>Stock</th><th style={th}>Status</th><th style={th}>Added</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {data.items.map((p: any) => (
                <tr key={p.id}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", overflow: "hidden", flexShrink: 0 }}>{p.imageUrl && <img src={thumbSrc(p.imageUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={td}>{p.store.name}</td>
                  <td style={td}>{p.category || <span style={{ color: C.muted }}>-</span>}</td>
                  <td style={td}>TZS {Number(p.price).toLocaleString()}</td>
                  <td style={td}>{p.stockQuantity}</td>
                  <td style={td}><Pill tone={p.status === "ACTIVE" ? "ok" : p.status === "HIDDEN" ? "warn" : "bad"}>{p.status === "ACTIVE" ? "Visible" : p.status === "HIDDEN" ? "Hidden" : "In trash"}</Pill></td>
                  <td style={td}>{fmtDate(p.createdAt)}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {p.status === "ACTIVE" && <Btn small disabled={busy === p.id} onClick={() => change(p.id, p.name, "HIDDEN", "is now hidden")}>Hide</Btn>}
                      {p.status === "HIDDEN" && <Btn small kind="primary" disabled={busy === p.id} onClick={() => change(p.id, p.name, "ACTIVE", "is visible again")}>Show</Btn>}
                      {p.status !== "TRASHED" && <ConfirmBtn label="Trash" confirmLabel="Confirm trash" kind="danger" disabled={busy === p.id} onConfirm={() => change(p.id, p.name, "TRASHED", "was moved to trash")} />}
                      {p.status === "TRASHED" && <Btn small kind="primary" disabled={busy === p.id} onClick={() => change(p.id, p.name, "RESTORE", "was restored")}>Restore</Btn>}
                      {p.status === "ACTIVE" && <Link href={"/product/" + p.id} target="_blank" style={{ color: "var(--latte)", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.78rem", textDecoration: "none" }}>Open</Link>}
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
