import { API_URL } from "./seo";

type TrackPayload = {
  type: "SHOP_VIEW" | "PRODUCT_VIEW" | "WHATSAPP_CLICK";
  productId?: string;
  storeSlug?: string;
  source: "home" | "store" | "product";
};

// Sellers and admins are not counted, so checking your own shop does not inflate your numbers.
function isStaffViewer(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem("shopnest_user") || "null");
    const role = String(user?.role || "").toUpperCase();
    if (role === "SELLER" || role === "ADMIN") return true;
    const token = localStorage.getItem("shopnest_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const tokenRole = String(payload?.role || "").toUpperCase();
      return tokenRole === "SELLER" || tokenRole === "ADMIN";
    }
  } catch {
    /* ignore: tracking must never break the page */
  }
  return false;
}

export function trackEvent(payload: TrackPayload): void {
  try {
    if (typeof window === "undefined" || isStaffViewer()) return;
    fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// Counts a page view once per browser tab session, so refreshing does not add more views.
export function trackViewOnce(payload: TrackPayload): void {
  try {
    const key = `shopnest_seen_${payload.type}_${payload.productId || payload.storeSlug || ""}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked: count it anyway */
  }
  trackEvent(payload);
}
