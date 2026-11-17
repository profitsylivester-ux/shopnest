"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../../lib/seo";
import { api, Btn, C, Empty, Field, inputStyle, Notice, PageTitle, Panel, Toggle, useNotice } from "./ui";

const KEYS = ["announcementActive", "announcementText", "heroTitle", "heroSubtitle", "slide1Title", "slide1Desc", "slide1Video"] as const;
type S = Record<(typeof KEYS)[number], string>;
const EMPTY: S = { announcementActive: "false", announcementText: "", heroTitle: "", heroSubtitle: "", slide1Title: "", slide1Desc: "", slide1Video: "" };

export default function SettingsTab() {
  const [saved, setSaved] = useState<S | null>(null);
  const [v, setV] = useState<S>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [notice, show, clear] = useNotice();

  async function load() {
    try {
      const res = await fetch(API_URL + "/settings");
      const d = await res.json();
      const s: S = { ...EMPTY };
      for (const k of KEYS) if (typeof d[k] === "string") s[k] = d[k];
      setSaved(s);
      setV(s);
    } catch { show("error", "Could not load the saved settings. Check that the backend is running."); }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = saved !== null && KEYS.some((k) => v[k] !== saved[k]);
  const set = (k: keyof S) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  async function save() {
    setBusy(true);
    const r = await api("/settings", { method: "PATCH", data: v });
    setBusy(false);
    if (r.ok) {
      const s: S = { ...EMPTY };
      for (const k of KEYS) if (typeof r.data[k] === "string") s[k] = r.data[k];
      setSaved(s);
      setV(s);
      show("ok", "Saved. Visitors see the new text the next time they open the site.");
    } else show("error", r.error);
  }

  return (
    <>
      <PageTitle title="Homepage and announcement" sub="Text and video that visitors see on the home page. Leave a box empty to use the built-in text." />
      <Notice n={notice} onClose={clear} />
      {!saved ? <Empty>Loading...</Empty> : (
        <div style={{ display: "grid", gap: "1.5rem", maxWidth: "820px" }}>
          <Panel>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Announcement bar</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <Toggle on={v.announcementActive === "true"} onChange={(on) => setV({ ...v, announcementActive: on ? "true" : "false" })} label="Announcement bar" />
              <span style={{ fontSize: "0.85rem", color: C.muted }}>{v.announcementActive === "true" ? "Showing at the top of the site" : "Switched off"}</span>
            </div>
            <Field label="Announcement text" hint={v.announcementText.length + " / 200"}><input value={v.announcementText} onChange={set("announcementText")} style={inputStyle} maxLength={200} /></Field>
          </Panel>
          <Panel>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>First screen of the home page</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <Field label="Headline" hint="Built-in: Everything You Need"><input value={v.slide1Title} onChange={set("slide1Title")} style={inputStyle} maxLength={120} /></Field>
              <Field label="Description" hint={v.slide1Desc.length + " / 300"}><textarea value={v.slide1Desc} onChange={set("slide1Desc")} style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} maxLength={300} /></Field>
              <Field label="Background video" hint="A full address starting with https:// (or a file on the site, such as /video/hero-720.mp4). It is used on every device, so keep it small. Empty uses the built-in video, which adapts to each device."><input value={v.slide1Video} onChange={set("slide1Video")} style={inputStyle} maxLength={300} /></Field>
            </div>
          </Panel>
          <Panel>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Marketplace section title</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <Field label="Title"><input value={v.heroTitle} onChange={set("heroTitle")} style={inputStyle} maxLength={120} /></Field>
              <Field label="Subtitle"><input value={v.heroSubtitle} onChange={set("heroSubtitle")} style={inputStyle} maxLength={250} /></Field>
            </div>
          </Panel>
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <Btn kind="primary" disabled={busy || !dirty} onClick={save}>{busy ? "Saving..." : "Save changes"}</Btn>
            {dirty && <Btn onClick={() => saved && setV(saved)}>Discard changes</Btn>}
            {!dirty && <span style={{ color: C.muted, fontSize: "0.85rem" }}>Everything is saved.</span>}
          </div>
        </div>
      )}
    </>
  );
}
