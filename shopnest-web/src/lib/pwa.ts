"use client";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type W = Window & { __snInstall?: InstallEvent | null; __snInstalled?: boolean; __snWatching?: boolean };

function standalone(): boolean {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch { return false; }
}

// Called once from the root layout so the browser's install offer is caught even before a button is on screen.
export function watchInstall() {
  const w = window as W;
  if (w.__snWatching) return;
  w.__snWatching = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    w.__snInstall = e as InstallEvent;
    window.dispatchEvent(new Event("shopnest-install"));
  });
  window.addEventListener("appinstalled", () => {
    w.__snInstall = null;
    w.__snInstalled = true;
    window.dispatchEvent(new Event("shopnest-install"));
  });
}

// What the install button needs to know: can the phone install it now, is it an iPhone (needs the Share hint), is it already installed.
export function useInstall() {
  const [, tick] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    watchInstall();
    setReady(true);
    const on = () => tick((n) => n + 1);
    window.addEventListener("shopnest-install", on);
    return () => window.removeEventListener("shopnest-install", on);
  }, []);
  if (!ready) return { canInstall: false, isIos: false, installed: false, install: async () => {} };
  const w = window as W;
  const installed = standalone() || !!w.__snInstalled;
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(ua) && !installed;
  const canInstall = !!w.__snInstall && !installed;
  const install = async () => {
    const ev = w.__snInstall;
    if (!ev) return;
    try { await ev.prompt(); await ev.userChoice; } catch { /* the person closed it */ }
    w.__snInstall = null;
    window.dispatchEvent(new Event("shopnest-install"));
  };
  return { canInstall, isIos, installed, install };
}
