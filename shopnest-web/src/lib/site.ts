"use client";
import { useEffect, useState } from "react";
import { API_URL } from "./seo";
import type { Lang } from "./i18n";

export async function getJsonClient(path: string): Promise<any | null> {
  try {
    const res = await fetch(API_URL + path);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export type Cat = { id: string; nameEn: string; nameSw: string | null; imageUrl: string | null };
export const catLabel = (c: { nameEn: string; nameSw: string | null }, lang: Lang) => (lang === "SW" && c.nameSw ? c.nameSw : c.nameEn);

let catCache: Cat[] | null = null;
// The categories the admin manages (Admin > Categories). Empty until loaded or if the backend is down.
export function useCategories(): Cat[] {
  const [cats, setCats] = useState<Cat[]>(catCache || []);
  useEffect(() => {
    if (catCache) return;
    let dead = false;
    getJsonClient("/content/categories").then((d) => {
      if (Array.isArray(d)) { catCache = d; if (!dead) setCats(d); }
    });
    return () => { dead = true; };
  }, []);
  return cats;
}

export type MenuChild = { id: string; labelEn: string; labelSw: string | null; href: string };
export type MenuItemT = MenuChild & { children: MenuChild[] };
export type MenuData = { navbar: MenuItemT[]; footer: MenuItemT[] };

let menuCache: MenuData | null = null;
// The menus the admin edits (Admin > Menu). Both lists are empty until the admin adds items.
export function useMenu(): MenuData | null {
  const [m, setM] = useState<MenuData | null>(menuCache);
  useEffect(() => {
    if (menuCache) return;
    let dead = false;
    getJsonClient("/content/menu").then((d) => {
      const data: MenuData = { navbar: Array.isArray(d?.navbar) ? d.navbar : [], footer: Array.isArray(d?.footer) ? d.footer : [] };
      menuCache = data;
      if (!dead) setM(data);
    });
    return () => { dead = true; };
  }, []);
  return m;
}

export type SessionUser = { id: string; email: string; role: string; name: string };
export function signOutUser(): void {
  try {
    const token = localStorage.getItem("shopnest_token");
    if (token) fetch(API_URL + "/auth/logout", { method: "POST", headers: { Authorization: "Bearer " + token }, keepalive: true }).catch(() => {});
    localStorage.removeItem("shopnest_token");
    localStorage.removeItem("shopnest_user");
  } catch { /* ignore */ }
  window.dispatchEvent(new Event("shopnest-auth"));
}

export function readUser(): SessionUser | null {
  try {
    const u = JSON.parse(localStorage.getItem("shopnest_user") || "null");
    return u && typeof u.email === "string" ? u : null;
  } catch {
    return null;
  }
}
