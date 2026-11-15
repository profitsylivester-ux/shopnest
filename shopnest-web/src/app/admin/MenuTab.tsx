"use client";
import { useCallback, useEffect, useState } from "react";
import { api, Btn, C, ConfirmBtn, Empty, Field, inputStyle, Notice, optionStyle, PageTitle, Panel, Pill, SectionNote, Toggle, useNotice } from "./ui";

type Item = { id: string; labelEn: string; labelSw: string | null; href: string; location: "NAVBAR" | "FOOTER"; sortOrder: number; isActive: boolean; parentId: string | null };

function Form({ initial, items, onSaved, onCancel, show }: { initial: Item | null; items: Item[]; onSaved: () => void; onCancel?: () => void; show: (k: "ok" | "error", t: string) => void }) {
  const [labelEn, setLabelEn] = useState(initial?.labelEn || "");
  const [labelSw, setLabelSw] = useState(initial?.labelSw || "");
  const [href, setHref] = useState(initial?.href || "");
  const [location, setLocation] = useState<string>(initial?.location || "NAVBAR");
  const [parentId, setParentId] = useState(initial?.parentId || "");
  const [order, setOrder] = useState(initial ? String(initial.sortOrder) : "");
  const [active, setActive] = useState(initial ? initial.isActive : true);
  const [busy, setBusy] = useState(false);
  const hasChildren = !!initial && items.some((i) => i.parentId === initial.id);
  const parents = items.filter((i) => !i.parentId && i.location === location && i.id !== initial?.id);

  async function save() {
    setBusy(true);
    const data: Record<string, unknown> = { labelEn, labelSw, href, location, parentId: parentId || null, isActive: active };
    if (order !== "") data.sortOrder = order;
    const r = initial ? await api("/admin/content/menu/" + initial.id, { method: "PATCH", data }) : await api("/admin/content/menu", { method: "POST", data });
    setBusy(false);
    if (r.ok) { show("ok", initial ? "Menu link saved." : "Menu link added."); onSaved(); } else show("error", r.error);
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Field label="English label"><input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} style={inputStyle} maxLength={40} /></Field>
        <Field label="Swahili label"><input value={labelSw} onChange={(e) => setLabelSw(e.target.value)} style={inputStyle} maxLength={40} /></Field>
      </div>
      <Field label="Link" hint="A page that really exists: a path inside the site such as /marketplace, or a full address starting with https://"><input value={href} onChange={(e) => setHref(e.target.value)} style={inputStyle} maxLength={500} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px", gap: "1rem" }}>
        <Field label="Menu">
          <select value={location} onChange={(e) => { setLocation(e.target.value); setParentId(""); }} disabled={hasChildren} style={inputStyle}>
            <option value="NAVBAR" style={optionStyle}>Top navigation bar</option>
            <option value="FOOTER" style={optionStyle}>Footer</option>
          </select>
        </Field>
        <Field label="Inside a dropdown?">
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} disabled={hasChildren} style={inputStyle}>
            <option value="" style={optionStyle}>No, a main link</option>
            {parents.map((p) => <option key={p.id} value={p.id} style={optionStyle}>Under: {p.labelEn}</option>)}
          </select>
        </Field>
        <Field label="Order"><input value={order} onChange={(e) => setOrder(e.target.value.replace(/[^0-9]/g, ""))} style={inputStyle} inputMode="numeric" placeholder="auto" /></Field>
      </div>
      {hasChildren && <p style={{ color: C.muted, fontSize: "0.8rem", margin: 0 }}>This link has dropdown items, so its menu and position cannot change until they are moved or removed.</p>}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><Toggle on={active} onChange={setActive} label="Link on" /><span style={{ fontSize: "0.85rem", color: C.muted }}>{active ? "Shown" : "Hidden"}</span></div>
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <Btn kind="primary" disabled={busy || !labelEn.trim() || !href.trim()} onClick={save}>{busy ? "Saving..." : initial ? "Save link" : "Add link"}</Btn>
        {onCancel && <Btn onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  );
}

export default function MenuTab() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, show, clear] = useNotice();

  const load = useCallback(async () => {
    const r = await api("/admin/content/menu");
    if (r.ok) setItems(r.data); else show("error", r.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  async function remove(i: Item) {
    const r = await api("/admin/content/menu/" + i.id, { method: "DELETE" });
    if (r.ok) { show("ok", 'Deleted "' + i.labelEn + '".'); load(); } else show("error", r.error);
  }

  const line = (i: Item, child: boolean) => (
    <div key={i.id} style={{ padding: "0.8rem 0 0.8rem " + (child ? "2rem" : "0"), borderBottom: "1px solid rgba(185,130,90,0.08)" }}>
      {editing === i.id ? (
        <Form initial={i} items={items || []} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} show={show} />
      ) : (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <span style={{ fontWeight: child ? 400 : 500 }}>{child ? "- " : ""}{i.labelEn}</span>
            {i.labelSw && <span style={{ color: C.muted }}> / {i.labelSw}</span>}
            <div style={{ color: C.muted, fontSize: "0.78rem" }}>{i.href} - order {i.sortOrder}</div>
          </div>
          {!i.isActive && <Pill tone="muted">Hidden</Pill>}
          <Btn small onClick={() => setEditing(i.id)}>Edit</Btn>
          <ConfirmBtn label="Delete" confirmLabel={items && items.some((c) => c.parentId === i.id) ? "Delete with dropdown" : "Confirm delete"} kind="danger" onConfirm={() => remove(i)} />
        </div>
      )}
    </div>
  );

  const group = (loc: "NAVBAR" | "FOOTER", title: string) => {
    const top = (items || []).filter((i) => i.location === loc && !i.parentId);
    return (
      <Panel style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 0.6rem 0" }}>{title}</h3>
        {top.length === 0 ? <Empty>No links yet.</Empty> : top.map((t) => (
          <div key={t.id}>{line(t, false)}{(items || []).filter((c) => c.parentId === t.id).map((c) => line(c, true))}</div>
        ))}
      </Panel>
    );
  };

  return (
    <>
      <PageTitle title="Menu" sub="The links in the top navigation bar and the footer, with optional dropdowns. Add only links that go to a real page." />
      <SectionNote>Menus are saved now and appear on the website when the new marketplace pages are built (next phase). The links on the live site stay as they are until then.</SectionNote>
      <Notice n={notice} onClose={clear} />
      <Panel style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Add a link</h3>
        <Form key={"new" + (items ? items.length : 0)} initial={null} items={items || []} onSaved={load} show={show} />
      </Panel>
      {!items ? <Empty>Loading...</Empty> : (<>{group("NAVBAR", "Top navigation bar")}{group("FOOTER", "Footer")}</>)}
    </>
  );
}
