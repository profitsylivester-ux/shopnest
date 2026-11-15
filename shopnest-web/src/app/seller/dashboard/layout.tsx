import Assistant from "../../../components/Assistant";

// The seller dashboard is always dark; the ShopNest assistant helps sellers with setup right there.
export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Assistant forceTheme="dark" />
    </>
  );
}
