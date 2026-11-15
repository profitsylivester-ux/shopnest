"use client";
import { useCallback, useEffect, useState } from "react";

export type Lang = "EN" | "SW";
const KEY = "shopnest_lang";

export function readLang(): Lang {
  try { return localStorage.getItem(KEY) === "SW" ? "SW" : "EN"; } catch { return "EN"; }
}

// One language choice for the whole website, remembered in the browser.
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("EN");
  useEffect(() => {
    setLang(readLang());
    const on = () => setLang(readLang());
    window.addEventListener("shopnest-lang", on);
    return () => window.removeEventListener("shopnest-lang", on);
  }, []);
  const set = useCallback((l: Lang) => {
    try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
    setLang(l);
    window.dispatchEvent(new Event("shopnest-lang"));
  }, []);
  return [lang, set];
}

const EN = {
  home: "Home", marketplace: "Marketplace", shops: "Shops", help: "Help",
  allProducts: "All products", newArrivals: "New arrivals", categories: "Categories",
  allShops: "All shops", openShop: "Open a shop", support: "Support", faqs: "FAQs", about: "About us",
  signIn: "Sign in", signUp: "Sign up", signOut: "Sign out", dashboard: "My dashboard", admin: "Admin area", menu: "Menu",
  sold: "Sold out", lowStock: "Only {n} left", newTag: "New", chatAria: "Chat with the seller on WhatsApp", noPhoto: "No photo",
  darkMode: "Switch to dark mode", lightMode: "Switch to light mode",
  noProductsYet: "No products yet. Please check back soon.", seeAll: "Browse the marketplace", hi: "Hi",
  mpTitle: "Marketplace", mpSub: "Products from real sellers. Tap WhatsApp to talk to the seller directly.",
  results: "{n} products", resultsOne: "1 product", search: "Search products or shops", sortBy: "Sort by",
  newest: "Newest", priceAsc: "Price: low to high", priceDesc: "Price: high to low",
  filters: "Filters", category: "Category", allCats: "All categories", price: "Price (TZS)", min: "Min", max: "Max", apply: "Apply",
  location: "City or region", anywhere: "Anywhere", condition: "Condition", any: "Any", condNew: "New", condUsed: "Used", condRef: "Refurbished",
  inStock: "In stock only", onSale: "On sale", clear: "Clear all", none: "No products match", noneHint: "Try fewer filters or a different word.",
  prev: "Previous", next: "Next", pageOf: "Page {a} of {b}", shopByCat: "Shop by category", loading: "Loading...", loadError: "Could not load products. Is the backend running?",
  shopsTitle: "Shops", shopsSub: "Real sellers on ShopNest. Open a shop to see everything they sell.", searchShops: "Search shops",
  visit: "Visit shop", nProducts: "{n} products", oneProduct: "1 product", noShops: "No shops to show yet.", noShopMatch: "No shop matches your search.",
  physical: "Physical shop", online: "Online shop", both: "Online and physical shop",
  backToMarket: "Back to marketplace", chat: "Chat on WhatsApp", share: "Share on WhatsApp", copy: "Copy link", copied: "Link copied",
  soldOutNote: "This item is sold out right now.", chatNote: "You will chat with the seller directly on WhatsApp. ShopNest does not take payments.",
  soldBy: "Sold by", moreFrom: "More from this shop", inStockLabel: "In stock", lowLabel: "Low stock", condLabel: "Condition", catLabel: "Category", descLabel: "Description",
  notFound: "We could not find that page.", productMissing: "This product is not available.", networkError: "Network error. Please try again.",
  storeProducts: "Products", storeEmpty: "This shop has no products yet.", storePaused: "This shop is on a break right now. Please check back later.",
  findUs: "Find us", hours: "Opening hours", delivery: "Delivery and returns", follow: "Follow us", closed: "Closed", storeMissing: "Store not found.",
  footTag: "A multi-vendor marketplace for Tanzania. Buyers talk to sellers directly on WhatsApp.",
  footShop: "Shop", footSell: "Sell", footHelp: "Help", footLegal: "Legal", sellerDash: "Seller dashboard", privacy: "Privacy policy", terms: "Terms of use",
  rights: "\u00a9 2026 SentinEx Co Ltd. All rights reserved.",
  welcomeBack: "Welcome back", joinTitle: "Create your account", loginDesc: "Sign in to continue.", joinDesc: "Choose how you will use ShopNest.",
  orEmail: "or continue with email", buyer: "Buyer", seller: "Seller", fullName: "Full name", email: "Email address", password: "Password",
  showPw: "Show password", hidePw: "Hide password", signInBtn: "Sign in", createBtn: "Create account", noAccount: "Don't have an account?", haveAccount: "Already have an account?",
  close: "Close", working: "Please wait...", pwHint: "At least 8 characters", authFail: "Something went wrong. Please try again.",
};
const SW: typeof EN = {
  home: "Nyumbani", marketplace: "Soko", shops: "Maduka", help: "Msaada",
  allProducts: "Bidhaa zote", newArrivals: "Bidhaa mpya", categories: "Makundi",
  allShops: "Maduka yote", openShop: "Fungua duka", support: "Msaada", faqs: "Maswali ya mara kwa mara", about: "Kuhusu sisi",
  signIn: "Ingia", signUp: "Jisajili", signOut: "Toka", dashboard: "Dashibodi yangu", admin: "Eneo la msimamizi", menu: "Menyu",
  sold: "Imeisha", lowStock: "Zimebaki {n} tu", newTag: "Mpya", chatAria: "Wasiliana na muuzaji kwa WhatsApp", noPhoto: "Hakuna picha",
  darkMode: "Badilisha kuwa hali ya giza", lightMode: "Badilisha kuwa hali ya mwanga",
  noProductsYet: "Bado hakuna bidhaa. Tafadhali rudi baadaye.", seeAll: "Tembelea soko", hi: "Habari",
  mpTitle: "Soko", mpSub: "Bidhaa kutoka kwa wauzaji halisi. Bonyeza WhatsApp kuzungumza na muuzaji moja kwa moja.",
  results: "Bidhaa {n}", resultsOne: "Bidhaa 1", search: "Tafuta bidhaa au maduka", sortBy: "Panga kwa",
  newest: "Mpya zaidi", priceAsc: "Bei: chini hadi juu", priceDesc: "Bei: juu hadi chini",
  filters: "Vichujio", category: "Kundi", allCats: "Makundi yote", price: "Bei (TZS)", min: "Chini", max: "Juu", apply: "Tumia",
  location: "Mji au mkoa", anywhere: "Popote", condition: "Hali", any: "Yoyote", condNew: "Mpya", condUsed: "Iliyotumika", condRef: "Iliyorekebishwa",
  inStock: "Zilizopo tu", onSale: "Zenye punguzo", clear: "Futa vyote", none: "Hakuna bidhaa zinazolingana", noneHint: "Jaribu vichujio vichache au neno lingine.",
  prev: "Iliyopita", next: "Inayofuata", pageOf: "Ukurasa {a} kati ya {b}", shopByCat: "Nunua kwa kundi", loading: "Inapakia...", loadError: "Imeshindwa kupakia bidhaa. Je, seva inafanya kazi?",
  shopsTitle: "Maduka", shopsSub: "Wauzaji halisi kwenye ShopNest. Fungua duka kuona kila kitu wanachouza.", searchShops: "Tafuta maduka",
  visit: "Tembelea duka", nProducts: "Bidhaa {n}", oneProduct: "Bidhaa 1", noShops: "Bado hakuna maduka ya kuonyesha.", noShopMatch: "Hakuna duka linalolingana na utafutaji wako.",
  physical: "Duka halisi", online: "Duka la mtandaoni", both: "Duka la mtandaoni na halisi",
  backToMarket: "Rudi sokoni", chat: "Wasiliana kwa WhatsApp", share: "Shiriki kwa WhatsApp", copy: "Nakili kiungo", copied: "Kiungo kimenakiliwa",
  soldOutNote: "Bidhaa hii imeisha kwa sasa.", chatNote: "Utazungumza na muuzaji moja kwa moja kwa WhatsApp. ShopNest haipokei malipo.",
  soldBy: "Inauzwa na", moreFrom: "Zaidi kutoka duka hili", inStockLabel: "Ipo", lowLabel: "Imebaki kidogo", condLabel: "Hali", catLabel: "Kundi", descLabel: "Maelezo",
  notFound: "Hatukuweza kupata ukurasa huo.", productMissing: "Bidhaa hii haipatikani.", networkError: "Hitilafu ya mtandao. Tafadhali jaribu tena.",
  storeProducts: "Bidhaa", storeEmpty: "Duka hili bado halina bidhaa.", storePaused: "Duka hili limepumzika kwa sasa. Tafadhali rudi baadaye.",
  findUs: "Tupate", hours: "Saa za kufungua", delivery: "Usafirishaji na kurudisha", follow: "Tufuate", closed: "Imefungwa", storeMissing: "Duka halijapatikana.",
  footTag: "Soko la wauzaji wengi la Tanzania. Wanunuzi huzungumza na wauzaji moja kwa moja kwa WhatsApp.",
  footShop: "Nunua", footSell: "Uza", footHelp: "Msaada", footLegal: "Kisheria", sellerDash: "Dashibodi ya muuzaji", privacy: "Sera ya faragha", terms: "Masharti ya matumizi",
  rights: "\u00a9 2026 SentinEx Co Ltd. Haki zote zimehifadhiwa.",
  welcomeBack: "Karibu tena", joinTitle: "Fungua akaunti yako", loginDesc: "Ingia ili kuendelea.", joinDesc: "Chagua jinsi utakavyotumia ShopNest.",
  orEmail: "au endelea na barua pepe", buyer: "Mnunuzi", seller: "Muuzaji", fullName: "Jina kamili", email: "Barua pepe", password: "Nenosiri",
  showPw: "Onyesha nenosiri", hidePw: "Ficha nenosiri", signInBtn: "Ingia", createBtn: "Fungua akaunti", noAccount: "Huna akaunti?", haveAccount: "Tayari una akaunti?",
  close: "Funga", working: "Subiri...", pwHint: "Angalau herufi 8", authFail: "Kuna tatizo. Tafadhali jaribu tena.",
};

export type Dict = typeof EN;
export const T: Record<Lang, Dict> = { EN, SW };
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
