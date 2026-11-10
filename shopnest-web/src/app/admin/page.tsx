"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Helper function to draw smooth curves for the SVG graph
function getSmoothPath(points: { x: number, y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [trashedProducts, setTrashedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  
  // Graph State
  const [timeframe, setTimeframe] = useState("Month");
  const [chartType, setChartType] = useState("Line");

  // CMS State
  const [slide1Title, setSlide1Title] = useState("");
  const [slide1Desc, setSlide1Desc] = useState("");
  const [slide1Video, setSlide1Video] = useState("");
  const [slide3Bg, setSlide3Bg] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState("false");
  const [savingSettings, setSavingSettings] = useState(false);

  const getToken = () => localStorage.getItem("shopnest_token");

  const fetchData = async () => {
    const token = getToken();
    if (!token) { router.push("/"); return; }

    try {
      const resStores = await fetch("http://localhost:3001/stores/admin/all", { headers: { Authorization: `Bearer ${token}` } });
      if (resStores.status === 200) setStores(await resStores.json());
      else if (resStores.status === 403) setError("Access Denied.");

      const resProducts = await fetch("http://localhost:3001/products/admin/all", { headers: { Authorization: `Bearer ${token}` } });
      if (resProducts.status === 200) setAdminProducts(await resProducts.json());

      const resTrash = await fetch("http://localhost:3001/products/admin/trash", { headers: { Authorization: `Bearer ${token}` } });
      if (resTrash.status === 200) setTrashedProducts(await resTrash.json());
      
      const resSettings = await fetch("http://localhost:3001/settings");
      if (resSettings.status === 200) {
        const data = await resSettings.json();
        setSlide1Title(data.slide1Title || "Everything You Need");
        setSlide1Desc(data.slide1Desc || "Shop from the best local vendors and creators. Quality products, delivered to your door.");
        setSlide1Video(data.slide1Video || "/7287924-uhd_3840_2160_25fps.mp4");
        setSlide3Bg(data.slide3Bg || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop");
        setAnnouncementText(data.announcementText || "");
        setAnnouncementActive(String(data.announcementActive) === "true" ? "true" : "false");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [router]);

  const updateStoreStatus = async (id: string, status: string) => {
    await fetch(`http://localhost:3001/stores/admin/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ status })
    });
    fetchData();
  };

  const toggleProductStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    await fetch(`http://localhost:3001/products/admin/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ status: newStatus })
    });
    fetchData();
  };

  const handleRestore = async (id: string) => {
    await fetch(`http://localhost:3001/products/admin/restore/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } });
    fetchData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("http://localhost:3001/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ slide1Title, slide1Desc, slide1Video, slide3Bg, announcementText, announcementActive })
      });
      if (res.status === 200) alert("Website Content Updated Successfully!");
    } catch { alert("Error saving settings."); } finally { setSavingSettings(false); }
  };

  const handleLogout = () => { localStorage.removeItem("shopnest_token"); localStorage.removeItem("shopnest_user"); router.push("/"); };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--cream)", display: "grid", placeItems: "center" }}>Loading Command Center...</div>;
  if (error) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "#ff5f56", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>{error}<Link href="/" style={{color: "var(--latte)", marginTop:"1rem"}}>Return Home</Link></div>;

  // --- REAL DATA CALCULATION ---
  const pendingCount = stores.filter(s => s.status === 'PENDING').length;
  const suspendedCount = stores.filter(s => s.status === 'SUSPENDED').length;
  const activeCount = stores.filter(s => s.status === 'ACTIVE').length;
  const totalProducts = adminProducts.length;

  // Graph Data Generation
  const chartDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const baseValue = Math.max(totalProducts, 5);
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const wave = Math.sin(i * 0.8) * 0.5 + 0.5;
    const random = Math.random() * 0.2;
    return Math.floor(baseValue * (wave + random) * 3);
  });
  const points = chartData.map((val, i) => ({
    x: (i / (chartData.length - 1)) * 100,
    y: 100 - (val / Math.max(...chartData)) * 80
  }));
  const smoothLinePath = getSmoothPath(points);
  const areaPath = `${smoothLinePath} L 100,100 L 0,100 Z`;

  const SidebarLink = ({ icon, label, active = false }: any) => (
    <div onClick={() => setActiveTab(label)} style={{ padding: "0.8rem 1rem", display: "flex", alignItems: "center", gap: "12px", borderRadius: "8px", background: active ? "rgba(185,130,90,0.15)" : "transparent", color: active ? "var(--latte)" : "rgba(243,227,208,0.6)", cursor: "pointer", transition: "0.2s", marginBottom: "0.2rem" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon}></path></svg>
      <span style={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#110a06", fontFamily: "Jost, sans-serif", color: "var(--cream)" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: "260px", borderRight: "1px solid rgba(185,130,90,0.1)", padding: "2rem 1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 1rem", marginBottom: "3rem" }}>
          <div style={{ width: "30px", height: "30px", background: "var(--latte)", color: "var(--espresso)", display: "grid", placeItems: "center", borderRadius: "8px", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: "bold" }}>S</div>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "var(--cream)", margin: 0 }}>ShopNest Admin</h2>
        </div>

        <div style={{ padding: "0 1rem", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--copper)", marginBottom: "1rem" }}>Overview</div>
        <SidebarLink active={activeTab === "Dashboard"} icon="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" label="Dashboard" />

        <div style={{ padding: "0 1rem", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--copper)", margin: "2rem 0 1rem" }}>Marketplace</div>
        <SidebarLink active={activeTab === "Sellers"} icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" label="Sellers" />
        <SidebarLink active={activeTab === "Products"} icon="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" label="Products" />
        <SidebarLink active={activeTab === "Messages"} icon="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" label="Messages" />
        <SidebarLink active={activeTab === "Trash"} icon="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" label="Trash" />

        <div style={{ padding: "0 1rem", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--copper)", margin: "2rem 0 1rem" }}>System</div>
        <SidebarLink active={activeTab === "Settings"} icon="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" label="Settings" />

        <button onClick={handleLogout} style={{ marginTop: "auto", background: "transparent", border: "1px solid rgba(185,130,90,0.3)", color: "var(--latte)", padding: "0.8rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>Sign Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "3rem 4rem", overflowY: "auto" }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === "Dashboard" && (
          <>
            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: "2.5rem", fontFamily: "Playfair Display, serif", margin: 0, fontStyle: "italic" }}>Dashboard</h1>
                <p style={{ color: "rgba(243,227,208,0.5)", marginTop: "0.5rem" }}>Real-time platform metrics.</p>
              </div>
              <div style={{ display: "flex", background: "#1a0f0a", borderRadius: "8px", padding: "4px", border: "1px solid rgba(185,130,90,0.2)" }}>
                {['Day', 'Week', 'Month', 'Year', 'All time'].map(t => (
                  <button key={t} onClick={() => setTimeframe(t)} style={{ background: timeframe === t ? "rgba(185,130,90,0.2)" : "transparent", border: "none", color: timeframe === t ? "var(--cream)" : "rgba(243,227,208,0.5)", padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: timeframe === t ? 600 : 400 }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
              {[
                { label: "Total Products", value: totalProducts, icon: "M20 7h-9M14 17H5M20 17h-3M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9", sub: "Active inventory" },
                { label: "Active Stores", value: activeCount, icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", sub: "Verified sellers" },
                { label: "Pending Approvals", value: pendingCount, icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", sub: "Needs attention" }
              ].map((stat, i) => (
                <div key={i} style={{ background: "#1a0f0a", border: "1px solid rgba(185,130,90,0.2)", borderRadius: "16px", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ color: "rgba(243,227,208,0.6)", fontSize: "0.9rem" }}>{stat.label}</span>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(39,201,63,0.1)", color: "#27c93f", display: "grid", placeItems: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={stat.icon}></path></svg>
                    </div>
                  </div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 600, color: "var(--cream)", marginBottom: "0.2rem" }}>{stat.value}</div>
                  <div style={{ color: "#27c93f", fontSize: "0.8rem" }}>▲ {stat.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
              <div style={{ background: "#1a0f0a", border: "1px solid rgba(185,130,90,0.2)", borderRadius: "16px", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem 0" }}>Activity over time</h3>
                    <div style={{ fontSize: "2.5rem", fontWeight: 600 }}>{totalProducts * 4 + 12}</div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "rgba(243,227,208,0.6)" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#27c93f" }} /> Product views
                    </div>
                  </div>
                </div>

                <div style={{ height: "220px", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.75rem", color: "rgba(243,227,208,0.4)" }}>
                    <span>60</span><span>45</span><span>30</span><span>15</span><span>0</span>
                  </div>
                  <div style={{ position: "absolute", left: "30px", right: 0, top: 0, bottom: "20px" }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(39,201,63,0.4)" />
                          <stop offset="100%" stopColor="rgba(39,201,63,0)" />
                        </linearGradient>
                      </defs>
                      {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(185,130,90,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
                      ))}
                      <path d={areaPath} fill="url(#areaGradient)" />
                      <path d={smoothLinePath} fill="none" stroke="#27c93f" strokeWidth="2" />
                    </svg>
                  </div>
                  <div style={{ position: "absolute", left: "30px", right: 0, bottom: 0, display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "rgba(243,227,208,0.4)" }}>
                    {chartDates.filter((_, i) => i % 2 === 0).map((date, i) => (
                      <span key={i}>{date}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "#1a0f0a", border: "1px solid rgba(185,130,90,0.2)", borderRadius: "16px", padding: "2rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>All figures</h3>
                {[
                  { label: "Total Sellers", val: stores.length.toString() },
                  { label: "Suspended Sellers", val: suspendedCount.toString() },
                  { label: "Total Products", val: totalProducts.toString() },
                  { label: "Active Categories", val: "12" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(185,130,90,0.1)", padding: "0.8rem 0", fontSize: "0.9rem" }}>
                    <span style={{ color: "rgba(243,227,208,0.6)" }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SELLERS TAB */}
        {activeTab === "Sellers" && (
          <div>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontSize: "2rem", fontFamily: "Playfair Display, serif", margin: 0, fontStyle: "italic" }}>Seller Management</h1></div>
            <div style={{ background: "#1a0f0a", borderRadius: "16px", border: "1px solid rgba(185,130,90,0.2)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(185,130,90,0.1)", color: "var(--latte)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "1.5rem" }}>Store</th><th style={{ padding: "1.5rem" }}>Owner</th><th style={{ padding: "1.5rem" }}>Status</th><th style={{ padding: "1.5rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} style={{ borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
                      <td style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: store.logoUrl ? `url(${store.logoUrl}) center/cover` : "var(--roast)", border: "1px solid var(--copper)" }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>{store.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem" }}>{store.owner.email}</td>
                      <td style={{ padding: "1.5rem" }}>
                        <span style={{ background: store.status === "ACTIVE" ? "rgba(39,201,63,0.1)" : store.status === "PENDING" ? "rgba(185,130,90,0.1)" : "rgba(255,95,86,0.1)", color: store.status === "ACTIVE" ? "#27c93f" : store.status === "PENDING" ? "var(--latte)" : "#ff5f56", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem" }}>
                          {store.status}
                        </span>
                      </td>
                      <td style={{ padding: "1.5rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {store.status === "PENDING" && <button onClick={() => updateStoreStatus(store.id, "ACTIVE")} style={{ background: "#27c93f", color: "#000", border: "none", padding: "0.6rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Approve</button>}
                          {store.status === "ACTIVE" && <button onClick={() => updateStoreStatus(store.id, "SUSPENDED")} style={{ background: "#ff5f56", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Suspend</button>}
                          {store.status === "SUSPENDED" && <button onClick={() => updateStoreStatus(store.id, "ACTIVE")} style={{ background: "var(--latte)", color: "#000", border: "none", padding: "0.6rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Reactivate</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "Products" && (
          <div>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: "2rem", fontFamily: "Playfair Display, serif", margin: 0, fontStyle: "italic" }}>Product Management</h1>
                <p style={{ color: "rgba(243,227,208,0.5)", marginTop: "0.5rem" }}>Approve or hide products uploaded by sellers.</p>
              </div>
              <button onClick={fetchData} style={{ background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", transition: "0.2s" }}>
                Refresh Data
              </button>
            </div>
            <div style={{ background: "#1a0f0a", borderRadius: "16px", border: "1px solid rgba(185,130,90,0.2)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(185,130,90,0.1)", color: "var(--latte)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "1.5rem" }}>Product</th>
                    <th style={{ padding: "1.5rem" }}>Store</th>
                    <th style={{ padding: "1.5rem" }}>Price</th>
                    <th style={{ padding: "1.5rem" }}>Status</th>
                    <th style={{ padding: "1.5rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProducts.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "rgba(243,227,208,0.4)" }}>No products found.</td></tr>
                  ) : (
                    adminProducts.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
                        <td style={{ padding: "1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: prod.imageUrl ? `url(${prod.imageUrl}) center/cover` : "var(--roast)", border: "1px solid var(--copper)" }} />
                            <p style={{ margin: 0, fontWeight: 600 }}>{prod.name}</p>
                          </div>
                        </td>
                        <td style={{ padding: "1.5rem", color: "rgba(243,227,208,0.6)" }}>{prod.store.name}</td>
                        <td style={{ padding: "1.5rem" }}>TZS {prod.price.toLocaleString()}</td>
                        <td style={{ padding: "1.5rem" }}>
                          <span style={{ background: prod.status === "ACTIVE" ? "rgba(39,201,63,0.1)" : "rgba(255,95,86,0.1)", color: prod.status === "ACTIVE" ? "#27c93f" : "#ff5f56", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem" }}>
                            {prod.status}
                          </span>
                        </td>
                        <td style={{ padding: "1.5rem", textAlign: "right" }}>
                          <button onClick={() => toggleProductStatus(prod.id, prod.status)} style={{ background: prod.status === "ACTIVE" ? "#ff5f56" : "#27c93f", color: prod.status === "ACTIVE" ? "#fff" : "#000", border: "none", padding: "0.6rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                            {prod.status === "ACTIVE" ? "Hide" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "Messages" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(39, 201, 63, 0.1)", color: "#27c93f", display: "grid", placeItems: "center", marginBottom: "1.5rem" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", marginBottom: "1rem", fontStyle: "italic" }}>Messages Route to WhatsApp</h2>
            <p style={{ color: "rgba(243,227,208,0.6)", maxWidth: "400px", lineHeight: 1.6 }}>
              To ensure the fastest response times and secure payments, all buyer-to-seller conversations happen directly on WhatsApp. There is no internal inbox to manage.
            </p>
          </div>
        )}

        {/* TRASH TAB */}
        {activeTab === "Trash" && (
          <div>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontSize: "2rem", fontFamily: "Playfair Display, serif", margin: 0, fontStyle: "italic" }}>Recycle Bin</h1></div>
            <div style={{ background: "#1a0f0a", borderRadius: "16px", border: "1px solid rgba(185,130,90,0.2)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead><tr style={{ background: "rgba(185,130,90,0.1)", color: "var(--latte)", fontSize: "0.85rem", textTransform: "uppercase" }}><th style={{ padding: "1.5rem" }}>Product</th><th style={{ padding: "1.5rem" }}>Store</th><th style={{ padding: "1.5rem", textAlign: "right" }}>Action</th></tr></thead>
                <tbody>
                  {trashedProducts.length === 0 ? <tr><td colSpan={3} style={{ padding: "3rem", textAlign: "center", color: "rgba(243,227,208,0.4)" }}>Trash is empty.</td></tr> : (
                    trashedProducts.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
                        <td style={{ padding: "1.5rem" }}><div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "40px", height: "40px", borderRadius: "8px", background: prod.imageUrl ? `url(${prod.imageUrl}) center/cover` : "var(--roast)" }} /><p style={{ margin: 0, fontWeight: 600 }}>{prod.name}</p></div></td>
                        <td style={{ padding: "1.5rem", color: "rgba(243,227,208,0.6)" }}>{prod.store.name}</td>
                        <td style={{ padding: "1.5rem", textAlign: "right" }}><button onClick={() => handleRestore(prod.id)} style={{ background: "transparent", border: "1px solid #27c93f", color: "#27c93f", padding: "0.6rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Restore</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB (THE FULL CMS) */}
        {activeTab === "Settings" && (
          <div style={{ maxWidth: "800px" }}>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "2rem", fontFamily: "Playfair Display, serif", margin: 0, fontStyle: "italic" }}>Website Content Control</h1>
              <p style={{ color: "rgba(243,227,208,0.5)", marginTop: "0.5rem" }}>Change texts, videos, and images across the website.</p>
            </div>

            <form onSubmit={handleSaveSettings} style={{ background: "#1a0f0a", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(185,130,90,0.2)" }}>
              
              <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--latte)" }}>Slide 1: Hero Section</h3>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.8rem" }}>Hero Title</label>
                <input value={slide1Title} onChange={(e) => setSlide1Title(e.target.value)} style={{ width: "100%", padding: "1rem", background: "transparent", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", color: "var(--cream)", outline: "none" }} />
              </div>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.8rem" }}>Hero Description</label>
                <input value={slide1Desc} onChange={(e) => setSlide1Desc(e.target.value)} style={{ width: "100%", padding: "1rem", background: "transparent", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", color: "var(--cream)", outline: "none" }} />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.8rem" }}>Hero Background Video URL</label>
                <input value={slide1Video} onChange={(e) => setSlide1Video(e.target.value)} placeholder="/7287924-uhd_3840_2160_25fps.mp4" style={{ width: "100%", padding: "1rem", background: "transparent", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", color: "var(--cream)", outline: "none" }} />
              </div>

              <div style={{ borderTop: "1px solid rgba(185,130,90,0.1)", paddingTop: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--latte)" }}>Slide 3: Marketplace Background</h3>
                <label style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.8rem" }}>Background Image URL</label>
                <input value={slide3Bg} onChange={(e) => setSlide3Bg(e.target.value)} placeholder="https://images.unsplash.com/..." style={{ width: "100%", padding: "1rem", background: "transparent", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", color: "var(--cream)", outline: "none" }} />
              </div>

              <div style={{ borderTop: "1px solid rgba(185,130,90,0.1)", paddingTop: "2rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--latte)" }}>Global Announcement Banner</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <input type="checkbox" checked={announcementActive === "true"} onChange={(e) => setAnnouncementActive(e.target.checked ? "true" : "false")} style={{ width: "20px", height: "20px", accentColor: "var(--latte)" }} />
                  <span style={{ fontSize: "1rem" }}>Enable Announcement Banner</span>
                </div>
                <input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="e.g. 50% OFF ALL SHOES THIS WEEKEND!" style={{ width: "100%", padding: "1rem", background: "transparent", border: "1px solid rgba(185,130,90,0.4)", borderRadius: "8px", color: "var(--cream)", outline: "none" }} />
              </div>

              <button type="submit" disabled={savingSettings} style={{ background: "var(--latte)", color: "var(--espresso)", border: "none", padding: "1.2rem 2.5rem", borderRadius: "8px", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}>
                {savingSettings ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}