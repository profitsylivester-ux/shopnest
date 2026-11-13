"use client";
import { useState } from "react";

type Bucket = { key: string; shopViews: number; productViews: number; whatsappClicks: number };

const METRICS = [
  { key: "whatsappClicks", label: "WhatsApp clicks" },
  { key: "productViews", label: "Product views" },
  { key: "shopViews", label: "Shop views" },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MUTED = "rgba(243,227,208,0.5)";
const selectStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", color: "var(--cream)", border: "1px solid rgba(185,130,90,0.3)", borderRadius: "8px", padding: "0.45rem 0.8rem", fontSize: "0.85rem", fontFamily: "Jost, sans-serif", cursor: "pointer" };
const optionStyle: React.CSSProperties = { background: "#1a0f0a", color: "#f3e3d0" };

function labelFor(key: string, g: string) {
  if (g === "hour") return key.slice(11, 13) + ":00";
  const month = MONTHS[parseInt(key.slice(5, 7), 10) - 1] || "";
  if (g === "month") return month + " " + key.slice(2, 4);
  return parseInt(key.slice(8, 10), 10) + " " + month;
}

function niceStep(raw: number) {
  if (raw <= 1) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

export default function TrendChart({ buckets, granularity }: { buckets: Bucket[]; granularity: string }) {
  const [metric, setMetric] = useState("whatsappClicks");
  const [kind, setKind] = useState("bar");
  const m = METRICS.find((x) => x.key === metric) || METRICS[0];
  const values: number[] = buckets.map((b) => (b as any)[m.key] as number);
  const total = values.reduce((a, b) => a + b, 0);

  const W = 800, H = 260, L = 44, R = 14, T = 14, B = 30;
  const pw = W - L - R, ph = H - T - B;
  const step = niceStep(Math.max(...values, 1) / 4);
  const top = step * 4;
  const n = Math.max(values.length, 1);
  const slot = pw / n;
  const x = (i: number) => L + slot * i + slot / 2;
  const y = (v: number) => T + ph - (v / top) * ph;
  const every = Math.ceil(n / 8);
  const bw = Math.min(44, slot * 0.6);
  const linePath = values.map((v, i) => (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const areaPath = values.length > 1 ? linePath + " L" + x(values.length - 1).toFixed(1) + " " + (T + ph) + " L" + x(0).toFixed(1) + " " + (T + ph) + " Z" : "";

  return (
    <div style={{ background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--cream)", margin: 0 }}>Activity trend</h3>
          <p style={{ color: MUTED, fontSize: "0.8rem", margin: "0.25rem 0 0 0" }}>{total.toLocaleString()} {total === 1 ? m.label.toLowerCase().slice(0, -1) : m.label.toLowerCase()} in this period</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <select aria-label="What to show" value={metric} onChange={(e) => setMetric(e.target.value)} style={selectStyle}>
            {METRICS.map((o) => (<option key={o.key} value={o.key} style={optionStyle}>{o.label}</option>))}
          </select>
          <select aria-label="Chart type" value={kind} onChange={(e) => setKind(e.target.value)} style={selectStyle}>
            <option value="bar" style={optionStyle}>Bar chart</option>
            <option value="line" style={optionStyle}>Line chart</option>
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={m.label + " " + kind + " chart"} style={{ display: "block", fontFamily: "Jost, sans-serif" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(step * i)} y2={y(step * i)} style={{ stroke: "rgba(185,130,90,0.12)" }} strokeWidth="1" />
            <text x={L - 8} y={y(step * i) + 4} textAnchor="end" fontSize="11" style={{ fill: MUTED }}>{step * i}</text>
          </g>
        ))}
        {kind === "bar" ? (
          values.map((v, i) => (
            <rect key={i} x={x(i) - bw / 2} y={y(v)} width={bw} height={T + ph - y(v)} rx="3" style={{ fill: "var(--latte)" }} />
          ))
        ) : (
          <g>
            {areaPath && <path d={areaPath} style={{ fill: "rgba(217,164,124,0.12)" }} />}
            <path d={linePath} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--latte)" }} />
            {values.length <= 31 && values.map((v, i) => (<circle key={i} cx={x(i)} cy={y(v)} r="3.5" style={{ fill: "var(--latte)" }} />))}
          </g>
        )}
        {values.map((v, i) => (
          <rect key={"h" + i} x={L + slot * i} y={T} width={slot} height={ph} style={{ fill: "transparent" }}>
            <title>{labelFor(buckets[i].key, granularity) + ": " + v + " " + m.label.toLowerCase()}</title>
          </rect>
        ))}
        {values.map((v, i) => (i % every === 0 ? (
          <text key={"x" + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" style={{ fill: MUTED }}>{labelFor(buckets[i].key, granularity)}</text>
        ) : null))}
      </svg>
      {total === 0 && <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0.8rem 0 0 0", textAlign: "center" }}>No {m.label.toLowerCase()} in this period yet.</p>}
    </div>
  );
}
