"use client";
import { useCallback, useEffect, useState } from "react";
import ImageField from "./ImageField";
import { api, Btn, C, ConfirmBtn, Empty, Field, inputStyle, Notice, PageTitle, Panel, Pill, SectionNote, Toggle, useNotice } from "./ui";

type Cat = { id: string; nameEn: string; nameSw: string | null; imageUrl: string | null; sortOrder: number; isActive: boolean; products: number };

function Row({ c, onDone, show }: { c: Cat; onDone: () => void; show: (k: "ok" | "error", t: string) => void }) {
  const [nameEn, setNameEn] = useState(c.nameEn);
  const [nameSw, setNameSw] = useState(c.nameSw || "");
  const [imageUrl, setImageUrl] = useState(c.imageUrl || "");
  const [order, setOrder] = useState(String(c.sortOrder));
  const [active, setActive] = useState(c.isActive);
  const [busy, setBusy] = useState(false);
  const dirty = nameEn !== c.nameEn || nameSw !== (c.nameSw || "") || imageUrl !== (c.imageUrl || "") || order !== String(c.sortOrder) || active !== c.isActive;

  async function save() {
    setBusy(true);
    const r = await api("/admin/content/categories/" + c.id, { method: "PATCH", data: { nameEn, nameSw, imageUrl, sortOrder: order, isActive: active } });
    setBusy(false);
    if (r.ok) { show("ok", 'Saved "' + nameEn + '".'); onDone(); } else show("error", r.error);
  }
  async function remove() {
    const r = await api("/admin/content/categories/" + c.id, { method: "DELETE" });
    if (r.ok) { show("ok", 'Deleted "' + c.nameEn + '".'); onDone(); } else show("error", r.error);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 110px", gap: "1rem", alignItems: "start", padding: "1rem 0", borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
      <ImageField label="Photo" size={60} value={imageUrl} onChange={setImageUrl} />
      <Field label="English name"><input value={nameEn} onChange={(e) => setNameEn(e.target.value)} style={inputStyle} maxLength={60} /></Field>
      <Field label="Swahili name"><input value={nameSw} onChange={(e) => setNameSw(e.target.value)} style={inputStyle} maxLength={60} /></Field>
      <Field label="Order"><input value={order} onChange={(e) => setOrder(e.target.value.replace(/[^0-9]/g, ""))} style={inputStyle} inputMode="numeric" /></Field>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><Toggle on={active} onChange={setActive} label={"Show " + c.nameEn} /><span style={{ fontSize: "0.85rem", color: C.muted }}>{active ? "Shown" : "Hidden"}</span></div>
        <Pill tone="muted">{c.products} product{c.products === 1 ? "" : "s"}</Pill>
        <div style={{ flex: 1 }} />
        {dirty && <Btn small kind="primary" disabled={busy} onClick={save}>{busy ? "Saving..." : "Save changes"}</Btn>}
        <ConfirmBtn label="Delete" confirmLabel="Confirm delete" kind="danger" onConfirm={remove} />
      </div>
    </div>
  );
}

export default function CategoriesTab() {
  const [list, setList] = useState<Cat[] | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameSw, setNameSw] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [notice, show, clear] = useNotice();

  const load = useCallback(async () => {
    const r = await api("/admin/content/categories");
    if (r.ok) setList(r.data); else show("error", r.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  async function add() {
    setAdding(true);
    const r = await api("/admin/content/categories", { method: "POST", data: { nameEn, nameSw, imageUrl } });
    setAdding(false);
    if (r.ok) { show("ok", 'Added "' + nameEn + '".'); setNameEn(""); setNameSw(""); setImageUrl(""); load(); } else show("error", r.error);
  }

  return (
    <>
      <PageTitle title="Categories" sub="The product categories buyers browse and sellers choose from, in English and Swahili." />
      <SectionNote>You can edit these now. The website and the seller form still use the built-in list of 18 until the new marketplace pages are built (next phase), then they read from here. Renaming a category here also renames it on every product that uses it.</SectionNote>
      <Notice n={notice} onClose={clear} />
      <Panel style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Add a category</h3>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
          <ImageField label="Photo (optional)" size={60} value={imageUrl} onChange={setImageUrl} />
          <Field label="English name"><input value={nameEn} onChange={(e) => setNameEn(e.target.value)} style={inputStyle} maxLength={60} /></Field>
          <Field label="Swahili name"><input value={nameSw} onChange={(e) => setNameSw(e.target.value)} style={inputStyle} maxLength={60} /></Field>
          <Btn kind="primary" disabled={adding || !nameEn.trim()} onClick={add}>{adding ? "Adding..." : "Add"}</Btn>
        </div>
      </Panel>
      <Panel>
        {!list ? <Empty>Loading...</Empty> : list.length === 0 ? <Empty>No categories yet.</Empty> : list.map((c) => <Row key={c.id + c.nameEn + c.sortOrder + String(c.isActive) + (c.imageUrl || "") + (c.nameSw || "")} c={c} onDone={load} show={show} />)}
      </Panel>
    </>
  );
}
