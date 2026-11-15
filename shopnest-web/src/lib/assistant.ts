// The ShopNest assistant's built-in guide. Everything it says is written here, in English and Swahili,
// and matches the real screens of the website. It never makes anything up: when the guide has no answer it says so
// and points to Support. It does not cover the admin area or privacy matters.
import type { Lang } from "./i18n";

type L = { EN: string; SW: string };
export type Link = { label: L; href: string };
export type Entry = { id: string; q: L; keys: string[]; a: L; links?: Link[]; rel?: string[] };

export const SUPPORT_WA = "255748743673";
export const SUPPORT_WA_SHOW = "+255 748 743 673";
export const SUPPORT_MAIL = "profitsylivester@gmail.com";

const L_MARKET: Link = { label: { EN: "Open the marketplace", SW: "Fungua soko" }, href: "/marketplace" };
const L_SHOPS: Link = { label: { EN: "See all shops", SW: "Tazama maduka yote" }, href: "/shops" };
const L_SUPPORT: Link = { label: { EN: "Support page", SW: "Ukurasa wa Msaada" }, href: "/support" };
const L_FAQ: Link = { label: { EN: "FAQs", SW: "Maswali ya mara kwa mara" }, href: "/faq" };
const L_ABOUT: Link = { label: { EN: "About us", SW: "Kuhusu sisi" }, href: "/about" };
const L_TERMS: Link = { label: { EN: "Terms of use", SW: "Masharti ya matumizi" }, href: "/terms" };
const L_PRIVACY: Link = { label: { EN: "Privacy policy", SW: "Sera ya faragha" }, href: "/privacy" };
const L_DASH: Link = { label: { EN: "My dashboard", SW: "Dashibodi yangu" }, href: "/seller/dashboard" };

