import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopNest | Multi-Vendor Marketplace",
  description: "Tanzania's trusted multi-vendor marketplace. Connecting local creators with buyers everywhere.",
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
