"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AccountMenu from "../components/AccountMenu";
import AuthModal from "../components/AuthModal";
import NavMenu from "../components/NavMenu";
import ProductCard from "../components/ProductCard";
import ThemeToggle from "../components/ThemeToggle";
import { T, useLang } from "../lib/i18n";
import { TZ_REGIONS } from "../lib/regions";
import { API_URL } from "../lib/seo";
import { useTheme } from "../lib/theme";
import { catLabel, getJsonClient, readUser, useCategories, type SessionUser } from "../lib/site";

const t = {
  EN: {
    navHome: "Home", navProducts: "Products", navVendors: "Vendors", navContact: "Contact", navSignup: "Sign Up",
    subNew: "New Arrivals", subBest: "Best Sellers", subCat: "Categories",
    subAllVen: "All Vendors", subTopVen: "Top Rated", subBecome: "Become a Seller",
    subSupport: "Support", subFaq: "FAQs", subAbout: "About Us",
    slide1Eyebrow: "Discover", slide1Title: "Everything You Need", slide1Desc: "Shop from the best local vendors and creators. Quality products, and you chat with the seller directly.", slide1Btn: "Explore Marketplace",
    slide2Title: "Buyers & Sellers\nUnited", slide2L: "For Buyers", slide2LTitle: "Shop Local", slide2LDesc: "Find unique products from trusted vendors in your community.", slide2LBtn: "Start Shopping",
    slide2R: "For Sellers", slide2RTitle: "Grow Your Business", slide2RDesc: "Set up your digital storefront in minutes and reach thousands of buyers.", slide2RBtn: "Become a Seller",
    featL1: "Chat Directly on WhatsApp", featL2: "Real Local Sellers", featL3: "See Prices Upfront",
    featR1: "Zero Setup Fees", featR2: "Powerful Analytics Dashboard", featR3: "Reach Thousands of Buyers",
    slide3Eyebrow: "Trending", slide3Title: "Discover Products You'll Love", slide3Desc: "Shop the latest trending products curated for modern lifestyles.", slide3Btn: "Shop Now",
    slide4Eyebrow: "Join Us", slide4Title: "Start Shopping Today", slide4Desc: "Create an account and discover what ShopNest has to offer.", slide4Btn: "Sign Up Now",
    sideTitle: "About ShopNest", sideDesc: "ShopNest is your premier multi-vendor marketplace. We connect local sellers with buyers worldwide.", sideLink1: "Browse Categories", sideLink2: "Top Vendors", sideLink3: "Help Center", sideLink4: "Careers",
    footDesc: "Tanzania's trusted multi-vendor marketplace. Connecting local creators with buyers everywhere.", footChat: "Chat with Support",
    footShop: "Shop", footS1: "Explore", footS2: "Sellers", footS3: "Favorites",
    footSell: "Sell", footSe1: "Open your shop", footSe2: "Seller dashboard",
    footAbout: "About", footA1: "About ShopNest", footA2: "Contact us", footA3: "Privacy", footA4: "Terms",
    footCopy: "© 2026 ShopNest. All rights reserved.", footNote: "ShopNest connects buyers and sellers securely.",
    authTitle: "Join ShopNest", authDesc: "Choose your account type to get started.", authBtn: "Create Account",
    authLoginTitle: "Welcome Back", authLoginDesc: "Enter your details to access your account.", authLoginBtn: "Sign In",
    roleBuyer: "Buyer", roleSeller: "Seller",
    chatTitle: "ShopNest Assistant", chatPlaceholder: "Ask about ShopNest...", chatHello: "Hi! I am the ShopNest assistant. Ask me anything about buying or selling on our platform.",
    miniDesc: "Shop from the best local vendors and creators.", miniBtn: "Explore Marketplace",
    filterTitle: "Filters", sortBy: "Sort By", newest: "Newest", priceLowHigh: "Price: Low to High", priceHighLow: "Price: High to Low", catTitle: "Category", catAll: "All", noResA: "No results for", noResB: "Try fewer words, check the spelling, or pick another category.", clearSearch: "Clear search", catElec: "Electronics", catFash: "Fashion", catShoes: "Shoes", catVeh: "Vehicles", catFood: "Food", catServ: "Services", priceTitle: "Price (TSH)", locTitle: "Location", locAny: "Anywhere", locDar: "Dar es Salaam", locMbeya: "Mbeya", locArusha: "Arusha", condTitle: "Condition", condAny: "Any", condNew: "New", condUsed: "Used", condRef: "Refurbished", reset: "Reset Filters", explore: "Explore Products", exploreDesc: "Discover items from all our trusted sellers.", searchPlace: "Search products..."
  },
  SW: {
    navHome: "Mwanzo", navProducts: "Bidhaa", navVendors: "Wauzaji", navContact: "Mawasiliano", navSignup: "Jiandikishe",
    subNew: "Mpya", subBest: "Zinazouzwa Zaidi", subCat: "Makundi",
    subAllVen: "Wauzaji Wote", subTopVen: "Waliokadiliwa", subBecome: "Kuwa Mwuza",
    subSupport: "Msaada", subFaq: "Maswali", subAbout: "Kuhusu Sisi",
    slide1Eyebrow: "Gundua", slide1Title: "Kila Kitu Unachohitaji", slide1Desc: "Nunua kutoka kwa wauzaji bora wa ndani. Bidhaa za ubora, na unazungumza na muuzaji moja kwa moja.", slide1Btn: "Gundua Soko",
    slide2Title: "Wanunuzi na Wauzaji\nWameunganishwa", slide2L: "Kwa Wanunuzi", slide2LTitle: "Nunua Hapa", slide2LDesc: "Pata bidhaa za kipekee kutoka kwa wauzaji wanaoaminika.", slide2LBtn: "Anza Kununua",
    slide2R: "Kwa Wauzaji", slide2RTitle: "Kuza Biashara Yako", slide2RDesc: "Weka duka lako la mtandaoni kwa dakika chache na ufikie maelfu ya wanunuzi.", slide2RBtn: "Kuwa Mwuza",
    featL1: "Zungumza Moja kwa Moja kwa WhatsApp", featL2: "Wauzaji Halisi wa Ndani", featL3: "Ona Bei Mapema",
    featR1: "Hakuna Ada ya Kuanzisha", featR2: "Dashibodi ya Uchanganuzi", featR3: "Fikia Maelfu ya Wanunuzi",
    slide3Eyebrow: "Maarufu", slide3Title: "Gundua Bidhaa Utakazozipenda", slide3Desc: "Nunua bidhaa za hivi punde zilizochaguliwa kwa mtindo wa kisasa.", slide3Btn: "Nunua Sasa",
    slide4Eyebrow: "Jiunge Nasi", slide4Title: "Anza Kununua Leo", slide4Desc: "Unda akaunti na ugundue ShopNest inavyokupa.", slide4Btn: "Jiandikishe Sasa",
    sideTitle: "Kuhusu ShopNest", sideDesc: "ShopNest ni soko lako kuu la wauzaji wengi. Tunawaunganisha wauzaji wa ndani na wanunuzi duniani kote.", sideLink1: "Vinjari Makundi", sideLink2: "Wauzaji Bora", sideLink3: "Kituo cha Msaada", sideLink4: "Ajira",
    footDesc: "Soko la kuaminika la wauzaji wengi Tanzania. Kuwaunganisha wabunifu wa ndani na wanunuzi kila mahali.", footChat: "Zungumza na Msaada",
    footShop: "Duka", footS1: "Gundua", footS2: "Wauzaji", footS3: "Vipendwa",
    footSell: "Uza", footSe1: "Fungua duka lako", footSe2: "Dashibodi ya mwuza",
    footAbout: "Kuhusu", footA1: "Kuhusu ShopNest", footA2: "Wasiliana nasi", footA3: "Faragha", footA4: "Masharti",
    footCopy: "© 2026 ShopNest. Haki zote zimehifadhiwa.", footNote: "ShopNest inaunganisha wanunuzi na wauzaji kwa usalama.",
    authTitle: "Jiunge na ShopNest", authDesc: "Chagua aina ya akaunti yako kuanza.", authBtn: "Unda Akaunti",
    authLoginTitle: "Karibu Tena", authLoginDesc: "Weka maelezo yako kufikia akaunti yako.", authLoginBtn: "Ingia",
    roleBuyer: "Mnunuzi", roleSeller: "Mwuza",
    chatTitle: "Msaidizi wa ShopNest", chatPlaceholder: "Uliza kuhusu ShopNest...", chatHello: "Habari! Mimi ni msaidizi wa ShopNest. Niulize chochote kuhusu kununua au kuuza kwenye jukwaa letu.",
    miniDesc: "Nunua kutoka kwa wauzaji bora wa ndani.", miniBtn: "Gundua Soko",
    filterTitle: "Vichujio", sortBy: "Panga Kwa", newest: "Mpya Zaidi", priceLowHigh: "Bei: Chini hadi Juu", priceHighLow: "Bei: Juu hadi Chini", catTitle: "Kundi", catAll: "Zote", noResA: "Hakuna matokeo ya", noResB: "Jaribu maneno machache, angalia tahajia, au chagua kundi lingine.", clearSearch: "Futa utafutaji", catElec: "Elektroniki", catFash: "Mavazi", catShoes: "Viatu", catVeh: "Magari", catFood: "Chakula", catServ: "Huduma", priceTitle: "Bei (TSH)", locTitle: "Mahali", locAny: "Mahali Popote", locDar: "Dar es Salaam", locMbeya: "Mbeya", locArusha: "Arusha", condTitle: "Hali", condAny: "Yoyote", condNew: "Mpya", condUsed: "Iliyotumika", condRef: "Iliyorekebishwa", reset: "Weka Upya", explore: "Gundua Bidhaa", exploreDesc: "Gundua bidhaa kutoka kwa wauzaji wetu wote.", searchPlace: "Tafuta bidhaa..."
  }
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useLang();
  const [theme, toggleTheme] = useTheme("dark");
  const d = T[lang];
  const cats = useCategories();

  const [auth, setAuth] = useState<{ open: boolean; mode: "login" | "signup"; role: "BUYER" | "SELLER" }>({ open: false, mode: "login", role: "BUYER" });
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    const sync = () => setUser(readUser());
    sync();
    window.addEventListener("shopnest-auth", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("shopnest-auth", sync); window.removeEventListener("storage", sync); };
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Settings and the newest products shown on slide 3
  const [sysSettings, setSysSettings] = useState<any>({});
  const [featured, setFeatured] = useState<any[] | null>(null);
  const [hq, setHq] = useState("");
  const [hsort, setHsort] = useState("newest");
  const [hcat, setHcat] = useState("");
  const [hloc, setHloc] = useState("");
  const anyHome = !!(hq.trim() || hcat || hloc || hsort !== "newest");

  const text = t[lang];
  // Texts saved in Admin are English only, so Swahili visitors keep the built-in Swahili.
  const ov = lang === "EN";
  const storyRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(API_URL + "/settings")
      .then(res => res.json())
      .then(data => setSysSettings(data))
      .catch(console.error);
  }, []);

  // Products on slide 3 follow the search, sort, category and region the visitor picks.
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = new URLSearchParams({ limit: "12" });
      if (hq.trim()) q.set("q", hq.trim());
      if (hcat) q.set("category", hcat);
      if (hloc) q.set("location", hloc);
      if (hsort !== "newest") q.set("sort", hsort);
      getJsonClient("/products/browse?" + q.toString()).then((j) => setFeatured(j && Array.isArray(j.items) ? j.items : []));
    }, hq ? 300 : 0);
    return () => clearTimeout(timer);
  }, [hq, hsort, hcat, hloc]);

  useEffect(() => {
    const handleScroll = () => {
      if (!storyRef.current) return;
      const story = storyRef.current;
      const y = Math.max(0, window.scrollY - story.offsetTop);
      const progress = y / window.innerHeight;
      const idx = Math.min(3, Math.round(progress));
      if (idx !== currentSlide) setCurrentSlide(idx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSlide]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const scrollTo = (index: number) => {
    if (!storyRef.current) return;
    window.scrollTo({ top: storyRef.current.offsetTop + index * window.innerHeight, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent, slideIndex: number) => { e.preventDefault(); scrollTo(slideIndex); };
  const openAuthModal = (role: "BUYER" | "SELLER", login: boolean = false) => setAuth({ open: true, mode: login ? "login" : "signup", role });


  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput(""); setIsTyping(true);
    setTimeout(() => {
      let botResponse = "I'm here to help you with anything related to ShopNest.";
      setChatMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };


  return (
    <div className="sn-land" data-theme={theme} style={{ display: "contents" }}>
      <AuthModal open={auth.open} onClose={() => setAuth((x) => ({ ...x, open: false }))} lang={lang} theme={theme} initialMode={auth.mode} initialRole={auth.role} />

      {/* SIDEBAR */}
      <div className={`sidebar-backdrop ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
        <h2>{text.sideTitle}</h2><p>{text.sideDesc}</p>
        <ul className="sidebar-links">
          <li><Link href="/marketplace">{d.marketplace}</Link></li>
          <li><Link href="/shops">{d.shops}</Link></li>
          <li><Link href="/support">{d.support}</Link></li>
          <li><Link href="/faq">{d.faqs}</Link></li>
          <li><Link href="/about">{d.about}</Link></li>
        </ul>
      </div>

      {/* NAVBAR */}
      <header className="nav" id="nav">
        <button className="burger" aria-label="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}><span></span><span></span><span></span></button>
        <a className="logo" href="#" onClick={(e) => handleLinkClick(e, 0)}>ShopNest</a>
        <div className="nav-controls" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "2rem" }}>
          <NavMenu tone={theme === "dark" ? "dark" : "light"} lang={lang} onSell={() => openAuthModal("SELLER", false)} onHome={() => scrollTo(0)} />
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <ThemeToggle className="lang-toggle theme-btn" theme={theme} onToggle={toggleTheme} label={theme === "dark" ? d.lightMode : d.darkMode} />
            <button className="lang-toggle" onClick={() => setLang(lang === "EN" ? "SW" : "EN")}>{lang === "EN" ? "SW" : "EN"}</button>
            {user ? (
              <AccountMenu user={user} lang={lang} theme={theme} onSignedOut={() => setUser(null)} />
            ) : (
              <>
                <button className="lang-toggle" onClick={() => openAuthModal("BUYER", true)}>{d.signIn}</button>
                <button className="btn-signup" onClick={() => openAuthModal("BUYER", false)}>{text.navSignup}</button>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="dots" aria-label="Sections">
        {[0, 1, 2, 3].map((i) => (
          <button key={i} className={currentSlide === i ? 'active' : ''} onClick={() => scrollTo(i)}></button>
        ))}
      </nav>

      <main className="story" ref={storyRef}>
        {String(sysSettings.announcementActive) === "true" && (
          <div style={{ position: "fixed", top: "80px", left: 0, right: 0, background: "var(--latte)", color: "var(--espresso)", textAlign: "center", padding: "0.8rem", fontSize: "0.9rem", fontWeight: 600, zIndex: 40, letterSpacing: "0.05em" }}>
            📢 {sysSettings.announcementText}
          </div>
        )}
        <div className="stage">
          
          {/* SLIDE 1 */}
          <section className={`slide ${currentSlide === 0 ? 'active' : ''}`} data-theme="dark">
            <div className="bg" style={{ backgroundColor: '#1a0f0a' }}>
              <video autoPlay muted loop playsInline className="bg" key={sysSettings.slide1Video || "default"}>
                <source src={sysSettings.slide1Video || "/7287924-uhd_3840_2160_25fps.mp4"} type="video/mp4" />
              </video>
            </div>
            <div>
              <div className="eyebrow">{text.slide1Eyebrow}</div>
              <h1>{(ov && sysSettings.slide1Title) || text.slide1Title}</h1>
              <p>{(ov && sysSettings.slide1Desc) || text.slide1Desc}</p>
              <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("BUYER", false); }}>{text.slide1Btn}</a>
            </div>
            
            {/* RESTORED MOCKUPS */}
            <div className="mockup-container">
              <div className="browser-mockup">
                <div className="browser-header">
                  <div className="browser-dot" style={{background: '#ff5f56'}}></div>
                  <div className="browser-dot" style={{background: '#ffbd2e'}}></div>
                  <div className="browser-dot" style={{background: '#27c93f'}}></div>
                </div>
                <div className="browser-body">
                  <div className="mini-nav">
                    <span style={{fontFamily: 'Cormorant Garamond', fontSize: '16px', fontWeight: 'bold'}}>ShopNest</span>
                    <span>{(text.navHome + "   " + text.navProducts + "   " + text.navVendors).toUpperCase()}</span>
                  </div>
                  <div className="mini-hero">
                    <div className="mini-eyebrow">{text.slide1Eyebrow.toUpperCase()}</div>
                    <div className="mini-title">{text.slide1Title.toUpperCase()}</div>
                    <div className="mini-desc">{text.miniDesc}</div>
                    <div className="mini-btn">{text.miniBtn.toUpperCase()}</div>
                  </div>
                  <div className="mini-grid">
                    <div className="mini-product">
                      <img className="mini-img" src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop" alt="Shoe" />
                      <div className="mini-info"><div></div><div style={{width: '40%'}}></div></div>
                    </div>
                    <div className="mini-product">
                      <img className="mini-img" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop" alt="Watch" />
                      <div className="mini-info"><div></div><div style={{width: '30%'}}></div></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="phone-mockup">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="mobile-nav">ShopNest</div>
                  <div className="mobile-hero">
                    <div style={{fontSize: '6px', color: '#b9825a', letterSpacing: '1px', marginBottom: '2px'}}>{text.slide1Eyebrow.toUpperCase()}</div>
                    <div className="mobile-title">{text.slide1Title.toUpperCase()}</div>
                  </div>
                  <div className="mobile-grid">
                    <div className="mobile-product">
                      <img className="mobile-img" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop" alt="Headphones" />
                      <div className="mobile-info"><div></div><div style={{width: '50%'}}></div></div>
                    </div>
                    <div className="mobile-product">
                      <img className="mobile-img" src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=200&auto=format&fit=crop" alt="Camera" />
                      <div className="mobile-info"><div></div><div style={{width: '40%'}}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 2 */}
          <section className={`slide split ${currentSlide === 1 ? 'active' : ''}`} data-theme="light">
            <div className="split-left">
              <div className="eyebrow">{text.slide2L}</div><h2>{text.slide2LTitle}</h2><p>{text.slide2LDesc}</p>
              <ul className="feature-list">
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> {text.featL1}</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> {text.featL2}</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> {text.featL3}</li>
              </ul>
              <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("BUYER", false); }}>{text.slide2LBtn}</a>
            </div>
            <div className="split-right">
              <div className="content-wrapper">
                <div className="eyebrow">{text.slide2R}</div><h2>{text.slide2RTitle}</h2><p>{text.slide2RDesc}</p>
                <ul className="feature-list">
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> {text.featR1}</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> {text.featR2}</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> {text.featR3}</li>
                </ul>
                <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("SELLER", false); }}>{text.slide2RBtn}</a>
              </div>
            </div>
            <h1 className="big-title">{text.slide2Title}</h1>
          </section>

          {/* SLIDE 3: LATEST PRODUCTS */}
          <section className={`slide sn-s3 ${currentSlide === 2 ? 'active' : ''}`} data-theme="dark" style={{ display: "flex", padding: 0 }}>
            <div className="sn-home-market" style={String(sysSettings.announcementActive) === "true" ? { paddingTop: "9.5rem" } : undefined}>
              <div className="sn-home-head">
                <div>
                  <div className="eyebrow">{text.slide3Eyebrow}</div>
                  <h1>{(ov && sysSettings.heroTitle) || text.explore}</h1>
                  <p>{(ov && sysSettings.heroSubtitle) || text.exploreDesc}</p>
                </div>
                <Link href="/marketplace" className="btn-ghost">{d.seeAll}</Link>
              </div>
              <div className="sn-home-body">
                <aside className="sn-home-filters">
                  <h3>{d.filters}</h3>
                  <label className="sn-hf"><span>{d.search}</span>
                    <input type="search" value={hq} onChange={(e) => setHq(e.target.value)} placeholder={d.search} maxLength={60} />
                  </label>
                  <label className="sn-hf"><span>{d.sortBy}</span>
                    <select value={hsort} onChange={(e) => setHsort(e.target.value)}>
                      <option value="newest">{d.newest}</option>
                      <option value="price_asc">{d.priceAsc}</option>
                      <option value="price_desc">{d.priceDesc}</option>
                    </select>
                  </label>
                  <div className="sn-hf"><span>{d.category}</span>
                    <div className="sn-hf-cats">
                      <button type="button" className={"sn-hf-cat" + (hcat === "" ? " on" : "")} onClick={() => setHcat("")}>{d.allCats}</button>
                      {cats.map((c) => (
                        <button type="button" key={c.id} className={"sn-hf-cat" + (hcat === c.nameEn ? " on" : "")} onClick={() => setHcat(hcat === c.nameEn ? "" : c.nameEn)}>{catLabel(c, lang)}</button>
                      ))}
                    </div>
                  </div>
                  <label className="sn-hf"><span>{d.location}</span>
                    <select value={hloc} onChange={(e) => setHloc(e.target.value)}>
                      <option value="">{d.anywhere}</option>
                      {TZ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  {anyHome && <button type="button" className="sn-hf-clear" onClick={() => { setHq(""); setHsort("newest"); setHcat(""); setHloc(""); }}>{d.clear}</button>}
                </aside>
                <div className="sn-home-results">
                  {featured && featured.length === 0 && <p className="sn-home-empty">{anyHome ? d.none + ". " + d.noneHint : d.noProductsYet}</p>}
                  {featured && featured.length > 0 && (
                    <div className="sn-grid">
                      {featured.map((p) => (
                        <ProductCard key={p.id} p={p} lang={lang} source="home" store={{ name: p.store?.name || "", slug: p.store?.slug || "", location: p.store?.location, whatsapp: p.store?.whatsappNumber }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SLIDE 4 */}
          <section className={`slide ${currentSlide === 3 ? 'active' : ''}`} data-theme="dark">
            <div className="bg" style={{ backgroundColor: '#1a0f0a' }}>
              <video autoPlay muted loop playsInline className="bg"><source src="/8938253-hd_1080_1920_30fps.mp4" type="video/mp4" /></video>
            </div>
            <div>
              <div className="eyebrow">{text.slide4Eyebrow}</div><h1>{text.slide4Title}</h1><p>{text.slide4Desc}</p>
              <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("BUYER", false); }}>{text.slide4Btn}</a>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><div className="logo-icon">S</div> ShopNest.</h3>
            <p>{text.footDesc}</p>
            <Link className="footer-contact" href="/support">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {d.support}
            </Link>
          </div>
          <div className="footer-col">
            <h4>{d.footShop}</h4>
            <ul>
              <li><Link href="/marketplace">{d.marketplace}</Link></li>
              <li><Link href="/marketplace?sort=newest">{d.newArrivals}</Link></li>
              <li><Link href="/shops">{d.allShops}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{d.footSell}</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openAuthModal("SELLER", false); }}>{d.openShop}</a></li>
              <li><Link href="/seller/dashboard">{d.sellerDash}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{d.footHelp}</h4>
            <ul>
              <li><Link href="/about">{d.about}</Link></li>
              <li><Link href="/faq">{d.faqs}</Link></li>
              <li><Link href="/privacy">{d.privacy}</Link></li>
              <li><Link href="/terms">{d.terms}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{d.rights}</span>
          <span>{text.footNote}</span>
        </div>
      </footer>

      {/* CHATBOT UI */}
      <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-header"><h3>{text.chatTitle}</h3><button className="chat-close" onClick={() => setIsChatOpen(false)}>×</button></div>
        <div className="chat-messages">
          <div className="message bot">{text.chatHello}</div>
          {chatMessages.map((msg, idx) => <div key={idx} className={`message ${msg.role}`}>{msg.text}</div>)}
          {isTyping && <div className="message bot"><span className="typing-dots">...</span></div>}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleChatSubmit} className="chat-input-area">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={text.chatPlaceholder} />
          <button type="submit" className="chat-send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
        </form>
      </div>
      <button className="chat" aria-label="Chat" onClick={() => setIsChatOpen(!isChatOpen)}>
        <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </button>
    </div>
  );
}