export const ENTRIES: Entry[] = [
  {
    id: "what",
    q: { EN: "What is ShopNest?", SW: "ShopNest ni nini?" },
    keys: ["what is shopnest", "about shopnest", "tell me about shopnest", "what do you do", "who are you", "shopnest ni nini", "shopnest ni nini", "ni nini shopnest", "wewe ni nani", "mnafanya nini"],
    a: {
      EN: "ShopNest is a marketplace for Tanzania. Sellers open shops and list their products, and buyers talk to the sellers directly on WhatsApp.\n\n**ShopNest does not take payments.** You agree the price, payment and delivery with the seller.\n\nThe company behind it is SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania.",
      SW: "ShopNest ni soko la mtandaoni la Tanzania. Wauzaji hufungua maduka na kuweka bidhaa zao, na wanunuzi huzungumza na wauzaji moja kwa moja kupitia WhatsApp.\n\n**ShopNest haipokei malipo.** Unakubaliana bei, malipo na usafirishaji na muuzaji mwenyewe.\n\nKampuni inayoendesha ni SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania.",
    },
    links: [L_ABOUT],
    rel: ["how_buy", "open_shop", "payments"],
  },
  {
    id: "how_buy",
    q: { EN: "How do I buy something?", SW: "Ninawezaje kununua?" },
    keys: ["how to buy", "how do i buy", "how can i buy", "buy something", "i want to buy", "place an order", "how to order", "how do i order", "order", "kununua", "nataka kununua", "ninawezaje kununua", "naagizaje", "kuagiza", "nunua"],
    a: {
      EN: "ShopNest has no cart or checkout. You buy by talking to the seller:\n\n1. Find a product: open the **Marketplace** and use search and filters.\n2. Open the product to see the price, stock, condition and the seller.\n3. Tap **Chat on WhatsApp**. WhatsApp opens with a message to the seller.\n4. Agree the price, payment and delivery with the seller.\n\nYou do not need an account just to look or to message a seller.",
      SW: "ShopNest haina kikapu wala malipo ya mtandaoni. Unanunua kwa kuzungumza na muuzaji:\n\n1. Tafuta bidhaa: fungua **Soko** na tumia utafutaji na vichujio.\n2. Fungua bidhaa uone bei, idadi iliyopo, hali yake na muuzaji.\n3. Bonyeza **Zungumza kwa WhatsApp**. WhatsApp itafunguka na ujumbe kwa muuzaji.\n4. Kubaliana na muuzaji kuhusu bei, malipo na usafirishaji.\n\nHuhitaji akaunti ili kuangalia bidhaa au kumtumia muuzaji ujumbe.",
    },
    links: [L_MARKET],
    rel: ["search_filters", "payments", "whatsapp"],
  },
  {
    id: "payments",
    q: { EN: "How do I pay? Is there delivery?", SW: "Nalipaje? Kuna usafirishaji?" },
    keys: ["send money", "send payment", "where do i send money", "tuma pesa", "pesa", "how do i pay", "how to pay", "payment", "payments", "pay for", "checkout", "check out", "cart", "mpesa", "m-pesa", "tigo pesa", "airtel money", "delivery", "deliver", "shipping", "return", "returns", "refund", "nalipaje", "malipo", "kulipa", "lipa", "usafirishaji", "kusafirisha", "kurudisha", "kikapu"],
    a: {
      EN: "**ShopNest does not take payments and does not deliver.** There is no checkout. You and the seller agree how to pay and how you get the item.\n\nMany shops write their delivery and returns information on their shop page, under **Delivery and returns**. Read it, and ask the seller on WhatsApp before you pay.",
      SW: "**ShopNest haipokei malipo wala haisafirishi bidhaa.** Hakuna malipo ya mtandaoni. Wewe na muuzaji mnakubaliana jinsi ya kulipa na jinsi ya kupata bidhaa.\n\nDuka nyingi huandika maelezo ya usafirishaji na kurudisha bidhaa kwenye ukurasa wa duka, sehemu ya **Usafirishaji na kurudisha**. Isome, na muulize muuzaji kwa WhatsApp kabla ya kulipa.",
    },
    rel: ["how_buy", "whatsapp", "support"],
  },
  {
    id: "whatsapp",
    q: { EN: "How do I contact a seller?", SW: "Ninawasiliana vipi na muuzaji?" },
    keys: ["contact a seller", "contact the seller", "contact seller", "talk to the seller", "talk to seller", "message the seller", "message a seller", "chat with the seller", "chat on whatsapp", "whatsapp button", "whatsapp", "reach the seller", "kuwasiliana na muuzaji", "kumtumia muuzaji", "zungumza na muuzaji", "kuzungumza na muuzaji", "wasiliana na muuzaji", "ujumbe kwa muuzaji"],
    a: {
      EN: "Tap the green **WhatsApp** button on a product card, or **Chat on WhatsApp** on the product page. WhatsApp opens with a message ready for the seller's number. You do not need to sign in.\n\nIf an item is sold out, the button is switched off.",
      SW: "Bonyeza kitufe cha kijani cha **WhatsApp** kwenye kadi ya bidhaa, au **Zungumza kwa WhatsApp** kwenye ukurasa wa bidhaa. WhatsApp itafunguka na ujumbe tayari kwa namba ya muuzaji. Huhitaji kuingia kwenye akaunti.\n\nKama bidhaa imeisha, kitufe huzimwa.",
    },
    rel: ["sold_out", "how_buy", "payments"],
  },
  {
    id: "search_filters",
    q: { EN: "How do I search and filter products?", SW: "Natafutaje na kuchuja bidhaa?" },
    keys: ["cheap", "cheap products", "affordable", "bei rahisi", "rahisi", "search", "find a product", "find products", "how to find", "filter", "filters", "sort", "sort by", "cheapest", "price range", "min price", "max price", "condition filter", "used items", "on sale", "in stock only", "category", "categories", "kutafuta", "natafutaje", "tafuta", "kichujio", "vichujio", "kuchuja", "panga kwa", "bei ya chini", "makundi", "kundi"],
    a: {
      EN: "On the **Marketplace** page, use the filters on the left:\n\n- **Search products or shops**: type a word.\n- **Sort by**: Newest, Price low to high, Price high to low.\n- **Category**: pick a category (or tap a category tile).\n- **Price (TZS)**: type Min and Max, then Apply.\n- **City or region**: all regions of Tanzania are listed.\n- **Condition**: New, Used or Refurbished.\n- **In stock only** and **On sale**.\n- **Clear all** removes every filter.\n\nThe products section on the home page has search, sort, category and region.",
      SW: "Kwenye ukurasa wa **Soko**, tumia vichujio upande wa kushoto:\n\n- **Tafuta bidhaa au maduka**: andika neno.\n- **Panga kwa**: Mpya zaidi, Bei chini hadi juu, Bei juu hadi chini.\n- **Kundi**: chagua kundi (au bonyeza kigae cha kundi).\n- **Bei (TZS)**: andika Chini na Juu, kisha Weka.\n- **Mji au mkoa**: mikoa yote ya Tanzania ipo.\n- **Hali**: Mpya, Imetumika au Imekarabatiwa.\n- **Zilizopo tu** na **Zilizopunguzwa bei**.\n- **Futa vyote** huondoa vichujio vyote.\n\nSehemu ya bidhaa kwenye ukurasa wa mwanzo ina utafutaji, upangaji, kundi na mkoa.",
    },
    links: [L_MARKET],
    rel: ["labels", "region_filter", "how_buy"],
  },
  {
    id: "region_filter",
    q: { EN: "Can I find shops in my region?", SW: "Naweza kupata maduka ya mkoa wangu?" },
    keys: ["my region", "my city", "near me", "nearby", "shops in", "region", "regions", "location", "which regions", "mbeya", "dar es salaam", "arusha", "mwanza", "dodoma", "mkoa", "mikoa", "karibu nami", "mkoa wangu", "mji"],
    a: {
      EN: "Yes. On the **Marketplace** page (and in the home page products section) choose your place under **City or region**. All the regions of Tanzania are listed, and you only see products from shops in that region.\n\nA shop's region and town are shown on its product cards and shop page.",
      SW: "Ndiyo. Kwenye ukurasa wa **Soko** (na sehemu ya bidhaa ya ukurasa wa mwanzo) chagua eneo lako chini ya **Mji au mkoa**. Mikoa yote ya Tanzania ipo, na utaona bidhaa za maduka ya mkoa huo tu.\n\nMkoa na mji wa duka huonyeshwa kwenye kadi za bidhaa na ukurasa wa duka.",
    },
    links: [L_MARKET, L_SHOPS],
    rel: ["search_filters", "how_buy"],
  },
  {
    id: "labels",
    q: { EN: "What do New, -% and Low stock mean?", SW: "New, -% na Zimebaki zinamaanisha nini?" },
    keys: ["price is real", "real price", "fake discount", "is the discount real", "bei ni ya kweli", "new tag", "new label", "what does new mean", "discount", "discount tag", "percent off", "tag", "tags", "badge", "badges", "label", "labels", "low stock", "only left", "only 3 left", "what does low stock mean", "mpya inamaanisha", "punguzo", "zimebaki", "alama", "lebo"],
    a: {
      EN: "Every label on a product card is real:\n\n- **New**: the product was added in the last 7 days.\n- **-20%** (or another number): the seller entered a real old price that is higher than the current price.\n- **Only 3 left**: shown only when 3 or fewer are in stock.\n- **Sold out**: nothing in stock. The WhatsApp button is switched off.\n\nThere are no fake discounts or fake stars on ShopNest.",
      SW: "Kila alama kwenye kadi ya bidhaa ni ya kweli:\n\n- **Mpya**: bidhaa iliwekwa ndani ya siku 7 zilizopita.\n- **-20%** (au namba nyingine): muuzaji ameweka bei ya zamani halisi iliyo juu kuliko bei ya sasa.\n- **Zimebaki 3**: huonekana tu pale zilizopo ni 3 au chini.\n- **Imeisha**: hakuna iliyobaki. Kitufe cha WhatsApp huzimwa.\n\nShopNest haina punguzo bandia wala nyota bandia.",
    },
    rel: ["sold_out", "old_price", "search_filters"],
  },
  {
    id: "sold_out",
    q: { EN: "Why is an item sold out?", SW: "Kwa nini bidhaa imeisha?" },
    keys: ["sold out", "out of stock", "item is sold out", "why sold out", "cant chat", "button is disabled", "imeisha", "haipo", "imekwisha", "hakuna stock"],
    a: {
      EN: "**Sold out** means the seller has set the stock to 0. The WhatsApp button is switched off for that item. Check the shop page for other products, or look again later: sellers update their stock when they get more.",
      SW: "**Imeisha** inamaanisha muuzaji ameweka idadi ya bidhaa kuwa 0. Kitufe cha WhatsApp huzimwa kwa bidhaa hiyo. Angalia ukurasa wa duka kwa bidhaa nyingine, au angalia tena baadaye: wauzaji husasisha idadi wanapopata bidhaa zaidi.",
    },
    rel: ["labels", "whatsapp"],
  },
  {
    id: "share",
    q: { EN: "How do I share a product or shop?", SW: "Nashirikishaje bidhaa au duka?" },
    keys: ["share my product", "share my shop", "share product", "share shop", "nashirikisha", "nashirikishaje", "kushiriki", "share", "share a product", "share on whatsapp", "copy link", "copy the link", "send link", "shirikisha", "kushirikisha", "nakili kiungo", "tuma kiungo", "kiungo"],
    a: {
      EN: "On a product page tap **Share on WhatsApp** to send it to a friend, or **Copy link** to paste it anywhere. Sellers can do the same for their whole shop in Dashboard, Settings, **Shop link**.",
      SW: "Kwenye ukurasa wa bidhaa bonyeza **Shiriki kwa WhatsApp** kumtumia rafiki, au **Nakili kiungo** kukibandika popote. Wauzaji wanaweza kufanya hivyo kwa duka lao lote kwenye Dashibodi, Mipangilio, **Kiungo cha duka**.",
    },
    rel: ["shop_link", "how_buy"],
  },
  {
    id: "shops",
    q: { EN: "Where can I see all shops?", SW: "Naona wapi maduka yote?" },
    keys: ["all shops", "list of shops", "see shops", "visit shop", "visit a shop", "shop page", "browse shops", "sellers list", "shop list", "maduka yote", "orodha ya maduka", "tembelea duka", "ukurasa wa duka", "wauzaji"],
    a: {
      EN: "Open **Shops** in the menu. It lists the real shops on ShopNest and you can search them. Open a shop to see its products, opening hours, delivery information and social links. On a product page, **Visit shop** takes you to the seller's shop.",
      SW: "Fungua **Maduka** kwenye menyu. Inaonyesha maduka halisi ya ShopNest na unaweza kuyatafuta. Fungua duka uone bidhaa zake, saa za kufungua, maelezo ya usafirishaji na mitandao ya kijamii. Kwenye ukurasa wa bidhaa, **Tembelea duka** hukupeleka kwenye duka la muuzaji.",
    },
    links: [L_SHOPS],
    rel: ["how_buy", "region_filter"],
  },
  {
    id: "signup",
    q: { EN: "How do I create an account?", SW: "Ninafungua akaunti vipi?" },
    keys: ["ninafungua akaunti", "nafungua akaunti", "nafunguaje akaunti", "ninafunguaje akaunti", "najisajili", "najisajilije", "create an account", "create account", "sign up", "signup", "register", "make an account", "new account", "join shopnest", "fungua akaunti", "kufungua akaunti", "jisajili", "kujisajili", "akaunti mpya", "sajili"],
    a: {
      EN: "1. Tap **Sign up** at the top right.\n2. Choose **Buyer** (to shop) or **Seller** (to open a shop).\n3. Enter your **full name**, **email address** and a **password** of at least 8 characters, then tap **Create account**.\n\nOr tap the Google button to sign up with your Google account.\n\nBuying and messaging sellers works without an account. You need a **Seller** account to open a shop.",
      SW: "1. Bonyeza **Jisajili** juu kulia.\n2. Chagua **Mnunuzi** (kununua) au **Muuzaji** (kufungua duka).\n3. Weka **jina kamili**, **barua pepe** na **nenosiri** lenye angalau herufi 8, kisha bonyeza **Fungua akaunti**.\n\nAu bonyeza kitufe cha Google kujisajili kwa akaunti yako ya Google.\n\nKununua na kuwasiliana na wauzaji kunawezekana bila akaunti. Unahitaji akaunti ya **Muuzaji** kufungua duka.",
    },
    rel: ["signin", "google", "open_shop"],
  },
  {
    id: "signin",
    q: { EN: "How do I sign in or sign out?", SW: "Naingia na kutoka vipi?" },
    keys: ["naingia", "naingiaje", "ninaingiaje", "natokaje", "natoka", "sign in", "signin", "log in", "login", "how to login", "sign out", "signout", "log out", "logout", "my account", "ingia", "kuingia", "toka", "kutoka", "ondoka", "akaunti yangu"],
    a: {
      EN: "**Sign in**: tap **Sign in** at the top right, then enter your email and password (or use the Google button).\n\n**Sign out**: once you are signed in, your name appears at the top right. Tap it and choose **Sign out** in the card that opens. Sellers also find **My dashboard** there. Inside the seller dashboard, use **Logout** at the bottom of the left menu.",
      SW: "**Kuingia**: bonyeza **Ingia** juu kulia, kisha weka barua pepe na nenosiri (au tumia kitufe cha Google).\n\n**Kutoka**: ukishaingia, jina lako linaonekana juu kulia. Liguse kisha chagua **Toka** kwenye kadi inayofunguka. Wauzaji pia hupata **Dashibodi yangu** hapo. Ndani ya dashibodi ya muuzaji, tumia **Logout** chini ya menyu ya kushoto.",
    },
    rel: ["signup", "forgot", "google"],
  },
  {
    id: "google",
    q: { EN: "How does Google sign-in work?", SW: "Kuingia kwa Google kunafanyaje kazi?" },
    keys: ["google", "gmail", "sign in with google", "continue with google", "google account", "another google account", "use another account", "google button", "email on the google button", "akaunti ya google", "kwa google"],
    a: {
      EN: "Tap the **Google** button in the sign-in or sign-up card and choose your Google account. The account shown on the button is picked by Google from the browser you are using. To use a different one, tap the button and choose **Use another account**.\n\nA new Google account becomes a Buyer account (or a Seller account if you chose Seller). If your email already has a ShopNest password account, sign in with that email and password instead.",
      SW: "Bonyeza kitufe cha **Google** kwenye kadi ya kuingia au kujisajili kisha chagua akaunti yako ya Google. Akaunti inayoonekana kwenye kitufe huchaguliwa na Google kutoka kwenye kivinjari unachotumia. Kutumia nyingine, bonyeza kitufe kisha chagua **Tumia akaunti nyingine**.\n\nAkaunti mpya ya Google inakuwa akaunti ya Mnunuzi (au Muuzaji kama ulichagua Muuzaji). Kama barua pepe yako tayari ina akaunti ya ShopNest yenye nenosiri, ingia kwa barua pepe na nenosiri hilo.",
    },
    rel: ["signin", "signup"],
  },
  {
    id: "forgot",
    q: { EN: "I forgot my password", SW: "Nimesahau nenosiri" },
    keys: ["forgot my password", "forgot password", "forgotten password", "lost my password", "reset password", "reset my password", "cant sign in", "cannot sign in", "cant log in", "invalid credentials", "wrong password", "nimesahau nenosiri", "nimesahau", "sahau nenosiri", "badilisha nenosiri langu nimesahau", "siwezi kuingia"],
    a: {
      EN: "There is no automatic password reset yet. Please contact Support on WhatsApp and they will help you get back in.\n\nIf you remember your password and just want to change it, sellers can do that in Dashboard, Settings, **Change password**.",
      SW: "Bado hakuna njia ya kubadilisha nenosiri kiotomatiki. Tafadhali wasiliana na Msaada kwa WhatsApp, watakusaidia kuingia tena.\n\nKama unakumbuka nenosiri na unataka kulibadilisha tu, wauzaji wanaweza kufanya hivyo kwenye Dashibodi, Mipangilio, **Badilisha nenosiri**.",
    },
    rel: ["signin", "support", "change_password"],
  },
  {
    id: "open_shop",
    q: { EN: "How do I open a shop?", SW: "Ninafunguaje duka?" },
    keys: ["can i sell", "sell my", "sell here", "put my business online", "put it online", "business online", "small business", "start a business", "nauzaje", "naweza kuuza", "open a shop", "open shop", "open my shop", "start a shop", "start selling", "create a shop", "create shop", "create a store", "launch your store", "become a seller", "how to sell", "sell on shopnest", "i want to sell", "set up my shop", "setup my shop", "kufungua duka", "fungua duka", "kuuza", "nataka kuuza", "kuwa muuzaji", "anza kuuza", "ninafunguaje duka", "kuanzisha duka"],
    a: {
      EN: "1. **Create a Seller account**: tap **Sign up**, choose **Seller**, enter your name, email and password (a Buyer account cannot open a shop).\n2. You land on **Launch Your Store**. Fill in: **Store Name**, **WhatsApp Number** (like +255...), **Short Description**, **Location** (city or region), **Shop Type** (Online Seller, Physical Shop, or Both), and optionally a **Store Logo** and **Cover Banner**.\n3. Tap **Submit for Review**.\n4. Your shop waits for approval by the ShopNest team. Buyers cannot see it until it is approved.\n5. While you wait, add your products in the dashboard.\n\nAsk me about \"approval\", \"add a product\" or \"shop setup checklist\" for the next steps.",
      SW: "1. **Fungua akaunti ya Muuzaji**: bonyeza **Jisajili**, chagua **Muuzaji**, weka jina, barua pepe na nenosiri (akaunti ya Mnunuzi haiwezi kufungua duka).\n2. Utaingia kwenye **Launch Your Store**. Jaza: **Store Name** (jina la duka), **WhatsApp Number** (kama +255...), **Short Description** (maelezo mafupi), **Location** (mji au mkoa), **Shop Type** (Online Seller, Physical Shop, au Both), na hiari **Store Logo** na **Cover Banner**.\n3. Bonyeza **Submit for Review**.\n4. Duka lako linasubiri idhini ya timu ya ShopNest. Wanunuzi hawawezi kuliona hadi liidhinishwe.\n5. Ukisubiri, ongeza bidhaa zako kwenye dashibodi.\n\nNiulize kuhusu \"idhini\", \"kuongeza bidhaa\" au \"orodha ya kuandaa duka\" kwa hatua zinazofuata.",
    },
    links: [L_DASH],
    rel: ["approval", "add_product", "setup"],
  },
  {
    id: "approval",
    q: { EN: "Why can't buyers see my shop yet?", SW: "Kwa nini wanunuzi hawaoni duka langu?" },
    keys: ["cannot see my products", "cannot see my product", "cannot see my shop", "buyers cannot see", "buyers cant see", "halionekani", "hazionekani", "haionekani", "duka langu halionekani", "bidhaa zangu hazionekani", "approval", "approve", "approved", "under review", "waiting for approval", "pending", "my shop is not showing", "my shop is not visible", "shop not visible", "shop not showing", "buyers cannot see my shop", "cant see my shop", "cant see my products", "products not showing", "suspended", "idhini", "kuidhinishwa", "duka halionekani", "bidhaa hazionekani", "limesimamishwa", "linasubiri"],
    a: {
      EN: "Buyers see your shop and products only when all of these are true:\n\n- Your shop is **approved**. New shops wait for approval by the ShopNest team. The dashboard says \"Your shop is under review\" until then.\n- Your shop is not **suspended** and **Vacation mode** is off.\n- The product is **Active** (not hidden) and has been saved.\n\nIf approval is taking long, or the dashboard says your shop is suspended, message Support on WhatsApp with your shop name.",
      SW: "Wanunuzi huona duka na bidhaa zako pale tu mambo haya yote yanapotimia:\n\n- Duka lako **limeidhinishwa**. Maduka mapya husubiri idhini ya timu ya ShopNest. Dashibodi inasema \"Your shop is under review\" hadi hapo.\n- Duka halijasimamishwa na **Hali ya likizo** imezimwa.\n- Bidhaa ni **Active** (haijafichwa) na imehifadhiwa.\n\nKama idhini inachelewa, au dashibodi inasema duka limesimamishwa, tuma ujumbe kwa Msaada kupitia WhatsApp ukiwa na jina la duka lako.",
    },
    rel: ["vacation", "hide_product", "support"],
  },
  {
    id: "add_product",
    q: { EN: "How do I add a product?", SW: "Naongezaje bidhaa?" },
    keys: ["upload my products", "upload my product", "upload products", "where do i upload", "naweka bidhaa", "nawekaje bidhaa", "ninaongezaje bidhaa", "add a product", "add product", "add new product", "new product", "list a product", "post a product", "upload a product", "upload product", "how to add products", "sell a product", "put a product", "add items", "product form", "kuongeza bidhaa", "ongeza bidhaa", "weka bidhaa", "kuweka bidhaa", "bidhaa mpya", "naongezaje bidhaa"],
    a: {
      EN: "1. Sign in as a seller and open **My products** in the left menu of the dashboard.\n2. Tap **+ Add New Product**. A panel opens.\n3. Fill in:\n- **Product Name**\n- **Price (TZS)**\n- **Old price (optional)**: only if you are really lowering the price\n- **Description**\n- **Stock Quantity**\n- **Category** (or **Other** to type your own)\n- **Condition**: New, Used or Refurbished\n- **Image**: tap to choose a photo\n4. Tap **Save Product**.\n\nThe product shows on the marketplace once your shop is approved and the product is Active.",
      SW: "1. Ingia kama muuzaji kisha fungua **My products** kwenye menyu ya kushoto ya dashibodi.\n2. Bonyeza **+ Add New Product**. Paneli itafunguka.\n3. Jaza:\n- **Product Name** (jina la bidhaa)\n- **Price (TZS)** (bei)\n- **Old price (optional)** (bei ya zamani): tu kama kweli umepunguza bei\n- **Description** (maelezo)\n- **Stock Quantity** (idadi iliyopo)\n- **Category** (kundi) (au **Other** kuandika lako)\n- **Condition** (hali): New, Used au Refurbished\n- **Image** (picha): bonyeza kuchagua picha\n4. Bonyeza **Save Product**.\n\nBidhaa itaonekana sokoni pale duka lako likiidhinishwa na bidhaa ikiwa Active.",
    },
    links: [L_DASH],
    rel: ["photos", "old_price", "edit_product"],
  },
  {
    id: "photos",
    q: { EN: "What photo can I upload?", SW: "Naweza kupakia picha gani?" },
    keys: ["photo", "photos", "picture", "pictures", "image", "images", "upload a photo", "upload photo", "photo size", "image size", "how many photos", "multiple photos", "logo", "banner", "cover banner", "picha", "kupakia picha", "ukubwa wa picha", "nembo", "bango"],
    a: {
      EN: "- Each product has **one photo**. Choose it with the **Image** box when you add or edit the product.\n- Accepted: JPEG, PNG or WebP, up to **5 MB**.\n- ShopNest shrinks and optimises it for you, so you do not need to resize it.\n- Your shop **logo** and **banner** are set in Dashboard, Settings, **Shop profile** (or when you first create the shop).\n\nA clear, bright photo of the real item helps buyers trust you.",
      SW: "- Kila bidhaa ina **picha moja**. Ichague kwenye kisanduku cha **Image** unapoongeza au kuhariri bidhaa.\n- Zinazokubaliwa: JPEG, PNG au WebP, hadi **MB 5**.\n- ShopNest huipunguza na kuiboresha kwa ajili yako, kwa hiyo huhitaji kuibadilisha ukubwa.\n- **Nembo** na **bango** la duka lako huwekwa kwenye Dashibodi, Mipangilio, **Shop profile** (au unapofungua duka mara ya kwanza).\n\nPicha angavu na wazi ya bidhaa halisi huwasaidia wanunuzi kukuamini.",
    },
    rel: ["add_product", "shop_profile"],
  },
  {
    id: "edit_product",
    q: { EN: "How do I edit a product or change its price?", SW: "Nahariri bidhaa au kubadilisha bei vipi?" },
    keys: ["edit a product", "edit product", "change price", "change the price", "update price", "update a product", "update product", "change a product", "change product", "edit price", "edit stock", "update stock", "change stock", "change photo", "kuhariri bidhaa", "hariri bidhaa", "kubadilisha bei", "badilisha bei", "sasisha bidhaa", "kubadilisha bidhaa", "badilisha idadi"],
    a: {
      EN: "Open **My products** in the dashboard. On the product's card tap **Edit**. Change the name, price, stock, category, condition, description or photo, then tap **Save Changes**.\n\nKeep **Stock Quantity** correct: when it reaches 0 the item shows as Sold out.",
      SW: "Fungua **My products** kwenye dashibodi. Kwenye kadi ya bidhaa bonyeza **Edit**. Badilisha jina, bei, idadi, kundi, hali, maelezo au picha, kisha bonyeza **Save Changes**.\n\nHifadhi **Stock Quantity** sahihi: ikifika 0 bidhaa huonyeshwa kama Imeisha.",
    },
    links: [L_DASH],
    rel: ["stock", "old_price", "hide_product"],
  },
  {
    id: "hide_product",
    q: { EN: "How do I hide or remove a product?", SW: "Nafichaje au kuondoa bidhaa?" },
    keys: ["nafichaje", "ninaficha", "naficha", "nafuta", "nafutaje", "naondoaje", "ninaondoaje", "hide a product", "hide product", "hide my product", "remove a product", "remove product", "delete a product", "delete product", "take down", "unlist", "make active", "show a product again", "ficha bidhaa", "kuficha bidhaa", "kuondoa bidhaa", "futa bidhaa", "kufuta bidhaa", "onyesha tena"],
    a: {
      EN: "In **My products**, tap **Hide Product** on the product's card. It stops showing to buyers, and you can bring it back any time with **Make Active**.\n\nThere is no delete button yet, so hiding is the way to take a product off the shop for now.",
      SW: "Kwenye **My products**, bonyeza **Hide Product** kwenye kadi ya bidhaa. Haitaonekana tena kwa wanunuzi, na unaweza kuirudisha wakati wowote kwa **Make Active**.\n\nBado hakuna kitufe cha kufuta, kwa hiyo kuficha ndiyo njia ya kuondoa bidhaa dukani kwa sasa.",
    },
    rel: ["edit_product", "approval"],
  },
  {
    id: "stock",
    q: { EN: "How does stock work?", SW: "Idadi ya bidhaa (stock) inafanyaje kazi?" },
    keys: ["stock", "stock quantity", "inventory", "quantity", "how many in stock", "in stock", "idadi", "idadi ya bidhaa", "zilizopo", "hesabu ya bidhaa"],
    a: {
      EN: "**Stock Quantity** is how many you have. Buyers see **In stock** while it is above 3, **Only N left** when it is 3 or fewer, and **Sold out** at 0 (the WhatsApp button is then switched off).\n\nUpdate it any time: **My products**, **Edit**, change Stock Quantity, **Save Changes**.",
      SW: "**Stock Quantity** ni idadi uliyonayo. Wanunuzi huona **Ipo** ikiwa zaidi ya 3, **Zimebaki N tu** ikiwa 3 au chini, na **Imeisha** ikiwa 0 (kitufe cha WhatsApp huzimwa).\n\nIsasishe wakati wowote: **My products**, **Edit**, badilisha Stock Quantity, **Save Changes**.",
    },
    rel: ["edit_product", "labels"],
  },
  {
    id: "old_price",
    q: { EN: "How do I show a discount?", SW: "Naonyeshaje punguzo la bei?" },
    keys: ["show a discount", "add a discount", "put a discount", "discount for my product", "old price", "was price", "sale price", "put on sale", "reduce price", "lower the price", "how to discount", "punguzo", "bei ya zamani", "punguza bei", "kupunguza bei", "naonyeshaje punguzo"],
    a: {
      EN: "When you add or edit a product, type your earlier price in **Old price (optional)** and the new, lower price in **Price (TZS)**. The product then shows a real **-N%** tag and the old price crossed out.\n\nUse it only when you are really lowering the price: the old price must be higher than the current price, or no tag is shown.",
      SW: "Unapoongeza au kuhariri bidhaa, andika bei yako ya awali kwenye **Old price (optional)** na bei mpya ya chini kwenye **Price (TZS)**. Bidhaa itaonyesha alama halisi ya **-N%** na bei ya zamani imekatwa.\n\nTumia tu pale unapopunguza bei kweli: bei ya zamani lazima iwe juu kuliko ya sasa, la sivyo hakuna alama itakayoonekana.",
    },
    rel: ["labels", "edit_product"],
  },
  {
    id: "dashboard",
    q: { EN: "What is in the seller dashboard?", SW: "Dashibodi ya muuzaji ina nini?" },
    keys: ["dashboard", "seller dashboard", "my dashboard", "left menu", "sidebar", "dashboard tabs", "what can i do in the dashboard", "dashibodi", "dashibodi ya muuzaji", "menyu ya kushoto"],
    a: {
      EN: "The seller dashboard has these sections in the left menu:\n\n- **Overview**: a summary of your shop.\n- **My products**: add, edit and hide products.\n- **Analytics**: visits and WhatsApp taps.\n- **Messages & Audit log**: the log of buyers who tapped WhatsApp on your shop, and your account activity.\n- **Settings**: shop profile, shop link, vacation mode, extras, password and account.\n\n**Logout** is at the bottom.",
      SW: "Dashibodi ya muuzaji ina sehemu hizi kwenye menyu ya kushoto:\n\n- **Overview**: muhtasari wa duka lako.\n- **My products**: ongeza, hariri na ficha bidhaa.\n- **Analytics**: ziara na mara za kubonyeza WhatsApp.\n- **Messages & Audit log**: orodha ya wanunuzi waliobonyeza WhatsApp kwenye duka lako, na shughuli za akaunti yako.\n- **Settings**: wasifu wa duka, kiungo cha duka, hali ya likizo, mambo ya ziada, nenosiri na akaunti.\n\n**Logout** ipo chini.",
    },
    links: [L_DASH],
    rel: ["analytics", "shop_settings", "add_product"],
  },
  {
    id: "analytics",
    q: { EN: "How do I see how my shop is doing?", SW: "Naonaje duka langu linavyoendelea?" },
    keys: ["visitors", "visited my shop", "people visited", "how many visited", "who visited", "who messaged me", "who contacted me", "buyers who messaged", "walionitumia ujumbe", "wanunuzi walionitumia", "wageni", "analytics", "statistics", "stats", "all stats", "how is my shop doing", "visits", "views", "how many views", "whatsapp clicks", "clicks", "enquiries", "inquiries", "messages tab", "audit log", "activity log", "takwimu", "ziara", "mara ngapi", "walioangalia", "bonyeza whatsapp"],
    a: {
      EN: "Open **Analytics** (and **Overview**) in the dashboard. You can see real numbers for:\n\n- **Visits to your shop page**\n- **Opens of a product page**\n- **WhatsApp clicks**, and how many different **buyers tapped WhatsApp**\n\n**Messages & Audit log** lists every time a buyer tapped WhatsApp on your shop, and your account activity. Your own visits are not counted.",
      SW: "Fungua **Analytics** (na **Overview**) kwenye dashibodi. Utaona namba halisi za:\n\n- **Ziara za ukurasa wa duka lako**\n- **Mara bidhaa ilipofunguliwa**\n- **Mara za kubonyeza WhatsApp**, na ni **wanunuzi wangapi tofauti** waliobonyeza WhatsApp\n\n**Messages & Audit log** inaorodhesha kila mara mnunuzi alipobonyeza WhatsApp kwenye duka lako, na shughuli za akaunti yako. Ziara zako mwenyewe hazihesabiwi.",
    },
    links: [L_DASH],
    rel: ["dashboard", "shop_link"],
  },
  {
    id: "shop_settings",
    q: { EN: "Where are my shop settings?", SW: "Mipangilio ya duka langu ipo wapi?" },
    keys: ["settings", "shop settings", "where are the settings", "change my shop details", "change shop name", "change my shop name", "change whatsapp number", "change my whatsapp", "change my number", "change the whatsapp number", "mipangilio", "badilisha jina la duka", "badilisha namba ya whatsapp", "mipangilio ya duka"],
    a: {
      EN: "Open **Settings** in the dashboard's left menu. Each section saves on its own:\n\n- **Shop profile**: shop name, description, WhatsApp number, region, town or area, shop type, logo, banner.\n- **Shop link**: copy, share or change your web address.\n- **Vacation mode**: pause your shop.\n- **Storefront extras**: announcement bar, social links, opening hours, delivery and returns.\n- **Change password**.\n- **Your account**: change your email.\n- **Sign-ins and devices**.",
      SW: "Fungua **Settings** kwenye menyu ya kushoto ya dashibodi. Kila sehemu huhifadhi yenyewe:\n\n- **Shop profile**: jina la duka, maelezo, namba ya WhatsApp, mkoa, mji au eneo, aina ya duka, nembo, bango.\n- **Shop link**: nakili, shiriki au badilisha anwani ya duka lako.\n- **Vacation mode**: simamisha duka lako kwa muda.\n- **Storefront extras**: bango la tangazo, mitandao ya kijamii, saa za kufungua, usafirishaji na kurudisha.\n- **Change password**.\n- **Your account**: badilisha barua pepe.\n- **Sign-ins and devices**.",
    },
    links: [L_DASH],
    rel: ["shop_profile", "shop_link", "storefront"],
  },
  {
    id: "shop_profile",
    q: { EN: "How do I edit my shop profile?", SW: "Nahariri wasifu wa duka langu vipi?" },
    keys: ["whatsapp number of my shop", "edit whatsapp number", "edit the whatsapp number", "my whatsapp number", "namba ya whatsapp ya duka", "shop profile", "edit my shop", "edit shop", "edit my shop profile", "change shop region", "change my region", "change location", "change shop location", "shop description", "shop type", "shop logo", "change logo", "change banner", "wasifu wa duka", "hariri duka", "badilisha mkoa", "badilisha nembo", "badilisha bango", "aina ya duka"],
    a: {
      EN: "Dashboard, **Settings**, **Shop profile**:\n\n- **Shop name** and **Description**.\n- **WhatsApp number**: where buyers contact you. Use the format +255...\n- **Region**: pick your region so buyers can find you with the region filter. Add **Town or area** if you like.\n- **Shop type**: Online, Physical or Both.\n- **Logo** and **Banner**: tap **Choose** to upload.\n\nTap **Save shop profile** to save.",
      SW: "Dashibodi, **Settings**, **Shop profile**:\n\n- **Shop name** (jina la duka) na **Description** (maelezo).\n- **WhatsApp number**: ambapo wanunuzi wanakupata. Tumia muundo +255...\n- **Region** (mkoa): chagua mkoa wako ili wanunuzi wakupate kwa kichujio cha mkoa. Ongeza **Town or area** (mji au eneo) ukipenda.\n- **Shop type**: Online, Physical au Both.\n- **Logo** na **Banner**: bonyeza **Choose** kupakia.\n\nBonyeza **Save shop profile** kuhifadhi.",
    },
    links: [L_DASH],
    rel: ["shop_link", "photos", "storefront"],
  },
  {
    id: "shop_link",
    q: { EN: "How do I get or change my shop link?", SW: "Napataje au kubadilisha kiungo cha duka?" },
    keys: ["shop link", "my shop link", "shop url", "shop address", "web address", "change my link", "change shop link", "change the link", "custom link", "link of my shop", "kiungo cha duka", "anwani ya duka", "badilisha kiungo", "kiungo changu"],
    a: {
      EN: "Dashboard, **Settings**, **Shop link**. You can **Copy link**, **Share on WhatsApp**, **Open my shop**, or **Change link**.\n\nWhen you change it, ShopNest tells you if the new link is free. Your old link keeps working and sends visitors to the new one, and no other shop can take it. Still, avoid changing it often once you have shared it.",
      SW: "Dashibodi, **Settings**, **Shop link**. Unaweza **Copy link** (nakili), **Share on WhatsApp** (shiriki), **Open my shop** (fungua duka langu), au **Change link** (badilisha).\n\nUkibadilisha, ShopNest inakuambia kama kiungo kipya kipo huru. Kiungo chako cha zamani kinaendelea kufanya kazi na kinawapeleka wageni kwenye kipya, na hakuna duka lingine linaloweza kukichukua. Hata hivyo, epuka kukibadilisha mara kwa mara baada ya kukishiriki.",
    },
    links: [L_DASH],
    rel: ["share", "shop_profile"],
  },
  {
    id: "vacation",
    q: { EN: "How do I pause my shop (vacation mode)?", SW: "Nasimamishaje duka langu (likizo)?" },
    keys: ["vacation", "vacation mode", "pause my shop", "pause shop", "close my shop", "break", "holiday", "going away", "temporarily close", "likizo", "hali ya likizo", "simamisha duka", "funga duka kwa muda"],
    a: {
      EN: "Dashboard, **Settings**, **Vacation mode**. When it is on, your products are hidden from the marketplace and search, and your shop link stays open and tells buyers you are on a break. **Your products are not deleted.** Turn it off and everything comes back.",
      SW: "Dashibodi, **Settings**, **Vacation mode**. Ikiwa imewashwa, bidhaa zako zinafichwa kwenye soko na utafutaji, na kiungo cha duka kinabaki wazi kikiwaambia wanunuzi uko likizo. **Bidhaa zako hazifutwi.** Ukiizima kila kitu kinarudi.",
    },
    links: [L_DASH],
    rel: ["approval", "shop_settings"],
  },
  {
    id: "storefront",
    q: { EN: "How do I add opening hours, delivery info or social links?", SW: "Naweka saa za kufungua, usafirishaji au mitandao vipi?" },
    keys: ["opening hours", "open hours", "hours", "storefront extras", "announcement", "announcement bar", "social links", "instagram", "facebook", "tiktok", "delivery and returns", "delivery info", "returns policy", "saa za kufungua", "saa za kazi", "tangazo", "mitandao ya kijamii", "usafirishaji na kurudisha"],
    a: {
      EN: "Dashboard, **Settings**, **Storefront extras**. All of it is optional: leave a box empty to hide it on your shop.\n\n- **Announcement bar**: a short message at the top of your shop (up to 160 characters).\n- **Social links**: Instagram, Facebook, TikTok.\n- **Opening hours**: set times for each day, mark days **Closed**, use **Copy Monday to every day**, and tick **Show opening hours on my shop**.\n- **Delivery and returns**: what buyers should know (up to 600 characters).",
      SW: "Dashibodi, **Settings**, **Storefront extras**. Yote ni hiari: acha kisanduku wazi kuficha kwenye duka lako.\n\n- **Announcement bar**: ujumbe mfupi juu ya duka lako (hadi herufi 160).\n- **Social links**: Instagram, Facebook, TikTok.\n- **Opening hours**: weka saa za kila siku, weka siku **Closed**, tumia **Copy Monday to every day**, na tiki **Show opening hours on my shop**.\n- **Delivery and returns**: mambo wanunuzi wanayopaswa kujua (hadi herufi 600).",
    },
    links: [L_DASH],
    rel: ["shop_profile", "payments"],
  },
  {
    id: "change_password",
    q: { EN: "How do I change my password or email?", SW: "Nabadilishaje nenosiri au barua pepe?" },
    keys: ["change my password", "change password", "new password", "update password", "change my email", "change email", "update email", "badilisha nenosiri", "kubadilisha nenosiri", "nenosiri jipya", "badilisha barua pepe", "kubadilisha barua pepe"],
    a: {
      EN: "Sellers: Dashboard, **Settings**.\n\n- **Change password**: enter your current and new password, then save.\n- **Your account**, **Change email**: ShopNest asks for your password to be safe, and your other devices are signed out.\n\nBuyer accounts do not have a settings page yet. If you need a change, message Support on WhatsApp.",
      SW: "Wauzaji: Dashibodi, **Settings**.\n\n- **Change password**: weka nenosiri la sasa na jipya, kisha hifadhi.\n- **Your account**, **Change email**: ShopNest inaomba nenosiri lako kwa usalama, na vifaa vyako vingine vinatolewa kwenye akaunti.\n\nAkaunti za wanunuzi bado hazina ukurasa wa mipangilio. Ukihitaji mabadiliko, tuma ujumbe kwa Msaada kupitia WhatsApp.",
    },
    links: [L_DASH],
    rel: ["forgot", "signin", "support"],
  },
  {
    id: "setup",
    q: { EN: "Shop setup checklist", SW: "Orodha ya kuandaa duka" },
    keys: ["checklist", "shop setup checklist", "setup checklist", "set up my shop", "get started", "getting started", "steps to start selling", "what should i do first", "how do i start", "full guide", "orodha ya kuandaa duka", "hatua za kuanza", "kuanza kuuza", "nianzeje"],
    a: {
      EN: "A good way to set up your shop:\n\n1. **Sign up as a Seller** (Sign up, Seller).\n2. **Launch Your Store**: name, WhatsApp number, description, location, shop type, then **Submit for Review**.\n3. **Wait for approval** by the ShopNest team.\n4. **Settings, Shop profile**: add your logo and banner, and choose your region.\n5. **My products, + Add New Product**: add each item with a clear photo, honest price and correct stock.\n6. **Settings, Storefront extras**: opening hours, delivery and returns, social links.\n7. **Settings, Shop link**: copy your link and share it on WhatsApp.\n8. Watch **Analytics** to see visits and WhatsApp taps.",
      SW: "Njia nzuri ya kuandaa duka lako:\n\n1. **Jisajili kama Muuzaji** (Jisajili, Muuzaji).\n2. **Launch Your Store**: jina, namba ya WhatsApp, maelezo, mahali, aina ya duka, kisha **Submit for Review**.\n3. **Subiri idhini** ya timu ya ShopNest.\n4. **Settings, Shop profile**: weka nembo na bango, na chagua mkoa wako.\n5. **My products, + Add New Product**: ongeza kila bidhaa kwa picha wazi, bei ya kweli na idadi sahihi.\n6. **Settings, Storefront extras**: saa za kufungua, usafirishaji na kurudisha, mitandao ya kijamii.\n7. **Settings, Shop link**: nakili kiungo chako na ukishiriki kwa WhatsApp.\n8. Fuatilia **Analytics** kuona ziara na mara za kubonyeza WhatsApp.",
    },
    links: [L_DASH],
    rel: ["open_shop", "add_product", "shop_link"],
  },
  {
    id: "find_customers",
    q: { EN: "How do buyers find my shop?", SW: "Wanunuzi wananipataje?" },
    keys: ["customers find", "buyers find", "find my shop", "get customers", "get more customers", "get more buyers", "attract buyers", "more sales", "promote my shop", "promote my products", "advertise", "market my shop", "how do customers find", "wateja", "kupata wateja", "kutangaza", "wanunuzi wananipataje", "kupata wanunuzi"],
    a: {
      EN: "Buyers find your products and shop in these ways:\n\n- The **Marketplace** search and filters, including the **City or region** filter, so set your **Region** correctly.\n- The **Shops** page and your own **shop link**.\n- Your shop link shared by you: copy it or use **Share on WhatsApp** in Settings, **Shop link**.\n\nTo help buyers choose you: add a clear photo for every product, keep price and stock correct, and fill in your logo, banner, opening hours and delivery information.",
      SW: "Wanunuzi wanapata bidhaa na duka lako kwa njia hizi:\n\n- Utafutaji na vichujio vya **Soko**, ikiwemo kichujio cha **Mji au mkoa**, kwa hiyo weka **Region** yako sawasawa.\n- Ukurasa wa **Maduka** na **kiungo cha duka** lako.\n- Kiungo cha duka lako unachokishiriki mwenyewe: kinakili au tumia **Share on WhatsApp** kwenye Settings, **Shop link**.\n\nKuwasaidia wanunuzi wakuchague: weka picha wazi kwa kila bidhaa, hifadhi bei na idadi sahihi, na jaza nembo, bango, saa za kufungua na maelezo ya usafirishaji.",
    },
    links: [L_SHOPS],
    rel: ["shop_link", "shop_profile", "share"],
  },
  {
    id: "buyer_to_seller",
    q: { EN: "Can a buyer account become a seller?", SW: "Akaunti ya mnunuzi inaweza kuwa ya muuzaji?" },
    keys: ["buyer be a seller", "buyer become a seller", "buyer to seller", "switch to seller", "upgrade to seller", "change to seller", "i signed up as a buyer", "signed up as buyer", "wrong account type", "mnunuzi kuwa muuzaji", "badilisha kuwa muuzaji", "nilijisajili kama mnunuzi"],
    a: {
      EN: "Only a **Seller** account can open a shop, and an account cannot be switched from Buyer to Seller inside the app. You can sign up again as a **Seller** with a different email address, or message Support on WhatsApp and they will help you.",
      SW: "Ni akaunti ya **Muuzaji** pekee inayoweza kufungua duka, na akaunti haiwezi kubadilishwa kutoka Mnunuzi kuwa Muuzaji ndani ya tovuti. Unaweza kujisajili tena kama **Muuzaji** kwa barua pepe tofauti, au tuma ujumbe kwa Msaada kupitia WhatsApp watakusaidia.",
    },
    rel: ["open_shop", "signup", "support"],
  },
  {
    id: "fees",
    q: { EN: "Does it cost anything to sell?", SW: "Kuuza kuna gharama?" },
    keys: ["fees", "fee", "cost", "price to sell", "does it cost", "is it free", "free to join", "commission", "subscription", "how much to open a shop", "ada", "gharama", "bure", "kamisheni", "bei ya kufungua duka"],
    a: {
      EN: "The ShopNest home page says there are **zero setup fees** for sellers. For anything else about costs, please ask Support so you get an exact answer.",
      SW: "Ukurasa wa mwanzo wa ShopNest unasema hakuna **ada ya kuanzisha** kwa wauzaji. Kwa jambo lolote lingine kuhusu gharama, tafadhali uliza Msaada upate jibu sahihi.",
    },
    links: [L_SUPPORT],
    rel: ["open_shop", "support"],
  },
  {
    id: "reviews",
    q: { EN: "Are there reviews, ratings or verified shops?", SW: "Kuna maoni, nyota au maduka yaliyothibitishwa?" },
    keys: ["review", "reviews", "rating", "ratings", "stars", "verified", "verified shop", "verified badge", "trusted", "top rated", "favorites", "favourites", "wishlist", "heart", "maoni", "nyota", "imethibitishwa", "duka lililothibitishwa", "vipendwa"],
    a: {
      EN: "Not yet. Shop reviews, ratings, a verified badge and favorites are not available on ShopNest at the moment, so you will not see stars or badges. When they arrive they will show up on the shop pages.",
      SW: "Bado. Maoni ya maduka, nyota, alama ya uthibitisho na vipendwa havipatikani ShopNest kwa sasa, kwa hiyo hutaona nyota wala alama. Vikiwasili vitaonekana kwenye kurasa za maduka.",
    },
    rel: ["labels", "support"],
  },
  {
    id: "language",
    q: { EN: "How do I change the language or theme?", SW: "Nabadilishaje lugha au mwonekano?" },
    keys: ["language", "swahili", "english", "kiswahili", "change language", "dark mode", "light mode", "night mode", "theme", "day and night", "sw button", "lugha", "kiingereza", "badilisha lugha", "mwonekano", "hali ya usiku", "hali ya mchana"],
    a: {
      EN: "At the top right of every page: the **SW / EN** button switches between Swahili and English, and the **sun / moon** button switches between light and dark. ShopNest remembers your choice on this browser.",
      SW: "Juu kulia kwenye kila ukurasa: kitufe cha **SW / EN** hubadilisha kati ya Kiswahili na Kiingereza, na kitufe cha **jua / mwezi** hubadilisha kati ya mwanga na giza. ShopNest inakumbuka chaguo lako kwenye kivinjari hiki.",
    },
    rel: ["signin", "what"],
  },
  {
    id: "support",
    q: { EN: "How do I contact Support?", SW: "Ninawasiliana vipi na Msaada?" },
    keys: ["fake seller", "scam", "scammer", "fraud", "cheated", "tapeli", "mlaghai", "utapeli", "nimedanganywa", "your whatsapp number", "your whatsapp", "your number", "your phone", "your email", "nawasiliana", "kuwasiliana", "wasiliana", "nawasilianaje", "support", "contact support", "contact you", "contact us", "contact", "help me", "i need help", "customer care", "customer service", "speak to a person", "talk to a person", "human", "phone number", "email address", "complaint", "report a seller", "report a problem", "problem", "issue", "msaada", "wasiliana nanyi", "tuwasiliane", "namba ya simu", "malalamiko", "ripoti", "tatizo", "nahitaji msaada"],
    a: {
      EN: "You can reach the ShopNest team here:\n\n- **WhatsApp**: +255 748 743 673\n- **Email**: profitsylivester@gmail.com\n- SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania\n\nIf you report a problem with a seller or a product, include the shop name or the link.",
      SW: "Unaweza kuwasiliana na timu ya ShopNest hapa:\n\n- **WhatsApp**: +255 748 743 673\n- **Barua pepe**: profitsylivester@gmail.com\n- SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania\n\nUkiripoti tatizo la muuzaji au bidhaa, weka jina la duka au kiungo.",
    },
    links: [L_SUPPORT, L_FAQ],
    rel: ["what", "payments"],
  },
  {
    id: "pages",
    q: { EN: "Where are the FAQs, About and Terms?", SW: "Maswali, Kuhusu na Masharti yapo wapi?" },
    keys: ["faq", "faqs", "frequently asked", "terms", "terms of use", "terms and conditions", "conditions", "about us", "help center", "help pages", "legal", "maswali", "masharti", "kuhusu sisi", "kurasa za msaada"],
    a: {
      EN: "Open the **Help** menu at the top, or the **Help** and **Legal** links at the bottom of any page: **FAQs**, **About us**, **Support**, **Terms of use** and **Privacy policy**.",
      SW: "Fungua menyu ya **Msaada** juu, au viungo vya **Msaada** na **Kisheria** chini ya ukurasa wowote: **Maswali ya mara kwa mara**, **Kuhusu sisi**, **Msaada**, **Masharti ya matumizi** na **Sera ya faragha**.",
    },
    links: [L_FAQ, L_ABOUT, L_SUPPORT, L_TERMS],
    rel: ["support", "what"],
  },
  {
    id: "phone",
    q: { EN: "Is there a ShopNest app?", SW: "Kuna programu ya ShopNest?" },
    keys: ["is there an app", "is there a app", "have an app", "an app", "shopnest app", "mobile app", "play store", "app store", "android app", "iphone app", "programu ya shopnest", "pakua programu", "programu"],
    a: {
      EN: "ShopNest is a website. Open it in your phone's browser and it fits your screen, with the same features as on a computer. I do not know of a separate app, so please do not download one claiming to be ShopNest.",
      SW: "ShopNest ni tovuti. Ifungue kwenye kivinjari cha simu yako na inatoshea skrini yako, ikiwa na huduma zile zile kama kwenye kompyuta. Sijui kuhusu programu tofauti, kwa hiyo tafadhali usipakue programu inayodai kuwa ShopNest.",
    },
    rel: ["language", "support"],
  },
];

