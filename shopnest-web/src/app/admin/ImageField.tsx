"use client";
import { useRef, useState } from "react";
import { imgSrc, thumbSrc, uploadImage } from "../../lib/images";
import { Btn, C } from "./ui";

// Picks a picture, uploads it, and hands back the short /uploads link.
export default function ImageField({ value, onChange, label, size = 90 }: { value: string; onChange: (url: string) => void; label: string; size?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setErr("");
    const r = await uploadImage(f);
    setBusy(false);
    if (r.ok && r.url) onChange(r.url);
    else setErr(r.error || "Upload failed");
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: "0.4rem" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ width: size, height: size, borderRadius: "10px", border: "1px dashed rgba(185,130,90,0.4)", background: "rgba(255,255,255,0.03)", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
          {value ? <img src={thumbSrc(value) || imgSrc(value)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "0.7rem", color: C.muted }}>No picture</span>}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input ref={ref} type="file" accept="image/*" onChange={(e) => pick(e.target.files?.[0])} style={{ display: "none" }} />
          <Btn small disabled={busy} onClick={() => ref.current?.click()}>{busy ? "Uploading..." : value ? "Change picture" : "Choose picture"}</Btn>
          {value && !busy && <Btn small kind="danger" onClick={() => onChange("")}>Remove</Btn>}
        </div>
      </div>
      {err && <p role="alert" style={{ color: C.bad, fontSize: "0.8rem", marginTop: "0.4rem" }}>{err}</p>}
    </div>
  );
}
