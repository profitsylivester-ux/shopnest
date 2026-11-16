import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "../lib/seo";
import PwaRegister from "../components/PwaRegister";

const SITE_TITLE = "ShopNest | Multi-Vendor Marketplace";
const SITE_DESC = "Tanzania's trusted multi-vendor marketplace. Connecting local creators with buyers everywhere.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: { title: SITE_TITLE, description: SITE_DESC, url: SITE_URL, siteName: "ShopNest", type: "website", locale: "en_TZ" },
  twitter: { card: "summary", title: SITE_TITLE, description: SITE_DESC },
  applicationName: "ShopNest",
  appleWebApp: { capable: true, title: "ShopNest", statusBarStyle: "black-translucent" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], shortcut: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#1a0f0a", width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}<PwaRegister /></body>
    </html>
  );
}
