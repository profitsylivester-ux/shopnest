import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import PasswordClient from "./PasswordClient";

export const metadata: Metadata = {
  title: "Change password | ShopNest",
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return (
    <SiteShell>
      <PasswordClient />
    </SiteShell>
  );
}
