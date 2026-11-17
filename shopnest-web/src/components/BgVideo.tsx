"use client";
import { useEffect, useRef, useState } from "react";

// Background video that fits the device: small file on phones and slow networks, medium on
// laptops, large only on very big screens. Nothing is downloaded until the best size is chosen.
// With Data Saver or "reduce motion" on, only the still picture is shown. Only the slide the
// visitor is looking at keeps playing, so the phone is not decoding two videos at once.

type Kind = "hero" | "story";
type Tier = "none" | "s" | "m" | "l";

const FILES: Record<Kind, { s: string; m: string; l: string; poster: string }> = {
  hero: { s: "/video/hero-480.mp4", m: "/video/hero-720.mp4", l: "/video/hero-1080.mp4", poster: "/video/hero-poster.jpg" },
  story: { s: "/video/story-480.mp4", m: "/video/story-720.mp4", l: "/video/story-720.mp4", poster: "/video/story-poster.jpg" },
};

// The two original big files were removed; if a saved setting still points at one, use the built-in set.
const REMOVED = ["/7287924-uhd_3840_2160_25fps.mp4", "/8938253-hd_1080_1920_30fps.mp4"];

export function pickTier(): Tier {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "none";
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    const c = nav.connection;
    if (c && c.saveData) return "none";
    const type = String((c && c.effectiveType) || "");
    if (type === "slow-2g" || type === "2g") return "none";
    if (type === "3g") return "s";
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return "s";
    const w = window.innerWidth;
    if (w <= 700) return "s";
    if (w >= 1700) return "l";
    return "m";
  } catch {
    return "m";
  }
}

export default function BgVideo({ kind, src, active, start = true }: { kind: Kind; src?: string; active: boolean; start?: boolean }) {
  const [tier, setTier] = useState<Tier | null>(null);
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const set = FILES[kind];

  useEffect(() => { setTier(pickTier()); }, []);
  useEffect(() => { if (start) setGo(true); }, [start]);

  const custom = src && !REMOVED.includes(src) ? src : "";
  const file = custom || (tier === "s" || tier === "m" || tier === "l" ? set[tier] : "");

  useEffect(() => {
    const v = ref.current;
    if (!v || !file) return;
    if (active) { const p = v.play(); if (p && typeof p.catch === "function") p.catch(() => {}); }
    else v.pause();
  }, [active, file, go]);

  // Before the size is chosen, with Data Saver, or before this slide is near: still picture only.
  if (tier === null || tier === "none" || !go || !file) {
    return <video className="bg" poster={set.poster} muted playsInline preload="none" aria-hidden="true" />;
  }
  return (
    <video ref={ref} className="bg" key={file} poster={set.poster} autoPlay={active} muted loop playsInline preload="auto" aria-hidden="true">
      <source src={file} type="video/mp4" />
    </video>
  );
}