// Short replies for greetings, thanks and goodbyes.
const SMALL: { keys: string[]; a: L }[] = [
  { keys: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "habari", "mambo", "hujambo", "salama", "shikamoo", "niaje"], a: { EN: "Hello! I am the ShopNest assistant. Ask me about buying, selling, shops, products or your account, or pick a question below.", SW: "Habari! Mimi ni msaidizi wa ShopNest. Niulize kuhusu kununua, kuuza, maduka, bidhaa au akaunti yako, au chagua swali hapo chini." } },
  { keys: ["thanks", "thank you", "thx", "asante", "asante sana", "shukrani"], a: { EN: "You are welcome! Ask me anything else about ShopNest.", SW: "Karibu! Niulize jambo lingine lolote kuhusu ShopNest." } },
  { keys: ["bye", "goodbye", "see you", "kwaheri", "baadaye"], a: { EN: "Goodbye! Come back any time.", SW: "Kwaheri! Karibu tena wakati wowote." } },
];

const BLOCK_ADMIN = ["admin", "administrator", "super admin", "superadmin", "admin panel", "admin area", "control center", "msimamizi"];
const BLOCK_PRIVACY = ["privacy", "private data", "personal data", "personal information", "my data", "user data", "customer data", "data protection", "is my data safe", "how do you store", "who can see my", "other users", "someone's email", "someone's number", "someones email", "someones number", "other people's", "hack", "hacked", "database", "faragha", "taarifa binafsi", "data zangu", "usalama wa data", "watumiaji wengine", "namba ya mtu", "barua pepe ya mtu"];

