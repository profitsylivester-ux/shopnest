"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const storyRef = useRef<HTMLDivElement>(null);

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
      footCopy: "© 2026 ShopNest. All rights reserved.", footNote: "ShopNest connects buyers and sellers securely."
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
      footCopy: "© 2026 ShopNest. Haki zote zimehifadhiwa.", footNote: "ShopNest inaunganisha wanunuzi na wauzaji kwa usalama."
    }
  };
  const text = t[lang];

  return (
    <>
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
                <a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.subBecome}</a>
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
            <button className="lang-toggle" onClick={() => setLang(lang === "EN" ? "SW" : "EN")}>
               {lang === "EN" ? "SW" : "EN"}
            </button>
            <a className="btn-signup" href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.navSignup}</a>
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
              <a className="btn-ghost" href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.slide1Btn}</a>
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
                      <div className="mini-info">
                        <div></div>
                        <div style={{width: '40%'}}></div>
                      </div>
                    </div>
                    <div className="mini-product">
                      <img className="mini-img" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop" alt="Watch" />
                      <div className="mini-info">
                        <div></div>
                        <div style={{width: '30%'}}></div>
                      </div>
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
                      <div className="mobile-info">
                        <div></div>
                        <div style={{width: '50%'}}></div>
                      </div>
                    </div>
                    <div className="mobile-product">
                      <img className="mobile-img" src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=200&auto=format&fit=crop" alt="Camera" />
                      <div className="mobile-info">
                        <div></div>
                        <div style={{width: '40%'}}></div>
                      </div>
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
              <a className="btn-ghost" href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.slide2LBtn}</a>
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
                <a className="btn-ghost" href="#" onClick={(e) => handleLinkClick(e, 3)}>{text.slide2RBtn}</a>
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
              <a className="btn-ghost" href="#">{text.slide4Btn}</a>
            </div>
          </section>

        </div>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><div className="logo-icon">S</div> ShopNest.</h3>
            <p>{text.footDesc}</p>
            <button className="footer-contact">
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
              <li><a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.footSe1}</a></li>
              <li><a href="#" onClick={(e) => handleLinkClick(e, 1)}>{text.footSe2}</a></li>
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

      <button className="chat" aria-label="Chat">
        <svg viewBox="0 0 24 24">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </button>
    </>
  );
}
