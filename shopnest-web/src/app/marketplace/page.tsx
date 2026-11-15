import type { Metadata } from "next";
import { Suspense } from "react";
import SiteShell from "../../components/SiteShell";
import MarketplaceClient from "./MarketplaceClient";

export const metadata: Metadata = {
  title: "Marketplace | ShopNest",
  description: "Browse products from real sellers in Tanzania and chat with the seller directly on WhatsApp.",
};

export default function MarketplacePage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="sn-wrap sn-pad">Loading...</div>}>
        <MarketplaceClient />
      </Suspense>
    </SiteShell>
  );
}
