"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Marketplace() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/stores/marketplace")
      .then(async (res) => {
        if (res.status === 200) setStores(await res.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Flatten all products
  const allProducts = stores.flatMap(store => 
    store.products.map((prod: any) => ({ ...prod, storeName: store.name, storeSlug: store.slug }))
  );

  const newArrivals = allProducts.slice(0, 4);
  const bestSellers = allProducts.slice(4, 8);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--espresso)", color: "var(--cream)", display: "grid", placeItems: "center", fontFamily: "Jost, sans-serif" }}>Loading Marketplace...</div>;

  // Reusable Product Card Component
  const ProductCard = ({ prod, tag }: { prod: any, tag?: string }) => (
    <Link href={`/store/${prod.storeSlug}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#23130c", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", transition: "transform 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
        
        <div style={{ height: "220px", position: "relative", background: prod.imageUrl ? `url(${prod.imageUrl}) center/contain no-repeat, linear-gradient(rgba(17,10,6,0.72), rgba(17,10,6,0.72)), url(${prod.imageUrl}) center/cover` : "var(--espresso)" }}>
          {tag && (
            <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "var(--latte)", color: "var(--espresso)", padding: "0.2rem 0.6rem", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>
              {tag}
            </div>
          )}
          <div style={{ position: "absolute", top: "1rem", right: "1rem", width: "30px", height: "30px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
        </div>

        <div style={{ padding: "1.2rem" }}>
          <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1.1rem", fontWeight: 500, color: "var(--cream)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</h3>
          <p style={{ margin: "0 0 1rem 0", color: "rgba(243,227,208,0.5)", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.storeName}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, color: "var(--latte)", fontSize: "1.1rem", fontWeight: 600 }}>TZS {prod.price.toLocaleString()}{(prod.stockQuantity ?? 1) <= 0 ? " - Sold Out" : (prod.stockQuantity ?? 1) <= 3 ? " - Low Stock" : ""}</p>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>+</div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--espresso)", fontFamily: "Jost, sans-serif", color: "var(--cream)" }}>
      
      {/* NAVBAR */}
      <nav style={{ padding: "1.5rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(185,130,90,0.1)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
           <div style={{ width: "30px", height: "30px", background: "var(--latte)", color: "var(--espresso)", display: "grid", placeItems: "center", borderRadius: "8px", fontSize: "1.2rem", fontFamily: "Cormorant Garamond, serif", fontWeight: "bold" }}>S</div>
           <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "var(--cream)", margin: 0 }}>ShopNest</h2>
        </Link>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", fontSize: "0.95rem" }}>
          <Link href="/" style={{ color: "var(--cream)", textDecoration: "none" }}>Home</Link>
          <Link href="/marketplace" style={{ color: "var(--latte)", textDecoration: "none", fontWeight: 600 }}>Shop</Link>
          <Link href="#" style={{ color: "var(--cream)", textDecoration: "none", opacity: 0.7 }}>Categories</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ padding: "4rem", display: "flex", alignItems: "center", gap: "4rem", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: "var(--latte)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "1rem" }}>Trending Now</p>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "4.5rem", lineHeight: 1.1, marginBottom: "1.5rem", fontStyle: "italic" }}>
            Discover Products<br/>You'll Love
          </h1>
          <p style={{ color: "rgba(243,227,208,0.6)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: "400px" }}>
            Shop the latest trending products curated for modern lifestyles. Directly from trusted local sellers.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button style={{ background: "var(--latte)", color: "var(--espresso)", border: "none", padding: "1rem 2rem", borderRadius: "50px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}>Shop Now</button>
            <button style={{ background: "transparent", border: "1px solid rgba(185,130,90,0.4)", color: "var(--cream)", padding: "1rem 2rem", borderRadius: "50px", fontSize: "1rem", cursor: "pointer" }}>Explore Collection</button>
          </div>
        </div>
        
        {/* Floating Hero Image Area */}
        <div style={{ flex: 1, position: "relative", height: "500px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {/* Main big image (placeholder shape) */}
          <div style={{ width: "350px", height: "450px", background: "var(--roast)", borderRadius: "30px", position: "relative", zIndex: 1, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <span style={{ opacity: 0.2, fontFamily: "Cormorant Garamond, serif", fontSize: "2rem" }}>Hero Image</span>
          </div>
          
          {/* Floating Card 1 */}
          <div style={{ position: "absolute", top: "50px", left: "0px", background: "#2a1710", padding: "1rem", borderRadius: "16px", display: "flex", gap: "1rem", alignItems: "center", boxShadow: "0 15px 30px rgba(0,0,0,0.6)", zIndex: 2, border: "1px solid rgba(185,130,90,0.2)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--espresso)" }} />
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--cream)" }}>Air Max 270</p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--latte)", fontWeight: "bold" }}>TZS 150,000</p>
            </div>
          </div>

          {/* Floating Card 2 */}
          <div style={{ position: "absolute", bottom: "80px", right: "0px", background: "#2a1710", padding: "1rem", borderRadius: "16px", display: "flex", gap: "1rem", alignItems: "center", boxShadow: "0 15px 30px rgba(0,0,0,0.6)", zIndex: 2, border: "1px solid rgba(185,130,90,0.2)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--espresso)" }} />
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--cream)" }}>Smart Watch</p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--latte)", fontWeight: "bold" }}>TZS 250,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <div style={{ borderTop: "1px solid rgba(185,130,90,0.1)", borderBottom: "1px solid rgba(185,130,90,0.1)", padding: "2rem 4rem", display: "flex", justifyContent: "space-between", maxWidth: "1400px", margin: "0 auto" }}>
        {[
          { title: "Free Shipping", desc: "On orders over TZS 100k" },
          { title: "Secure Payments", desc: "100% protected" },
          { title: "Easy Returns", desc: "7-day return policy" },
          { title: "24/7 Support", desc: "Dedicated assistance" }
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(185,130,90,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--latte)" }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--cream)" }}>{item.title}</h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(243,227,208,0.5)" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* NEW ARRIVALS GRID */}
      <section style={{ padding: "4rem", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", margin: 0, fontStyle: "italic" }}>New Arrivals</h2>
          <Link href="#" style={{ color: "var(--latte)", textDecoration: "none", fontSize: "0.9rem" }}>View All</Link>
        </div>
        
        {newArrivals.length === 0 ? (
          <p style={{ opacity: 0.5 }}>No products yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
            {newArrivals.map((prod) => <ProductCard key={prod.id} prod={prod} tag="NEW" />)}
          </div>
        )}
      </section>

      {/* BEST SELLERS GRID */}
      <section style={{ padding: "0 4rem 4rem 4rem", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", margin: 0, fontStyle: "italic" }}>Best Sellers</h2>
          <Link href="#" style={{ color: "var(--latte)", textDecoration: "none", fontSize: "0.9rem" }}>View All</Link>
        </div>
        
        {bestSellers.length === 0 ? (
          <p style={{ opacity: 0.5 }}>More products coming soon.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
            {bestSellers.map((prod) => <ProductCard key={prod.id} prod={prod} tag="HOT" />)}
          </div>
        )}
      </section>

      {/* PROMO BANNERS */}
      <section style={{ padding: "0 4rem 5rem 4rem", maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        {/* Promo 1 */}
        <div style={{ background: "linear-gradient(135deg, var(--copper), var(--latte))", borderRadius: "24px", padding: "3rem", position: "relative", overflow: "hidden" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--espresso)", margin: "0 0 1rem 0", fontStyle: "italic", lineHeight: 1.1 }}>Up To 70% Off<br/>Summer Sale</h2>
          <button style={{ background: "var(--espresso)", color: "var(--cream)", border: "none", padding: "0.8rem 1.5rem", borderRadius: "50px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", marginTop: "1rem" }}>Shop Now</button>
        </div>

        {/* Promo 2 */}
        <div style={{ background: "#23130c", borderRadius: "24px", padding: "3rem", border: "1px solid rgba(185,130,90,0.2)", position: "relative", overflow: "hidden" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--cream)", margin: "0 0 1rem 0", fontStyle: "italic", lineHeight: 1.1 }}>New Collection<br/>Summer 2026</h2>
          <p style={{ color: "rgba(243,227,208,0.6)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Discover the latest trends and exclusive styles.</p>
          <button style={{ background: "transparent", border: "1px solid var(--latte)", color: "var(--latte)", padding: "0.8rem 1.5rem", borderRadius: "50px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>View Collection</button>
        </div>

      </section>

    </div>
  );
}