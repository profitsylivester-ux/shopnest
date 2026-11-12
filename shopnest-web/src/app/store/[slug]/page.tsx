"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PublicStorefront() {
  const params = useParams();
  const slug = params.slug as string;

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:3001/stores/${slug}`)
      .then(async (res) => {
        if (res.status === 200) setStore(await res.json());
        else setError("Store not found.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--cream)", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>Loading Storefront...</div>;
  if (error || !store) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "#ff5f56", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>{error}</div>;

  const handleWhatsApp = (product: any) => {
    const phone = store.whatsappNumber?.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(`Hi ${store.name}, I am interested in buying "${product.name}" (TZS ${product.price.toLocaleString()}) from your ShopNest storefront.`);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--espresso)", fontFamily: "Jost, sans-serif", color: "var(--cream)" }}>
      
      {/* TOP NAV */}
      <nav style={{ padding: "1.5rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(185,130,90,0.1)", background: "var(--roast)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
           <div style={{ width: "30px", height: "30px", background: "var(--latte)", color: "var(--espresso)", display: "grid", placeItems: "center", borderRadius: "8px", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: "bold" }}>S</div>
           <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "var(--cream)", margin: 0 }}>ShopNest</h2>
        </Link>
        <Link href="/marketplace" style={{ color: "var(--latte)", textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Marketplace
        </Link>
      </nav>

      {/* HERO BANNER */}
      <header style={{ height: "350px", background: store.bannerUrl ? `url(${store.bannerUrl}) center/cover` : "linear-gradient(135deg, var(--roast), var(--copper))", position: "relative", display: "flex", alignItems: "flex-end", padding: "3rem" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--espresso) 0%, rgba(26,15,10,0.4) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--espresso)", border: "3px solid var(--copper)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "3rem", fontFamily: "Cormorant Garamond, serif", color: "var(--latte)", fontWeight: "bold" }}>{store.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3.5rem", margin: "0 0 0.5rem 0", fontStyle: "italic", color: "#fff" }}>{store.name}</h1>
            <p style={{ color: "rgba(243,227,208,0.8)", fontSize: "1.1rem", margin: 0, maxWidth: "600px" }}>{store.description || "Welcome to our boutique."}</p>
          </div>
        </div>
      </header>

      {/* PRODUCTS GRID */}
      <main style={{ padding: "4rem 3rem", maxWidth: "1400px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", marginBottom: "2rem", borderBottom: "1px solid rgba(185,130,90,0.2)", paddingBottom: "1rem" }}>
          Our Collection
        </h2>

        {store.products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", opacity: 0.5 }}>
            <p>This store hasn't added any products yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2.5rem" }}>
            {store.products.map((prod: any) => (
              <div key={prod.id} onClick={() => setSelectedProduct(prod)} style={{ background: "#23130c", borderRadius: "24px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.4)", cursor: "pointer", transition: "transform 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                
                {/* Image with Floating Tag */}
                <div style={{ height: "240px", position: "relative", background: prod.imageUrl ? `url(${prod.imageUrl}) center/contain no-repeat, linear-gradient(rgba(17,10,6,0.72), rgba(17,10,6,0.72)), url(${prod.imageUrl}) center/cover` : "var(--espresso)" }}>
                  <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(255,255,255,0.9)", color: "var(--espresso)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                    NEW ARRIVAL
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", fontWeight: 500, color: "var(--cream)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</h3>
                  <p style={{ margin: "0 0 1.2rem 0", color: "rgba(243,227,208,0.6)", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {prod.description || "Click to view details"}
                  </p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ margin: 0, color: "var(--latte)", fontSize: "1.2rem", fontWeight: 600 }}>TZS {prod.price.toLocaleString()}{(prod.stockQuantity ?? 1) <= 0 ? " - Sold Out" : ""}</p>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--latte)", color: "var(--espresso)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
                      +
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL (Glassmorphism) */}
      {selectedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "2rem" }}>
          <div style={{ background: "rgba(35, 19, 12, 0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(185,130,90,0.2)", borderRadius: "24px", maxWidth: "800px", width: "100%", display: "flex", overflow: "hidden", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}>
            
            <button onClick={() => setSelectedProduct(null)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "#000", border: "none", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", fontSize: "1.2rem", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>

            <div style={{ flex: 1, minHeight: "400px", background: selectedProduct.imageUrl ? `url(${selectedProduct.imageUrl}) center/contain no-repeat, linear-gradient(rgba(17,10,6,0.72), rgba(17,10,6,0.72)), url(${selectedProduct.imageUrl}) center/cover` : "var(--espresso)" }} />

            <div style={{ flex: 1, padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ color: "var(--latte)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>Product Details</p>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", margin: "0 0 1rem 0", fontStyle: "italic", lineHeight: 1.1 }}>{selectedProduct.name}</h2>
              <h3 style={{ fontSize: "1.5rem", color: "var(--copper)", margin: "0 0 1.5rem 0" }}>TZS {selectedProduct.price.toLocaleString()}</h3>
              
              <p style={{ color: "rgba(243,227,208,0.7)", lineHeight: 1.6, marginBottom: "2rem" }}>
                {selectedProduct.description || "Contact the seller on WhatsApp for more details."}
              </p>

              <button onClick={() => handleWhatsApp(selectedProduct)} disabled={(selectedProduct.stockQuantity ?? 1) <= 0} style={{ opacity: (selectedProduct.stockQuantity ?? 1) <= 0 ? 0.5 : 1, width: "100%", background: "#25D366", color: "white", border: "none", padding: "1.2rem", borderRadius: "50px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "auto", transition: "0.3s" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {(selectedProduct.stockQuantity ?? 1) <= 0 ? "Sold Out" : "Contact on WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}