export const SAFE_REPLY: { admin: L; privacy: L } = {
  admin: {
    EN: "I can only help with buying and selling on ShopNest, so I cannot talk about the site's management area. If you need something from the ShopNest team, please contact Support.",
    SW: "Naweza kusaidia tu kuhusu kununua na kuuza kwenye ShopNest, kwa hiyo siwezi kuzungumzia eneo la usimamizi wa tovuti. Ukihitaji kitu kutoka kwa timu ya ShopNest, tafadhali wasiliana na Msaada.",
  },
  privacy: {
    EN: "I cannot discuss privacy or anyone's personal data. You can read how ShopNest handles this in the Privacy policy, and Support can answer questions about it.",
    SW: "Siwezi kuzungumzia faragha wala taarifa binafsi za mtu yeyote. Unaweza kusoma jinsi ShopNest inavyoshughulikia hili kwenye Sera ya faragha, na Msaada wanaweza kujibu maswali kuhusu hilo.",
  },
};

export const NO_ANSWER: L = {
  EN: "I do not have an answer to that in my ShopNest guide, and I would rather not guess. I can help with buying, selling, shops, products, your account and how to set things up. For anything else, please ask Support.",
  SW: "Sina jibu la hilo kwenye mwongozo wangu wa ShopNest, na sipendi kukisia. Naweza kusaidia kuhusu kununua, kuuza, maduka, bidhaa, akaunti yako na jinsi ya kuandaa mambo. Kwa jambo lingine, tafadhali uliza Msaada.",
};

