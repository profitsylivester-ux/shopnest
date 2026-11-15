import { API_URL } from "./seo";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadResult = { ok: boolean; url: string; error: string };

// Turns a stored picture link into something a browser can load.
// New pictures are stored as short paths like /uploads/<id>.webp; old ones are full links or data images.
export function imgSrc(u?: string | null): string {
  if (!u) return "";
  return u.startsWith("/uploads/") ? API_URL + u : u;
}

// Small 480px version for cards. Old pictures have no small version, so they are returned as they are.
export function thumbSrc(u?: string | null): string {
  if (u && u.startsWith("/uploads/") && !u.endsWith("-sm.webp")) return API_URL + u.replace(/\.webp$/, "-sm.webp");
  return imgSrc(u);
}

// Used only for files the server would refuse (over 5 MB or not JPG/PNG/WebP): shrink to JPEG in the browser first.
function shrink(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 2400 / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * s));
      const h = Math.max(1, Math.round(img.height * s));
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); resolve(null); return; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => resolve(b), "image/jpeg", 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const fail = (error: string): UploadResult => ({ ok: false, url: "", error });
  if (!file.type.startsWith("image/")) return fail("Please choose a picture (JPG, PNG or WebP).");
  let body: Blob = file;
  let name = file.name || "photo";
  if (!OK_TYPES.includes(file.type) || file.size > MAX_BYTES) {
    const b = await shrink(file);
    if (!b) return fail("Could not read this picture. Try a JPG, PNG or WebP photo.");
    body = b;
    name = "photo.jpg";
  }
  if (body.size > MAX_BYTES) return fail("That picture is still too big (limit 5 MB).");
  const fd = new FormData();
  fd.append("file", body, name);
  try {
    const res = await fetch(API_URL + "/uploads", { method: "POST", headers: { Authorization: "Bearer " + (localStorage.getItem("shopnest_token") || "") }, body: fd });
    let data: any = null;
    try { data = await res.json(); } catch { data = null; }
    if (res.ok && data && typeof data.url === "string") return { ok: true, url: data.url, error: "" };
    if (res.status === 401) return fail("Your session ended. Please sign in again.");
    if (res.status === 413) return fail("That picture is too big (limit 5 MB).");
    const m = data && data.message;
    return fail(typeof m === "string" ? m : "Upload failed. Try again.");
  } catch {
    return fail("Could not reach the server. Is the backend running?");
  }
}