"use client";

import { useEffect, useRef, useState } from "react";

const t = {
  EN: {
    navHome: "Home", navProducts: "Products", navVendors: "Vendors", navContact: "Contact", navSignup: "Sign Up",
    subNew: "New Arrivals", subBest: "Best Sellers", subCat: "Categories",
    subAllVen: "All Vendors", subTopVen: "Top Rated", subBecome: "Become a Seller",
    subSupport: "Support", subFaq: "FAQs", subAbout: "About Us",
    slide1Eyebrow: "Discover", slide1Title: "Everything You Need", slide1Desc: "Shop from the best local vendors and creators. Quality products, delivered to your door.", slide1Btn: "Explore Marketplace",
    slide2Title: "Buyers & Sellers\nUnited", slide2L: "For Buyers", slide2LTitle: "Shop Local", slide2LDesc: "Find unique products from trusted vendors in your community.", slide2LBtn: "Start Shopping",
    slide2R: "For Sellers", slide2RTitle: "Grow Your Business", slide2RDesc: "Set up your digital storefront in minutes and reach thousands of buyers.", slide2RBtn: "Become a Seller",
    featL1: "Secure & Fast Checkout", featL2: "Verified Local Vendors", featL3: "Track Orders in Real-Time",
    featR1: "Zero Setup Fees", featR2: "Powerful Analytics Dashboard", featR3: "Reach Thousands of Buyers",
    slide3Eyebrow: "Seamless", slide3Title: "Fast & Secure Checkout", slide3Desc: "Pay securely and track your orders from the moment they ship.", slide3Btn: "Learn More",
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
    
    chatTitle: "ShopNest Assistant", chatPlaceholder: "Ask about ShopNest..."
  },
  SW: {
    navHome: "Mwanzo", navProducts: "Bidhaa", navVendors: "Wauzaji", navContact: "Mawasiliano", navSignup: "Jiandikishe",
    subNew: "Mpya", subBest: "Zinazouzwa Zaidi", subCat: "Makundi",
    subAllVen: "Wauzaji Wote", subTopVen: "Waliokadiliwa", subBecome: "Kuwa Mwuza",
    subSupport: "Msaada", subFaq: "Maswali", subAbout: "Kuhusu Sisi",
    slide1Eyebrow: "Gundua", slide1Title: "Kila Kitu Unachohitaji", slide1Desc: "Nunua kutoka kwa wauzaji bora wa ndani. Bidhaa za ubora, zikiletwa mlangoni kwako.", slide1Btn: "Gundua Soko",
    slide2Title: "Wanunuzi na Wauzaji\nWameunganishwa", slide2L: "Kwa Wanunuzi", slide2LTitle: "Nunua Hapa", slide2LDesc: "Pata bidhaa za kipekee kutoka kwa wauzaji wanaoaminika.", slide2LBtn: "Anza Kununua",
    slide2R: "Kwa Wauzaji", slide2RTitle: "Kuza Biashara Yako", slide2RDesc: "Weka duka lako la mtandaoni kwa dakika chache na ufikie maelfu ya wanunuzi.", slide2RBtn: "Kuwa Mwuza",
    featL1: "Malipo Salama na ya Haraka", featL2: "Wauzaji wa Ndani Waliothibitishwa", featL3: "Fuatilia Oda kwa Wakati Halisi",
    featR1: "Hakuna Ada ya Kuanzisha", featR2: "Dashibodi ya Uchanganuzi", featR3: "Fikia Maelfu ya Wanunuzi",
    slide3Eyebrow: "Rahisi", slide3Title: "Malipo ya Haraka na Salama", slide3Desc: "Lipa kwa usalama na ufuatilie oda zako tangu zisafirishwe.", slide3Btn: "Jifunze Zaidi",
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
    
    chatTitle: "Msaidizi wa ShopNest", chatPlaceholder: "Uliza kuhusu ShopNest..."
  }
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [authMode, setAuthMode] = useState<"BUYER" | "SELLER">("BUYER");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hi! I am the ShopNest assistant. Ask me anything about buying or selling on our platform.' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const text = t[lang];
  const storyRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  const scrollTo = (index: number) => {
    if (!storyRef.current) return;
    window.scrollTo({ top: storyRef.current.offsetTop + index * window.innerHeight, behavior: 'smooth' });
    setOpenDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLinkClick = (e: React.MouseEvent, slideIndex: number) => {
    e.preventDefault();
    scrollTo(slideIndex);
  };

  const openAuthModal = (mode: "BUYER" | "SELLER", login: boolean = false) => {
    setAuthMode(mode);
    setIsLogin(login);
    setIsAuthOpen(true);
    setErrorMsg("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const endpoint = isLogin ? "login" : "register";
    const body = isLogin ? { email, password } : { email, password, name, role: authMode };

    try {
      const response = await fetch(`http://localhost:3001/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("shopnest_token", data.access_token);
      localStorage.setItem("shopnest_user", JSON.stringify(data.user));
      
      alert(`Success! Logged in as ${data.user.email} (${data.user.role})`);
      setIsAuthOpen(false);

    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    // Simulated Bot Response (We will connect the real AI backend here)
    setTimeout(() => {
      let botResponse = "";
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes("ship") || lowerMsg.includes("delivery")) {
        botResponse = "Delivery times depend on the vendor, but usually takes 2-5 business days. You can track your order from your dashboard!";
      } else if (lowerMsg.includes("sell") || lowerMsg.includes("vendor")) {
        botResponse = "To become a seller, just click 'Become a Seller' at the top of the page! Setup takes only a few minutes and has zero upfront fees.";
      } else if (lowerMsg.includes("pay") || lowerMsg.includes("checkout")) {
        botResponse = "We use secure, encrypted payment gateways to ensure your checkout is 100% safe.";
      } else if (lowerMsg.includes("return") || lowerMsg.includes("refund")) {
        botResponse = "Each vendor sets their own return policy, but most offer a 7-day return window. You can message the vendor directly for help.";
      } else if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
        botResponse = "Prices are set directly by our local vendors. We guarantee some of the best prices in the market!";
      } else {
        botResponse = "I'm here to help you with anything related to ShopNest, from buying products to setting up your own seller store. What would you like to know?";
      }

      setChatMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <div className={`modal-overlay ${isAuthOpen ? 'open' : ''}`} onClick={() => setIsAuthOpen(false)}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setIsAuthOpen(false)}>×</button>
          
          <h2>{isLogin ? text.authLoginTitle : text.authTitle}</h2>
          <p>{isLogin ? text.authLoginDesc : text.authDesc}</p>
          
          {errorMsg && <div style={{color: '#ff5f56', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem'}}>{errorMsg}</div>}

          <button className="google-btn" onClick={() => alert("Google Auth will be configured in the next step!")}>
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          <form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <div className="role-selector">
                <button type="button" className={`role-btn ${authMode === 'BUYER' ? 'active' : ''}`} onClick={() => setAuthMode('BUYER')}>{text.roleBuyer}</button>
                <button type="button" className={`role-btn ${authMode === 'SELLER' ? 'active' : ''}`} onClick={() => setAuthMode('SELLER')}>{text.roleSeller}</button>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-submit">{isLogin ? text.authLoginBtn : text.authBtn}</button>
          </form>
          
          <div className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}>{isLogin ? "Sign Up" : "Log In"}</button>
          </div>
        </div>
      </div>

      <div className={`sidebar-backdrop ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
        <h2>{text.sideTitle}</h2>
        <p>{text.sideDesc}</p>
        <ul className="sidebar-links">
          <li><a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.sideLink1}</a></li>
          <li><a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.sideLink2}</a></li>
          <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.sideLink3}</a></li>
          <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.sideLink4}</a></li>
        </ul>
      </div>

      <header className="nav" id="nav">
        <button className="burger" aria-label="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
        <a className="logo" href="#" onClick={(e) => handleLinkClick(e, 0)}>ShopNest</a>
        
        <div className="nav-controls" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "2rem" }}>
          <ul style={{ margin: 0, padding: 0, display: "flex", gap: "1.5rem" }}>
            <li><a className="active" href="#" onClick={(e) => handleLinkClick(e, 0)}>{text.navHome}</a></li>
            <li className="nav-dropdown" onClick={() => toggleDropdown('products')}>
              <a>{text.navProducts} ▾</a>
              <div className={`nav-dropdown-menu ${openDropdown === 'products' ? 'open' : ''}`}>
                <a href="#" onClick={(e) => handleLinkClick(e, 2)}>{text.subNew}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 2)}>{text.subBest}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 2)}>{text.subCat}</a>
              </div>
            </li>
            <li className="nav-dropdown" onClick={() => toggleDropdown('vendors')}>
              <a>{text.navVendors} ▾</a>
              <div className={`nav-dropdown-menu ${openDropdown === 'vendors' ? 'open' : ''}`}>
                <a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.subAllVen}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.subTopVen}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); openAuthModal("SELLER", false); }}>{text.subBecome}</a>
              </div>
            </li>
            <li className="nav-dropdown" onClick={() => toggleDropdown('contact')}>
              <a>{text.navContact} ▾</a>
              <div className={`nav-dropdown-menu ${openDropdown === 'contact' ? 'open' : ''}`}>
                <a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.subSupport}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.subFaq}</a>
                <a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.subAbout}</a>
              </div>
            </li>
          </ul>
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <button className="lang-toggle" onClick={() => setLang(lang === "EN" ? "SW" : "EN")}>{lang === "EN" ? "SW" : "EN"}</button>
            <button className="btn-signup" onClick={() => openAuthModal("BUYER", false)}>{text.navSignup}</button>
          </div>
        </div>
      </header>

      <nav className="dots" aria-label="Sections">
        {[0, 1, 2, 3].map((i) => (
          <button key={i} aria-label={`Go to section ${i + 1}`} className={currentSlide === i ? 'active' : ''} onClick={() => scrollTo(i)}></button>
        ))}
      </nav>

      <main className="story" ref={storyRef}>
        <div className="stage">
          <section className={`slide ${currentSlide === 0 ? 'active' : ''}`} data-theme="dark">
            <div className="bg" style={{ backgroundColor: '#1a0f0a' }}>
              <video autoPlay muted loop playsInline className="bg">
                <source src="/7287924-uhd_3840_2160_25fps.mp4" type="video/mp4" />
              </video>
            </div>
            <div>
              <div className="eyebrow">{text.slide1Eyebrow}</div>
              <h1>{text.slide1Title}</h1>
              <p>{text.slide1Desc}</p>
              <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("BUYER", false); }}>{text.slide1Btn}</a>
            </div>
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
                    <span>HOME &nbsp; PRODUCTS &nbsp; VENDORS</span>
                  </div>
                  <div className="mini-hero">
                    <div className="mini-eyebrow">DISCOVER</div>
                    <div className="mini-title">EVERYTHING<br/>YOU NEED</div>
                    <div className="mini-desc">Shop from the best local vendors and creators.</div>
                    <div className="mini-btn">EXPLORE MARKETPLACE</div>
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
                    <div style={{fontSize: '6px', color: '#b9825a', letterSpacing: '1px', marginBottom: '2px'}}>DISCOVER</div>
                    <div className="mobile-title">EVERYTHING<br/>YOU NEED</div>
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

          <section className={`slide split ${currentSlide === 1 ? 'active' : ''}`} data-theme="light">
            <div className="split-left">
              <div className="eyebrow">{text.slide2L}</div>
              <h2>{text.slide2LTitle}</h2>
              <p>{text.slide2LDesc}</p>
              <ul className="feature-list">
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> {text.featL1}</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> {text.featL2}</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> {text.featL3}</li>
              </ul>
              <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("BUYER", false); }}>{text.slide2LBtn}</a>
            </div>
            <div className="split-right">
              <div className="content-wrapper">
                <div className="eyebrow">{text.slide2R}</div>
                <h2>{text.slide2RTitle}</h2>
                <p>{text.slide2RDesc}</p>
                <ul className="feature-list">
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> {text.featR1}</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> {text.featR2}</li>
                  <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> {text.featR3}</li>
                </ul>
                <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("SELLER", false); }}>{text.slide2RBtn}</a>
              </div>
            </div>
            <h1 className="big-title">{text.slide2Title}</h1>
          </section>

          <section className={`slide ${currentSlide === 2 ? 'active' : ''}`} data-theme="dark">
            <div className="bg" style={{ backgroundColor: '#1a0f0a' }}>
              <video autoPlay muted loop playsInline className="bg">
                <source src="/5585939-hd_1920_1080_25fps.mp4" type="video/mp4" />
              </video>
            </div>
            <div>
              <div className="eyebrow">{text.slide3Eyebrow}</div>
              <h1>{text.slide3Title}</h1>
              <p>{text.slide3Desc}</p>
              <a className="btn-ghost" href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.slide3Btn}</a>
            </div>
          </section>

          <section className={`slide ${currentSlide === 3 ? 'active' : ''}`} data-theme="dark">
            <div className="bg" style={{ backgroundColor: '#1a0f0a' }}>
              <video autoPlay muted loop playsInline className="bg">
                <source src="/8938253-hd_1080_1920_30fps.mp4" type="video/mp4" />
              </video>
            </div>
            <div>
              <div className="eyebrow">{text.slide4Eyebrow}</div>
              <h1>{text.slide4Title}</h1>
              <p>{text.slide4Desc}</p>
              <a className="btn-ghost" href="#" onClick={(e) => { e.preventDefault(); openAuthModal("BUYER", false); }}>{text.slide4Btn}</a>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><div className="logo-icon">S</div> ShopNest.</h3>
            <p>{text.footDesc}</p>
            <button className="footer-contact" onClick={() => setIsChatOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {text.footChat}
            </button>
          </div>
          <div className="footer-col">
            <h4>{text.footShop}</h4>
            <ul>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.footS1}</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.footS2}</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.footS3}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{text.footSell}</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openAuthModal("SELLER", false); }}>{text.footSe1}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openAuthModal("SELLER", true); }}>{text.footSe2}</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{text.footAbout}</h4>
            <ul>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.footA1}</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.footA2}</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.footA3}</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.footA4}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{text.footCopy}</span>
          <span>{text.footNote}</span>
        </div>
      </footer>

      {/* CHATBOT UI */}
      <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>{text.chatTitle}</h3>
          <button className="chat-close" onClick={() => setIsChatOpen(false)}>×</button>
        </div>
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <span className="typing-dots">...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleChatSubmit} className="chat-input-area">
          <input 
            type="text" 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            placeholder={text.chatPlaceholder} 
          />
          <button type="submit" className="chat-send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

      <button className="chat" aria-label="Chat" onClick={() => setIsChatOpen(!isChatOpen)}>
        <svg viewBox="0 0 24 24">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </button>
    </>
  );
}