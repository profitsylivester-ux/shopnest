"use client";
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "shopnest_theme";

function read(def: Theme): Theme {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "dark" || v === "light") return v;
  } catch { /* storage blocked */ }
  return def;
}

// Light or dark look. Remembered in the browser; until the visitor chooses, the shop pages are light and the home page is dark.
export function useTheme(def: Theme = "light"): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(def);
  useEffect(() => {
    setTheme(read(def));
    const on = () => setTheme(read(def));
    window.addEventListener("shopnest-theme", on);
    return () => window.removeEventListener("shopnest-theme", on);
  }, [def]);
  const toggle = useCallback(() => {
    const next: Theme = read(def) === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked */ }
    setTheme(next);
    window.dispatchEvent(new Event("shopnest-theme"));
  }, [def]);
  return [theme, toggle];
}
