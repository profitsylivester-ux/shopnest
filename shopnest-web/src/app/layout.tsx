import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "../lib/seo";

const SITE_TITLE = "ShopNest | Multi-Vendor Marketplace";
const SITE_DESC = "Tanzania's trusted multi-vendor marketplace. Connecting local creators with buyers everywhere.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: { title: SITE_TITLE, description: SITE_DESC, url: SITE_URL, siteName: "ShopNest", type: "website", locale: "en_TZ" },
  twitter: { card: "summary", title: SITE_TITLE, description: SITE_DESC },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
