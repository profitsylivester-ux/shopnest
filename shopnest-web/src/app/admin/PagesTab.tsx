"use client";
import { useCallback, useEffect, useState } from "react";
import { api, Btn, C, ConfirmBtn, Empty, fmtDate, Field, inputStyle, Notice, PageTitle, Panel, Pill, SectionNote, Toggle, useNotice } from "./ui";

type Page = { id: string; slug: string; titleEn: string; titleSw: string | null; bodyEn: string; bodySw: string | null; isPublished: boolean; updatedAt: string };
const area: React.CSSProperties = { ...inputStyle, minHeight: "180px", resize: "vertical", lineHeight: 1.6 };

function Form({ initial, onSaved, onCancel, show }: { initial: Page | null; onSaved: () => void; onCancel?: () => void; show: (k: "ok" | "error", t: string) => void }) {
  const [slug, setSlug] = useState(initial?.slug || "");
  const [titleEn, setTitleEn] = useState(initial?.titleEn || "");
  const [titleSw, setTitleSw] = useState(initial?.titleSw || "");
  const [bodyEn, setBodyEn] = useState(initial?.bodyEn || "");
  const [bodySw, setBodySw] = useState(initial?.bodySw || "");
  const [published, setPublished] = useState(initial ? initial.isPublished : false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const data = { slug, titleEn, titleSw, bodyEn, bodySw, isPublished: published };
    const r = initial ? await api("/admin/content/pages/" + initial.id, { method: "PATCH", data }) : await api("/admin/content/pages", { method: "POST", data });
    setBusy(false);
    if (r.ok) { show("ok", initial ? "Page saved." : "Page added."); onSaved(); } else show("error", r.error);
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <Field label="Page address" hint="Lowercase letters, numbers and dashes, for example faq or privacy-policy"><input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} style={inputStyle} maxLength={60} /></Field>
        <Field label="English title"><input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} style={inputStyle} maxLength={120} /></Field>
        <Field label="Swahili title (optional)"><input value={titleSw} onChange={(e) => setTitleSw(e.target.value)} style={inputStyle} maxLength={120} /></Field>
      </div>
      <Field label="English text"><textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} style={area} maxLength={20000} /></Field>
      <Field label="Swahili text (optional)"><textarea value={bodySw} onChange={(e) => setBodySw(e.target.value)} style={area} maxLength={20000} /></Field>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><Toggle on={published} onChange={setPublished} label="Published" /><span style={{ fontSize: "0.85rem", color: C.muted }}>{published ? "Published - visitors can read it" : "Draft - only you can see it"}</span></div>
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <Btn kind="primary" disabled={busy || !slug.trim() || !titleEn.trim() || !bodyEn.trim()} onClick={save}>{busy ? "Saving..." : initial ? "Save page" : "Add page"}</Btn>
        {onCancel && <Btn onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  );
}

export default function PagesTab() {
  const [list, setList] = useState<Page[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, show, clear] = useNotice();

  const load = useCallback(async () => {
    const r = await api("/admin/content/pages");
    if (r.ok) setList(r.data); else show("error", r.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  async function remove(p: Page) {
    const r = await api("/admin/content/pages/" + p.id, { method: "DELETE" });
    if (r.ok) { show("ok", 'Deleted "' + p.titleEn + '".'); load(); } else show("error", r.error);
  }

  return (
    <>
      <PageTitle title="Pages" sub="Text pages such as FAQ, About, Privacy, Terms and Support. Write real text only; a page stays a draft until you publish it." right={!adding ? <Btn kind="primary" onClick={() => setAdding(true)}>Add a page</Btn> : undefined} />
      <SectionNote>Pages are saved now and shown on the website when the new marketplace pages are built (next phase). The live site does not show them yet.</SectionNote>
      <Notice n={notice} onClose={clear} />
      {adding && <Panel style={{ marginBottom: "1.5rem" }}><h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>New page</h3><Form initial={null} onSaved={() => { setAdding(false); load(); }} onCancel={() => setAdding(false)} show={show} /></Panel>}
      <Panel>
        {!list ? <Empty>Loading...</Empty> : list.length === 0 ? <Empty>No pages yet. Add one when you have real text for it.</Empty> : list.map((p) => (
          <div key={p.id} style={{ padding: "1.1rem 0", borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
            {editing === p.id ? (
              <Form initial={p} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} show={show} />
            ) : (
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ fontWeight: 500 }}>{p.titleEn}{p.titleSw && <span style={{ color: C.muted, fontWeight: 400 }}> / {p.titleSw}</span>}</div>
                  <div style={{ color: C.muted, fontSize: "0.78rem" }}>/{p.slug} - updated {fmtDate(p.updatedAt)}</div>
                </div>
                <Pill tone={p.isPublished ? "ok" : "muted"}>{p.isPublished ? "Published" : "Draft"}</Pill>
                <Btn small onClick={() => setEditing(p.id)}>Edit</Btn>
                <ConfirmBtn label="Delete" confirmLabel="Confirm delete" kind="danger" onConfirm={() => remove(p)} />
              </div>
            )}
          </div>
        ))}
      </Panel>
    </>
  );
}
