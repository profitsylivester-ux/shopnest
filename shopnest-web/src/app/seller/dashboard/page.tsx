"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Seller");
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Store Form State (Onboarding)
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [location, setLocation] = useState("");
  const [shopType, setShopType] = useState("Online");
  const [submitting, setSubmitting] = useState(false);

  // Edit Store State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [eName, setEName] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [eWhatsapp, setEWhatsapp] = useState("");
  const [eLogo, setELogo] = useState("");
  const [eBanner, setEBanner] = useState("");
  const [eSubmitting, setESubmitting] = useState(false);

  // Product Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pImage, setPImage] = useState("");
  const [pStock, setPStock] = useState("1");
  const [pSubmitting, setPSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("shopnest_token");

  const fetchData = async () => {
    const token = getToken();
    const userStr = localStorage.getItem("shopnest_user");
    
    if (!token) { router.push("/"); return; }
    if (userStr) {
      try { setUserName(JSON.parse(userStr).name.split(" ")[0]); } catch(e){}
    }

    try {
      const resStore = await fetch("http://localhost:3001/stores/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (resStore.status === 200) {
        const storeData = await resStore.json();
        setStore(storeData);
        
        setEName(storeData.name || "");
        setEDesc(storeData.description || "");
        setEWhatsapp(storeData.whatsappNumber || "");
        setELogo(storeData.logoUrl || "");
        setEBanner(storeData.bannerUrl || "");

        const resProd = await fetch("http://localhost:3001/products/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resProd.status === 200) {
          setProducts(await resProd.json());
        }
      } else if (resStore.status === 401) {
        localStorage.removeItem("shopnest_token"); router.push("/");
      } else if (resStore.status === 404) {
        setStore(null);
      }
    } catch {
      setError("Network error. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be less than 5MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setter(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await fetch("http://localhost:3001/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, description: desc, whatsappNumber: whatsapp, logoUrl: logo, bannerUrl: banner, location, shopType }),
      });
      if (res.status === 201) {
        fetchData();
      } else {
        const d = await res.json(); setError(d.message || "Failed.");
      }
    } catch { setError("Network error."); } finally { setSubmitting(false); }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setESubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/stores/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: eName, description: eDesc, whatsappNumber: eWhatsapp, logoUrl: eLogo, bannerUrl: eBanner }),
      });
      if (res.status === 200) {
        setIsEditOpen(false);
        fetchData();
      } else { alert("Failed to update store."); }
    } catch { alert("Network error."); } finally { setESubmitting(false); }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setPSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: pName, price: parseFloat(pPrice), description: pDesc, imageUrl: pImage, stockQuantity: parseInt(pStock || "0", 10) }),
      });
      if (res.status === 201) {
        setIsPanelOpen(false); setPName(""); setPPrice(""); setPDesc(""); setPImage(""); setPStock("1");
        fetchData();
      } else { alert("Failed to add product."); }
    } catch { alert("Network error."); } finally { setPSubmitting(false); }
  };

  const openAddPanel = () => {
    if (editingId) { setPName(""); setPPrice(""); setPDesc(""); setPImage(""); setPStock("1"); }
    setEditingId(null);
    setIsPanelOpen(true);
  };

  const openEditPanel = (prod: any) => {
    setEditingId(prod.id);
    setPName(prod.name || "");
    setPPrice(String(prod.price ?? ""));
    setPDesc(prod.description || "");
    setPImage(prod.imageUrl || "");
    setPStock(String(prod.stockQuantity ?? 1));
    setIsPanelOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setPSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/products/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: pName, price: parseFloat(pPrice), description: pDesc, imageUrl: pImage, stockQuantity: parseInt(pStock || "0", 10) }),
      });
      if (res.status === 200) {
        setIsPanelOpen(false); setEditingId(null); setPName(""); setPPrice(""); setPDesc(""); setPImage(""); setPStock("1");
        fetchData();
      } else if (res.status === 403) { alert("You can only edit your own products."); }
      else if (res.status === 404) { alert("Product not found."); }
      else { alert("Failed to update product."); }
    } catch { alert("Network error."); } finally { setPSubmitting(false); }
  };

  const toggleProductStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    try {
      await fetch(`http://localhost:3001/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchData();
    } catch { alert("Failed to update status."); }
  };

  const handleLogout = () => {
    localStorage.removeItem("shopnest_token"); localStorage.removeItem("shopnest_user"); router.push("/");
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--text-light)", display: "grid", placeItems: "center" }}>Loading Workspace...</div>;

  // --- ONBOARDING LAYOUT ---
  if (!store) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--espresso)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Jost, sans-serif" }}>
         <div style={{ width: "100%", maxWidth: "900px" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "4rem", color: "var(--cream)", margin: "0 0 1rem 0", fontStyle: "italic" }}>Launch Your Store.</h1>
            <p style={{ color: "rgba(243,227,208,0.6)", fontSize: "1.1rem" }}>Fill in the details below. Your store will be reviewed by Admin before going live.</p>
          </div>
          {error && <div style={{ textAlign: "center", color: "#ff5f56", marginBottom: "2rem" }}>{error}</div>}
          <form onSubmit={handleCreateStore} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Store Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juma's Boutique" style={{ borderBottom: "1px solid rgba(185,130,90,0.4)", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, background: "transparent", padding: "1rem 0" }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>WhatsApp Number *</label>
                <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+255..." style={{ borderBottom: "1px solid rgba(185,130,90,0.4)", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, background: "transparent", padding: "1rem 0" }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Short Description</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What do you sell?" style={{ borderBottom: "1px solid rgba(185,130,90,0.4)", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, background: "transparent", padding: "1rem 0" }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Location (City/Region)</label>
                <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dar es Salaam" style={{ borderBottom: "1px solid rgba(185,130,90,0.4)", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, background: "transparent", padding: "1rem 0" }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Shop Type</label>
                <select value={shopType} onChange={(e) => setShopType(e.target.value)} style={{ width: "100%", borderBottom: "1px solid rgba(185,130,90,0.4)", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: 0, background: "transparent", padding: "1rem 0", color: "var(--cream)", outline: "none" }}>
                  <option value="Online" style={{ color: "black" }}>Online Seller</option>
                  <option value="Physical" style={{ color: "black" }}>Physical Shop</option>
                  <option value="Both" style={{ color: "black" }}>Both (Online & Physical)</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Store Logo (Optional)</label>
                <label style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", border: "1px dashed rgba(185,130,90,0.4)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "0.3s" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <div>
                    <p style={{ color: "var(--cream)", margin: 0, fontSize: "0.9rem" }}>Click to browse</p>
                    {logo ? <p style={{ color: "#27c93f", margin: 0, fontSize: "0.75rem" }}>✓ Image Selected</p> : <p style={{ color: "rgba(243,227,208,0.4)", margin: 0, fontSize: "0.75rem" }}>Upload from device</p>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLogo)} style={{ display: "none" }} />
                </label>
              </div>
              <div>
                <label style={{ display: "block", color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Cover Banner (Optional)</label>
                <label style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", border: "1px dashed rgba(185,130,90,0.4)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "0.3s" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <div>
                    <p style={{ color: "var(--cream)", margin: 0, fontSize: "0.9rem" }}>Click to browse</p>
                    {banner ? <p style={{ color: "#27c93f", margin: 0, fontSize: "0.75rem" }}>✓ Image Selected</p> : <p style={{ color: "rgba(243,227,208,0.4)", margin: 0, fontSize: "0.75rem" }}>Upload from device</p>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBanner)} style={{ display: "none" }} />
                </label>
              </div>
            </div>
            <div style={{ gridColumn: "span 2", marginTop: "2rem", textAlign: "center" }}>
              <button type="submit" disabled={submitting} style={{ background: "var(--latte)", color: "var(--espresso)", border: "none", padding: "1.2rem 4rem", fontSize: "0.9rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600, borderRadius: "50px" }}>
                {submitting ? "Initializing..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.status === "ACTIVE");

  // --- MAIN DASHBOARD ---
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--espresso)", fontFamily: "Jost, sans-serif" }}>
      
      {/* FULL SIDEBAR */}
      <aside style={{ width: "240px", background: "var(--roast)", display: "flex", flexDirection: "column", padding: "2rem 1rem", borderRight: "1px solid rgba(185,130,90,0.1)", position: "fixed", height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "3rem", padding: "0 1rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
             <div style={{ width: "30px", height: "30px", background: "var(--latte)", color: "var(--espresso)", display: "grid", placeItems: "center", borderRadius: "8px", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: "bold" }}>S</div>
             <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "var(--cream)", margin: 0 }}>ShopNest</h2>
          </Link>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, overflowY: "auto" }}>
          {[
            { icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", label: "Home" },
            { icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z", label: "Dashboard" },
            { icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", label: "Products" },
            { icon: "M18 20V10M12 20V4M6 20v-6", label: "All Stats" },
            { icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", label: "Messages" },
            { icon: "M8 2v4M16 2v4M3 10h18M21 14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z", label: "Schedule" },
            { icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", label: "Favorite" },
            { icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z", label: "Settings" },
          ].map((item, i) => (
            <div key={i} onClick={() => setActiveTab(item.label)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.8rem 1rem", borderRadius: "8px", background: activeTab === item.label ? "rgba(185,130,90,0.15)" : "transparent", color: activeTab === item.label ? "var(--latte)" : "rgba(243,227,208,0.6)", cursor: "pointer", transition: "0.3s" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}></path></svg>
              <span style={{ fontSize: "0.9rem", fontWeight: activeTab === item.label ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}
        </nav>

        <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(185,130,90,0.3)", color: "var(--latte)", padding: "0.8rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", marginTop: "1rem", width: "100%", marginBottom: "1.5rem" }}>Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, marginLeft: "240px", padding: "2rem 3rem", overflowY: "auto" }}>
        
        {/* NEW HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
            <div style={{ width: "50px", height: "50px", background: "var(--roast)", borderRadius: "12px", border: "1px solid rgba(185,130,90,0.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "1.5rem", fontFamily: "Cormorant Garamond, serif", color: "var(--latte)", fontWeight: "bold" }}>
                  {store.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            
            <div>
              <p style={{ color: "var(--text-light)", opacity: 0.7, fontSize: "0.85rem", margin: 0, marginBottom: "0.2rem" }}>Good evening, {userName}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: "var(--cream)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{store.name}</h1>
                <span style={{ background: store.status === "ACTIVE" ? "rgba(39,201,63,0.15)" : "rgba(185,130,90,0.15)", color: store.status === "ACTIVE" ? "#27c93f" : "var(--latte)", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", border: store.status === "ACTIVE" ? "1px solid rgba(39,201,63,0.3)" : "1px solid rgba(185,130,90,0.3)" }}>
                  {store.status === "ACTIVE" ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href={`/store/${store.slug}`} target="_blank" style={{ background: "var(--latte)", border: "none", color: "var(--espresso)", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center" }}>Visit Public Store</Link>
            <button onClick={() => setIsEditOpen(true)} style={{ background: "transparent", border: "1px solid rgba(185,130,90,0.4)", color: "var(--latte)", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", transition: "0.3s" }}>Edit Profile</button>
          </div>
        </div>

        {/* PREMIUM PENDING BANNER */}
        {store.status === "PENDING" && (
          <div style={{ 
            background: "linear-gradient(90deg, rgba(185,130,90,0.1) 0%, rgba(26,15,10,0) 100%)", 
            borderLeft: "2px solid var(--latte)", 
            padding: "1.2rem 2rem", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "2rem",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--latte)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <p style={{ margin: 0, color: "var(--cream)", fontSize: "0.95rem", letterSpacing: "0.02em" }}>Your store is currently under review. We will notify you once it is approved.</p>
            </div>
            <span style={{ color: "var(--latte)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Reviewing</span>
          </div>
        )}

        {/* --- DASHBOARD TAB --- */}
        {activeTab === "Dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* HERO BANNER */}
              <div style={{ background: store.bannerUrl ? `url(${store.bannerUrl}) center/cover` : "linear-gradient(135deg, var(--roast), var(--copper))", borderRadius: "16px", padding: "3rem", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "220px" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(26,15,10,0.95) 0%, rgba(26,15,10,0.6) 100%)" }} />
                <div style={{ position: "relative", zIndex: 1, maxWidth: "60%" }}>
                  <p style={{ color: "var(--latte)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Your Storefront</p>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--cream)", margin: "0 0 1rem 0", lineHeight: 1.1, fontStyle: "italic" }}>{store.name}</h2>
                  <p style={{ color: "rgba(243,227,208,0.9)", fontSize: "1rem", lineHeight: 1.5, fontStyle: "italic", maxWidth: "400px" }}>
                    "{store.description || "Welcome to our boutique. Explore our premium selection."}"
                  </p>
                </div>
              </div>

              {/* CHART */}
              <div style={{ background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" }}>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--cream)", margin: "0 0 1.5rem 0" }}>Product Sold</h3>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "120px", gap: "10px", paddingBottom: "1rem", borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
                  {[10, 30, 20, 60, 40, 20, 50].map((h, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "100%", height: `${h}%`, background: i === 3 ? "var(--latte)" : "rgba(185,130,90,0.2)", borderRadius: "4px 4px 0 0" }} />
                      <span style={{ fontSize: "0.65rem", color: "rgba(243,227,208,0.5)" }}>{["M","T","W","T","F","S","S"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--cream)", margin: 0 }}>Our Top Collection</h3>
                  <button onClick={openAddPanel} style={{ background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.4rem 1rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", transition: "0.3s" }}>+ Add Product</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  {activeProducts.length === 0 ? (
                    <p style={{ color: "rgba(243,227,208,0.4)", fontSize: "0.9rem", gridColumn: "span 3", textAlign: "center", padding: "2rem 0" }}>No active products yet.</p>
                  ) : (
                    activeProducts.slice(0, 3).map((prod) => (
                      <div key={prod.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(185,130,90,0.2)", borderRadius: "12px", overflow: "hidden" }}>
                        <div style={{ height: "100px", background: prod.imageUrl ? `url(${prod.imageUrl}) center/contain no-repeat, linear-gradient(rgba(17,10,6,0.72), rgba(17,10,6,0.72)), url(${prod.imageUrl}) center/cover` : "var(--espresso)" }} />
                        <div style={{ padding: "0.8rem" }}>
                          <p style={{ color: "var(--cream)", fontSize: "0.9rem", margin: "0 0 0.2rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</p>
                          <p style={{ color: "var(--latte)", fontSize: "0.85rem", margin: 0 }}>TZS {prod.price.toLocaleString()}</p><p style={{ color: (prod.stockQuantity ?? 1) > 0 ? "#27c93f" : "#ff5f56", fontSize: "0.7rem", margin: "0.2rem 0 0 0" }}>{(prod.stockQuantity ?? 1) > 0 ? "In Stock (" + (prod.stockQuantity ?? 1) + ")" : "Sold Out"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ background: "var(--roast)", borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(185,130,90,0.1)" }}>
                 <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--cream)", margin: "0 0 1.5rem 0" }}>Stock Report</h3>
                 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(185,130,90,0.2)", color: "rgba(243,227,208,0.5)", textAlign: "left" }}>
                        <th style={{ paddingBottom: "0.8rem", fontWeight: 500 }}>Product</th>
                        <th style={{ paddingBottom: "0.8rem", fontWeight: 500 }}>Status</th><th style={{ paddingBottom: "0.8rem", fontWeight: 500 }}>Stock</th>
                        <th style={{ paddingBottom: "0.8rem", fontWeight: 500, textAlign: "right" }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: "1rem 0", textAlign: "center", color: "rgba(243,227,208,0.4)" }}>No products.</td></tr>
                      ) : (
                        products.slice(0, 4).map((prod) => (
                          <tr key={prod.id} style={{ borderBottom: "1px solid rgba(185,130,90,0.05)" }}>
                            <td style={{ padding: "0.8rem 0", color: "var(--cream)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name}</td>
                            <td style={{ padding: "0.8rem 0" }}>
                              <button onClick={() => toggleProductStatus(prod.id, prod.status)} style={{ background: "none", border: "none", color: prod.status === "ACTIVE" ? "#27c93f" : "#ff5f56", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}>
                                {prod.status}
                              </button>
                            </td>
                            <td style={{ padding: "0.8rem 0", color: (prod.stockQuantity ?? 1) > 0 ? "var(--cream)" : "#ff5f56", fontSize: "0.75rem" }}>{(prod.stockQuantity ?? 1) > 0 ? (prod.stockQuantity ?? 1) : "Sold Out"}</td><td style={{ padding: "0.8rem 0", color: "var(--latte)", textAlign: "right" }}>TZS {prod.price.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                 </table>
              </div>
            </div>
          </>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === "Products" && (
          <div style={{ background: "var(--roast)", borderRadius: "16px", padding: "2rem", border: "1px solid rgba(185,130,90,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "var(--cream)", margin: 0 }}>All Inventory</h2>
              <button onClick={openAddPanel} style={{ background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", padding: "0.6rem 1.5rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", transition: "0.3s" }}>+ Add New Product</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
               {products.length === 0 ? (
                  <p style={{ color: "rgba(243,227,208,0.4)", fontSize: "0.9rem", gridColumn: "span 4", textAlign: "center", padding: "4rem 0" }}>You have no products yet. Click "Add New Product" to get started.</p>
               ) : (
                  products.map((prod) => (
                    <div key={prod.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(185,130,90,0.2)", borderRadius: "12px", overflow: "hidden" }}>
                      <div style={{ height: "160px", background: prod.imageUrl ? `url(${prod.imageUrl}) center/contain no-repeat, linear-gradient(rgba(17,10,6,0.72), rgba(17,10,6,0.72)), url(${prod.imageUrl}) center/cover` : "var(--espresso)" }} />
                      <div style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                          <p style={{ color: "var(--cream)", fontSize: "1rem", margin: 0, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</p>
                          <span style={{ color: prod.status === "ACTIVE" ? "#27c93f" : "#ff5f56", fontSize: "0.7rem", textTransform: "uppercase" }}>{prod.status}</span>
                        </div>
                        <p style={{ color: "var(--latte)", fontSize: "1rem", margin: "0 0 0.3rem 0" }}>TZS {prod.price.toLocaleString()}</p>
                        <p style={{ color: prod.stockQuantity > 0 ? "#27c93f" : "#ff5f56", fontSize: "0.75rem", margin: "0 0 1rem 0" }}>{prod.stockQuantity > 0 ? "In Stock (" + prod.stockQuantity + ")" : "Sold Out"}</p>
                        <button onClick={() => openEditPanel(prod)} style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", background: "transparent", border: "1px solid var(--copper)", color: "var(--latte)", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", transition: "0.3s" }}>Edit Product</button>
                        <button onClick={() => toggleProductStatus(prod.id, prod.status)} style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--cream)", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", transition: "0.3s" }}>
                          {prod.status === "ACTIVE" ? "Hide Product" : "Make Active"}
                        </button>
                      </div>
                    </div>
                  ))
               )}
            </div>
          </div>
        )}

        {/* --- PLACEHOLDER TABS --- */}
        {activeTab !== "Dashboard" && activeTab !== "Products" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", flexDirection: "column" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "var(--cream)", marginTop: "1rem" }}>{activeTab} Module</h2>
            <p style={{ color: "rgba(243,227,208,0.5)" }}>This feature is coming in the next sprint.</p>
          </div>
        )}

      </main>

      {/* MODAL FOR EDITING STORE */}
      {isEditOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="auth-modal" style={{ maxWidth: "600px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setIsEditOpen(false)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--text-light)", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "var(--cream)", marginBottom: "0.5rem" }}>Edit Profile</h2>
            <p style={{ color: "var(--text-light)", opacity: 0.6, marginBottom: "2rem" }}>Update your store details and branding.</p>
            
            <form onSubmit={handleUpdateStore}>
              <div className="form-group">
                <label>Store Name</label>
                <input required value={eName} onChange={(e) => setEName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>WhatsApp Number</label>
                <input required value={eWhatsapp} onChange={(e) => setEWhatsapp(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={eDesc} onChange={(e) => setEDesc(e.target.value)} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Store Logo (Optional)</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem", border: "1px dashed rgba(185,130,90,0.4)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "0.3s" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                    <div>
                      <p style={{ color: "var(--cream)", margin: 0, fontSize: "0.85rem" }}>Browse</p>
                      {eLogo ? <p style={{ color: "#27c93f", margin: 0, fontSize: "0.7rem" }}>✓ Selected</p> : <p style={{ color: "rgba(243,227,208,0.4)", margin: 0, fontSize: "0.7rem" }}>Upload</p>}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setELogo)} style={{ display: "none" }} />
                  </label>
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--latte)", fontSize: "0.8rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Cover Banner (Optional)</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem", border: "1px dashed rgba(185,130,90,0.4)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "0.3s" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <div>
                      <p style={{ color: "var(--cream)", margin: 0, fontSize: "0.85rem" }}>Browse</p>
                      {eBanner ? <p style={{ color: "#27c93f", margin: 0, fontSize: "0.7rem" }}>✓ Selected</p> : <p style={{ color: "rgba(243,227,208,0.4)", margin: 0, fontSize: "0.7rem" }}>Upload</p>}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setEBanner)} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={eSubmitting} className="auth-submit" style={{ marginTop: "2rem" }}>
                {eSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OUT PANEL FOR ADDING PRODUCTS */}
      <div style={{ 
        position: "fixed", top: 0, right: isPanelOpen ? 0 : "-100%", 
        width: "500px", height: "100vh", background: "var(--roast)", 
        borderLeft: "1px solid var(--copper)", zIndex: 100, 
        transition: "right 0.4s cubic-bezier(0.22, 0.8, 0.24, 1)",
        padding: "4rem 3rem", boxShadow: "-20px 0 50px rgba(0,0,0,0.8)",
        display: "flex", flexDirection: "column"
      }}>
        <button onClick={() => setIsPanelOpen(false)} style={{ position: "absolute", top: "2rem", right: "2rem", background: "none", border: "none", color: "var(--cream)", fontSize: "2rem", cursor: "pointer", fontFamily: "Cormorant Garamond, serif" }}>×</button>
        
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--cream)", fontStyle: "italic", marginBottom: "1rem" }}>{editingId ? "Edit Product" : "New Masterpiece"}</h2>
        <p style={{ color: "var(--copper)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "3rem" }}>{editingId ? "Update your product details" : "Add to your collection"}</p>
        
        <form onSubmit={editingId ? handleUpdateProduct : handleCreateProduct} style={{ flex: 1 }}>
          <div className="form-group">
            <label>Product Name</label>
            <input required value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Vintage Leather Bag" />
          </div>
          <div className="form-group">
            <label>Price (TZS)</label>
            <input required type="number" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="150000" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Brief details..." />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input required type="number" min="0" value={pStock} onChange={(e) => setPStock(e.target.value)} placeholder="1" />
          </div>
          <div className="form-group">
            <label>Image</label>
            <label style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", border: "1px dashed rgba(185,130,90,0.4)", borderRadius: "8px", background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "0.3s" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <div>
                <p style={{ color: "var(--cream)", margin: 0, fontSize: "0.9rem" }}>Click to browse</p>
                {pImage ? <p style={{ color: "#27c93f", margin: 0, fontSize: "0.75rem" }}>✓ Image Selected</p> : <p style={{ color: "rgba(243,227,208,0.4)", margin: 0, fontSize: "0.75rem" }}>Upload from device</p>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setPImage)} style={{ display: "none" }} />
            </label>
          </div>
          
          <button type="submit" disabled={pSubmitting} style={{ width: "100%", marginTop: "2rem", background: "var(--latte)", color: "var(--espresso)", border: "none", padding: "1rem", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600 }}>
            {pSubmitting ? "Saving..." : editingId ? "Save Changes" : "Save Product"}
          </button>
        </form>
      </div>

    </div>
  );
}