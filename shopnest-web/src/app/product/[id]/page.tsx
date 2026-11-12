"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/products/public/${id}`)
      .then(async (res) => {
        if (res.status === 200) setProduct(await res.json());
        else setError("Product not found.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--cream)", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>Curating Experience...</div>;
  if (error || !product) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "#ff5f56", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>{error}</div>;

  const handleWhatsApp = () => {
    const phone = product.store?.whatsappNumber?.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hi ${product.store?.name}, I am interested in buying "${product.name}" (TZS ${product.price.toLocaleString()}) from your ShopNest storefront.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--espresso)", fontFamily: "Jost, sans-serif", color: "var(--cream)" }}>
      
      {/* FLOATING NAVBAR */}
      <nav style={{ padding: "1.5rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "linear-gradient(to bottom, rgba(26,15,10,0.9) 0%, rgba(26,15,10,0) 100%)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
           <div style={{ width: "30px", height: "30px", background: "var(--latte)", color: "var(--espresso)", display: "grid", placeItems: "center", borderRadius: "8px", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: "bold" }}>S</div>
           <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "var(--cream)", margin: 0 }}>ShopNest</h2>
        </Link>
        <button onClick={() => router.back()} style={{ background: "transparent", border: "1px solid rgba(185,130,90,0.4)", color: "var(--cream)", padding: "0.6rem 1.5rem", borderRadius: "50px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "0.3s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(185,130,90,0.1)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Collection
        </button>
      </nav>

      {/* MAIN CINEMATIC LAYOUT */}
      <main style={{ display: "flex", minHeight: "100vh", paddingTop: "6rem" }}>
        
        {/* LEFT: STICKY IMAGE GALLERY */}
        <div style={{ flex: "0 0 55%", padding: "2rem 4rem", position: "relative" }}>
          <div style={{ 
            position: "sticky", 
            top: "8rem", 
            height: "75vh", 
            width: "100%", 
            background: product.imageUrl ? `url(${product.imageUrl}) center/contain no-repeat, linear-gradient(rgba(17,10,6,0.72), rgba(17,10,6,0.72)), url(${product.imageUrl}) center/cover` : "var(--roast)", 
            borderRadius: "24px", 
            boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
            border: "1px solid rgba(185,130,90,0.2)"
          }} />
        </div>

        {/* RIGHT: EDITORIAL DETAILS */}
        <div style={{ flex: 1, padding: "4rem 6rem 6rem 2rem", display: "flex", flexDirection: "column" }}>
          
          {/* Breadcrumb / Store Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--copper)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Curated by</span>
            <Link href={`/store/${product.store?.slug}`} style={{ textDecoration: "none", color: "var(--cream)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid rgba(185,130,90,0.3)", paddingBottom: "2px" }}>
              {product.store?.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27c93f" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </Link>
          </div>

          {/* Title & Price */}
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "4.5rem", margin: "0 0 1rem 0", fontStyle: "italic", lineHeight: 1, color: "var(--cream)" }}>
            {product.name}
          </h1>
          <h2 style={{ fontSize: "2.5rem", color: "var(--latte)", margin: "0 0 2rem 0", fontFamily: "Cormorant Garamond, serif", fontWeight: 300 }}>
            TZS {product.price.toLocaleString()}
          </h2>

          {/* Minimalist Tags */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(243,227,208,0.6)", fontSize: "0.9rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {product.store?.location || "Tanzania"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(243,227,208,0.6)", fontSize: "0.9rem" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#27c93f" }} />
              {(product.stockQuantity ?? 1) <= 0 ? "Sold Out" : (product.stockQuantity ?? 1) <= 3 ? "Low Stock" : "In Stock"}
            </div>
          </div>

          {/* Description */}
          <p style={{ color: "rgba(243,227,208,0.8)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "4rem", fontWeight: 300 }}>
            {product.description || "This exclusive piece is available now. Connect directly with the seller to discuss details, condition, and delivery options."}
          </p>

          {/* THE INNOVATIVE CTA */}
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(185,130,90,0.2)", paddingTop: "2rem" }}>
            <p style={{ color: "rgba(243,227,208,0.5)", fontSize: "0.85rem", marginBottom: "1rem", letterSpacing: "0.05em" }}>
              {(product.stockQuantity ?? 1) <= 0 ? "This item is currently sold out." : "Secure this item directly through the seller."}
            </p>
            <button 
              onClick={handleWhatsApp} disabled={(product.stockQuantity ?? 1) <= 0} 
              style={{ 
                width: "100%", 
                background: "var(--latte)", 
                color: "var(--espresso)", 
                border: "none", 
                padding: "1.4rem", opacity: (product.stockQuantity ?? 1) <= 0 ? 0.5 : 1, 
                borderRadius: "50px", 
                fontSize: "1.1rem", 
                fontWeight: 600, 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "12px",
                transition: "transform 0.2s, boxShadow 0.2s",
                boxShadow: "0 10px 30px rgba(217,164,124,0.2)"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(217,164,124,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(217,164,124,0.2)"; }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {(product.stockQuantity ?? 1) <= 0 ? "Sold Out" : "Inquire via WhatsApp"}
            </button>
            <p style={{ textAlign: "center", color: "rgba(243,227,208,0.4)", fontSize: "0.75rem", marginTop: "1rem" }}>
              You will be redirected to chat with the seller directly.
            </p>
          </div>

        </div>
      </main>

    </div>
  );
}