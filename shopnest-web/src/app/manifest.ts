import type { MetadataRoute } from "next";

// The install file: lets a phone add ShopNest to the home screen and open it like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ShopNest",
    short_name: "ShopNest",
    description: "Tanzania's trusted multi-vendor marketplace. Connecting local creators with buyers everywhere.",
    start_url: "/marketplace",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a0f0a",
    theme_color: "#1a0f0a",
    lang: "en",
    categories: ["shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
