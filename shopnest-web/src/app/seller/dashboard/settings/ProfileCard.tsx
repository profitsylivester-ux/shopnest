"use client";
import { useState } from "react";
import { Card, Field, Msg, api, input, lbl, primary, ghost, pickImage, MUTED, type Note } from "./shared";

const TYPES = [["Online", "Online Seller"], ["Physical", "Physical Shop"], ["Both", "Both (Online and Physical)"]];

function ImageBox({ title, value, set, wide, bad }: { title: string; value: string; set: (v: string) => void; wide?: boolean; bad: () => void }) {
  return (
    <div style={{ flex: wide ? "1 1 260px" : "0 0 auto" }}>
      <span style={lbl}>{title}</span>
      <div style={{ width: wide ? "100%" : "96px", height: wide ? "110px" : "96px", borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(185,130,90,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: "0.75rem" }}>
        {value ? <img src={value} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "No image yet"}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <label style={{ ...ghost, display: "inline-block" }}>Choose<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) pickImage(f, set, bad); }} /></label>
        {value && <button type="button" onClick={() => set("")} style={ghost}>Remove</button>}
      </div>
    </div>
  );
}

export default function ProfileCard({ store, onSaved }: { store: any; onSaved: (s: any) => void }) {
  const [name, setName] = useState<string>(store.name || "");
  const [desc, setDesc] = useState<string>(store.description || "");
  const [wa, setWa] = useState<string>(store.whatsappNumber || "");
  const [place, setPlace] = useState<string>(store.location || "");
  const [type, setType] = useState<string>(store.shopType || "");
  const [logo, setLogo] = useState<string>(store.logoUrl || "");
  const [banner, setBanner] = useState<string>(store.bannerUrl || "");
  const [busy, setBusy] = useState(false);
  const [m, setM] = useState<Note>(null);
  const bad = () => setM({ ok: false, text: "That file is not a usable image." });
  const save = async () => {
    if (!name.trim() || !wa.trim()) { setM({ ok: false, text: "Shop name and WhatsApp number are required." }); return; }
    setBusy(true); setM(null);
    const r = await api("PATCH", "/stores/me", { name, description: desc, whatsappNumber: wa, location: place, logoUrl: logo, bannerUrl: banner, ...(type ? { shopType: type } : {}) });
    setBusy(false);
    if (r.ok) { onSaved(r.data); setM({ ok: true, text: "Saved. Your shop profile is up to date." }); } else setM({ ok: false, text: r.error });
  };
  return (
    <Card title="Shop profile" hint="What buyers see at the top of your shop.">
      <Field name="Shop name"><input style={input} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></Field>
      <Field name="Description"><textarea style={{ ...input, minHeight: "90px", resize: "vertical" }} value={desc} maxLength={1000} onChange={(e) => setDesc(e.target.value)} /></Field>
      <Field name="WhatsApp number (buyers contact you here)"><input style={input} value={wa} maxLength={20} onChange={(e) => setWa(e.target.value)} /></Field>
      <Field name="Location (town or area)"><input style={input} value={place} maxLength={100} onChange={(e) => setPlace(e.target.value)} /></Field>
      <Field name="Shop type">
        <select style={input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Not set</option>
          {TYPES.map((t) => <option key={t[0]} value={t[0]}>{t[1]}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        <ImageBox title="Logo" value={logo} set={setLogo} bad={bad} />
        <ImageBox title="Banner" value={banner} set={setBanner} bad={bad} wide />
      </div>
      <button onClick={save} disabled={busy} style={{ ...primary, opacity: busy ? 0.6 : 1 }}>{busy ? "Saving..." : "Save shop profile"}</button>
      <Msg m={m} />
    </Card>
  );
}