export const UI = {
  title: { EN: "ShopNest Assistance", SW: "Msaada wa ShopNest" } as L,
  sub: { EN: "Ask me about ShopNest", SW: "Niulize kuhusu ShopNest" } as L,
  hello: { EN: "Hello! I am the ShopNest assistant. I know how ShopNest works for buyers and sellers, including how to open a shop and add products. What would you like to know?", SW: "Habari! Mimi ni msaidizi wa ShopNest. Najua jinsi ShopNest inavyofanya kazi kwa wanunuzi na wauzaji, ikiwemo kufungua duka na kuongeza bidhaa. Ungependa kujua nini?" } as L,
  placeholder: { EN: "Type your question...", SW: "Andika swali lako..." } as L,
  send: { EN: "Send", SW: "Tuma" } as L,
  close: { EN: "Close chat", SW: "Funga mazungumzo" } as L,
  open: { EN: "Open chat", SW: "Fungua mazungumzo" } as L,
  related: { EN: "You may also want to know", SW: "Unaweza pia kutaka kujua" } as L,
  whatsapp: { EN: "Message Support on WhatsApp", SW: "Tuma ujumbe kwa Msaada WhatsApp" } as L,
  clear: { EN: "Start over", SW: "Anza upya" } as L,
  note: { EN: "Answers come from the ShopNest guide. Not a live person.", SW: "Majibu yanatoka kwenye mwongozo wa ShopNest. Si mtu halisi." } as L,
};

