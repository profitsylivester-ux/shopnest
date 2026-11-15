"use client";
import { useEffect } from "react";
import { watchInstall } from "../lib/pwa";

// Mounted once in the root layout: catches the install offer and starts the service worker (live site only).
export default function PwaRegister() {
  useEffect(() => {
    watchInstall();
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const go = () => { navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => { /* the app still works without it */ }); };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }, []);
  return null;
}
