"use client";
import { useCallback, useEffect, useState } from "react";
import { imgSrc, thumbSrc } from "../../lib/images";
import ImageField from "./ImageField";
import { api, Btn, C, ConfirmBtn, Empty, fmtDate, Field, inputStyle, Notice, PageTitle, Panel, Pill, SectionNote, Toggle, useNotice } from "./ui";

type Banner = { id: string; title: string | null; subtitle: string | null; imageUrl: string; linkUrl: string | null; sortOrder: number; isActive: boolean; startsAt: string | null; endsAt: string | null };

const toLocal = (v: string | null) => (v ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);

function status(b: Banner) {
  const now = Date.now();
  if (!b.isActive) return { tone: "muted" as const, text: "Switched off" };
  if (b.startsAt && new Date(b.startsAt).getTime() > now) return { tone: "warn" as const, text: "Starts " + fmtDate(b.startsAt) };
  if (b.endsAt && new Date(b.endsAt).getTime() <= now) return { tone: "bad" as const, text: "Ended " + fmtDate(b.endsAt) };
  return { tone: "ok" as const, text: "Showing" };
}

function Form({ initial, onSaved, onCancel, show }: { initial: Banner | null; onSaved: () => void; onCancel?: () => void; show: (k: "ok" | "error", t: string) => void }) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl || "");
  const [startsAt, setStartsAt] = useState(toLocal(initial?.startsAt || null));
  const [endsAt, setEndsAt] = useState(toLocal(initial?.endsAt || null));
  const [active, setActive] = useState(initial ? initial.isActive : true);
  const [order, setOrder] = useState(initial ? String(initial.sortOrder) : "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const data: Record<string, unknown> = { imageUrl, title, subtitle, linkUrl, startsAt: fromLocal(startsAt), endsAt: fromLocal(endsAt), isActive: active };
    if (order !== "") data.sortOrder = order;
    const r = initial ? await api("/admin/content/banners/" + initial.id, { method: "PATCH", data }) : await api("/admin/content/banners", { method: "POST", data });
    setBusy(false);
    if (r.ok) { show("ok", initial ? "Banner saved." : "Banner added."); onSaved(); } else show("error", r.error);
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <ImageField label="Banner picture (wide pictures work best)" size={110} value={imageUrl} onChange={setImageUrl} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Field label="Title (optional)"><input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} maxLength={80} /></Field>
        <Field label="Subtitle (optional)"><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} maxLength={160} /></Field>
      </div>
      <Field label="Link (optional)" hint="Where a click goes: a path inside the site such as /marketplace, or a full address starting with https://"><input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} style={inputStyle} maxLength={500} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px", gap: "1rem" }}>
        <Field label="Show from (optional)"><input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} /></Field>
        <Field label="Show until (optional)"><input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} style={inputStyle} /></Field>
        <Field label="Order"><input value={order} onChange={(e) => setOrder(e.target.value.replace(/[^0-9]/g, ""))} style={inputStyle} inputMode="numeric" placeholder="auto" /></Field>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><Toggle on={active} onChange={setActive} label="Banner on" /><span style={{ fontSize: "0.85rem", color: C.muted }}>{active ? "Switched on" : "Switched off"}</span></div>
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <Btn kind="primary" disabled={busy || !imageUrl} onClick={save}>{busy ? "Saving..." : initial ? "Save banner" : "Add banner"}</Btn>
        {onCancel && <Btn onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  );
}

export default function BannersTab() {
  const [list, setList] = useState<Banner[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, show, clear] = useNotice();

  const load = useCallback(async () => {
    const r = await api("/admin/content/banners");
    if (r.ok) setList(r.data); else show("error", r.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  async function remove(b: Banner) {
    const r = await api("/admin/content/banners/" + b.id, { method: "DELETE" });
    if (r.ok) { show("ok", "Banner deleted."); load(); } else show("error", r.error);
  }

  return (
    <>
      <PageTitle title="Banners" sub="Promotional pictures for the marketplace. Only banners that are switched on and within their dates are shown. With no banners, none are shown." />
      <SectionNote>Banners are saved now and appear on the website when the new marketplace page is built (next phase). Nothing on the live site changes yet.</SectionNote>
      <Notice n={notice} onClose={clear} />
      <Panel style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Add a banner</h3>
        <Form key={"new" + (list ? list.length : 0)} initial={null} onSaved={load} show={show} />
      </Panel>
      <Panel>
        {!list ? <Empty>Loading...</Empty> : list.length === 0 ? <Empty>No banners yet.</Empty> : list.map((b) => {
          const st = status(b);
          return (
            <div key={b.id} style={{ padding: "1.2rem 0", borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
              {editing === b.id ? (
                <Form initial={b} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} show={show} />
              ) : (
                <div style={{ display: "flex", gap: "1.2rem", alignItems: "center", flexWrap: "wrap" }}>
                  <a href={imgSrc(b.imageUrl)} target="_blank" rel="noreferrer"><img src={thumbSrc(b.imageUrl)} alt="" style={{ width: "180px", height: "80px", objectFit: "cover", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }} /></a>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 500 }}>{b.title || <span style={{ color: C.muted }}>(no title)</span>}</div>
                    {b.subtitle && <div style={{ color: C.muted, fontSize: "0.85rem" }}>{b.subtitle}</div>}
                    <div style={{ color: C.muted, fontSize: "0.78rem", marginTop: "0.3rem" }}>{b.linkUrl ? "Links to " + b.linkUrl : "No link"} - order {b.sortOrder}</div>
                    <div style={{ marginTop: "0.4rem" }}><Pill tone={st.tone}>{st.text}</Pill></div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <Btn small onClick={() => setEditing(b.id)}>Edit</Btn>
                    <ConfirmBtn label="Delete" confirmLabel="Confirm delete" kind="danger" onConfirm={() => remove(b)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Panel>
    </>
  );
}
