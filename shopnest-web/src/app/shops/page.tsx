import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import ShopsClient from "./ShopsClient";

export const metadata: Metadata = {
  title: "Shops | ShopNest",
  description: "Real sellers on ShopNest. Open a shop to see everything they sell.",
};

export default function ShopsPage() {
  return (
    <SiteShell>
      <ShopsClient />
    </SiteShell>
  );
}
