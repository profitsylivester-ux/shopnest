export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export async function getJson(path: string, revalidate = 300): Promise<any | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function clip(text: unknown, max: number): string {
  const s = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  return s.length > max ? s.slice(0, max - 3).trimEnd() + "..." : s;
}

export function productImageUrl(product: any): string | null {
  const u = product?.imageUrl;
  if (typeof u !== "string" || !u) return null;
  if (u.startsWith("data:")) return `${API_URL}/products/public/${product.id}/image`;
  return /^https?:\/\//.test(u) ? u : null;
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