export const START_IDS = ["how_buy", "open_shop", "add_product", "search_filters", "signup", "support"];

export type Reply = { kind: "answer" | "small" | "blocked" | "none"; text: string; links: Link[]; related: string[]; id?: string; lang: Lang };

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['`\u2019]/g, "")
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}
function stem(t: string): string {
  return t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t;
}
function toks(s: string): string[] {
  const n = norm(s);
  return n ? n.split(" ").map(stem) : [];
}
// One letter wrong, missing or extra is tolerated for longer words ("prodcut", "shoping").
function close(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 6 || b.length < 6 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  const [longer, shorter] = a.length > b.length ? [a, b] : [b, a];
  return longer.slice(i + 1) === shorter.slice(i);
}
function hasPhrase(q: string[], phrase: string[], fuzzy = false): boolean {
  if (phrase.length === 0 || phrase.length > q.length) return false;
  for (let i = 0; i + phrase.length <= q.length; i++) {
    let ok = true;
    for (let j = 0; j < phrase.length; j++) {
      const same = fuzzy ? close(q[i + j], phrase[j]) : q[i + j] === phrase[j];
      if (!same) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

const SW_WORDS = ["nina", "nataka", "naomba", "jinsi", "vipi", "ninawezaje", "naweza", "habari", "asante", "bei", "bidhaa", "duka", "muuzaji", "msaada", "kwa", "ya", "je", "nini", "wapi", "gani", "sijui", "kununua", "kuuza", "kufungua", "kuongeza", "akaunti", "nenosiri", "mimi", "yangu", "wangu", "langu", "kwanini", "mnunuzi", "maduka", "naongezaje", "ninafunguaje", "natafutaje", "nalipaje", "unaweza", "tafadhali", "hapa"];
const EN_WORDS = ["how", "what", "can", "the", "to", "my", "is", "do", "does", "i", "a", "where", "why", "want", "need", "please", "of", "for", "and", "an", "it", "are", "you", "me", "shop", "product", "account"];

export function detectLang(text: string, ui: Lang): Lang {
  const t = toks(text);
  let sw = 0;
  let en = 0;
  for (const w of t) {
    if (SW_WORDS.includes(w)) sw++;
    if (EN_WORDS.includes(w)) en++;
  }
  if (sw > en) return "SW";
  if (en > sw) return "EN";
  return ui;
}

function scoreKey(q: string[], key: string): number {
  const k = key.split(" ").map(stem);
  if (!hasPhrase(q, k, true)) return 0;
  if (k.length > 1) return k.length * 3;
  return key.length >= 5 ? 3 : 2;
}

export function entryById(id: string): Entry | undefined {
  return ENTRIES.find((e) => e.id === id);
}

export function reply(text: string, ui: Lang): Reply {
  const lang = detectLang(text, ui);
  const q = toks(text);
  const none = (kind: Reply["kind"], msg: L, related: string[] = []): Reply => ({ kind, text: msg[lang], links: kind === "blocked" ? [] : [], related, lang });
  if (q.length === 0) return none("none", NO_ANSWER, START_IDS.slice(0, 3));

  if (BLOCK_ADMIN.some((k) => hasPhrase(q, k.split(" ").map(stem)))) return { kind: "blocked", text: SAFE_REPLY.admin[lang], links: [L_SUPPORT], related: ["how_buy", "open_shop"], lang };
  if (BLOCK_PRIVACY.some((k) => hasPhrase(q, k.split(" ").map(stem)))) return { kind: "blocked", text: SAFE_REPLY.privacy[lang], links: [L_PRIVACY, L_SUPPORT], related: ["how_buy", "open_shop"], lang };

  if (q.length <= 4) {
    for (const s of SMALL) if (s.keys.some((k) => { const kt = k.split(" ").map(stem); return q.length <= kt.length + 1 && hasPhrase(q, kt); })) return { kind: "small", text: s.a[lang], links: [], related: START_IDS.slice(0, 3), lang };
  }

  let best: Entry | null = null;
  let bestScore = 0;
  for (const e of ENTRIES) {
    let sc = 0;
    for (const k of e.keys) sc += scoreKey(q, k);
    if (sc > bestScore) { best = e; bestScore = sc; }
  }
  if (best && bestScore >= 3) return { kind: "answer", text: best.a[lang], links: best.links || [], related: best.rel || [], id: best.id, lang };
  return { kind: "none", text: NO_ANSWER[lang], links: [L_SUPPORT], related: START_IDS.slice(0, 3), lang };
}
