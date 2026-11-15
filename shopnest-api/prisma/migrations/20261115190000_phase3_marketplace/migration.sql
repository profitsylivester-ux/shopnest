-- AlterTable
ALTER TABLE "Product" ADD COLUMN "wasPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- Draft information pages (not published until the admin publishes them in Admin > Pages)
INSERT INTO "SitePage" ("id","slug","titleEn","titleSw","bodyEn","bodySw","isPublished","updatedAt") VALUES (gen_random_uuid()::text, 'faq', $sn$Frequently asked questions$sn$, $sn$Maswali ya mara kwa mara$sn$, $sn$## For buyers

### How do I buy something?
Open a product and tap "Chat on WhatsApp". A message about the product is ready for you to send to the seller. You agree the details with the seller directly.

### Can I pay on ShopNest?
No. ShopNest does not take payments. You and the seller agree how to pay. Take your time, ask questions, and only pay when you are comfortable.

### Who delivers my order?
The seller, if you both agree to delivery. ShopNest does not deliver goods.

### How do I stay safe?
- Check the pictures, price and details, and ask the seller for more if you need to.
- Prefer to meet in a public place or pay on delivery where possible.
- Do not share your passwords or codes with anyone, including sellers.
- If something seems wrong, report it to us (see Support).

### Do I need an account?
No. You can browse and contact sellers without one. An account is only needed to sell.

## For sellers

### How do I open a shop?
Choose "Open a shop" in the menu and sign up as a seller. Then fill in your shop details and add products. A new shop may need approval from the ShopNest team before buyers can see it.

### How do buyers contact me?
Buyers tap WhatsApp on your product or shop. They reach the WhatsApp number you saved in your shop settings, so keep it correct.

### What is the old price?
When you lower a price you can enter the old price too. Buyers then see a discount tag. Only enter an old price that is real, and leave it empty if there is no discount.

### Can I change my shop link?
Yes, in your shop settings. Your old link keeps working and sends visitors to the new one.

## Other questions

### Is the website available in Swahili?
Yes. Use the EN / SW button in the top bar.

### Who can I ask for help?
See the Support page.$sn$, $sn$## Kwa wanunuzi

### Ninawezaje kununua kitu?
Fungua bidhaa kisha bonyeza "Wasiliana kwa WhatsApp". Ujumbe kuhusu bidhaa utakuwa tayari kutumwa kwa muuzaji. Mnakubaliana maelezo moja kwa moja na muuzaji.

### Je, naweza kulipa kupitia ShopNest?
Hapana. ShopNest haipokei malipo. Wewe na muuzaji mnakubaliana jinsi ya kulipa. Chukua muda wako, uliza maswali, na ulipe tu unapokuwa umeridhika.

### Nani anaifikisha oda yangu?
Muuzaji, kama mnakubaliana kuhusu usafirishaji. ShopNest haipeleki bidhaa.

### Nawezaje kuwa salama?
- Angalia picha, bei na maelezo, na muulize muuzaji zaidi ukihitaji.
- Pendelea kukutana mahali pa wazi au kulipa bidhaa ikifika inapowezekana.
- Usimpe mtu yeyote nenosiri au misimbo yako, pamoja na wauzaji.
- Kama kuna jambo linaonekana si sawa, tuambie (tazama Msaada).

### Je, ninahitaji akaunti?
Hapana. Unaweza kutazama na kuwasiliana na wauzaji bila akaunti. Akaunti inahitajika kwa kuuza tu.

## Kwa wauzaji

### Ninafunguaje duka?
Chagua "Fungua duka" kwenye menyu kisha jisajili kama muuzaji. Baada ya hapo jaza maelezo ya duka lako na uweke bidhaa. Duka jipya linaweza kuhitaji idhini ya timu ya ShopNest kabla wanunuzi hawajaliona.

### Wanunuzi wananipataje?
Wanunuzi hubonyeza WhatsApp kwenye bidhaa au duka lako. Wanafika kwenye namba ya WhatsApp uliyoweka kwenye mipangilio ya duka, kwa hiyo hakikisha ni sahihi.

### Bei ya zamani ni nini?
Unaposhusha bei unaweza kuweka pia bei ya zamani. Wanunuzi wataona alama ya punguzo. Weka bei ya zamani ya kweli tu, na uiache wazi kama hakuna punguzo.

### Naweza kubadilisha kiungo cha duka langu?
Ndiyo, kwenye mipangilio ya duka. Kiungo chako cha zamani kinaendelea kufanya kazi na kuwapeleka wageni kwenye kipya.

## Maswali mengine

### Je, tovuti ipo kwa Kiswahili?
Ndiyo. Tumia kitufe cha EN / SW kwenye upau wa juu.

### Naweza kumuuliza nani msaada?
Tazama ukurasa wa Msaada.$sn$, false, NOW()) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "SitePage" ("id","slug","titleEn","titleSw","bodyEn","bodySw","isPublished","updatedAt") VALUES (gen_random_uuid()::text, 'about', $sn$About ShopNest$sn$, $sn$Kuhusu ShopNest$sn$, $sn$ShopNest is an online marketplace where people in Tanzania open shops and sell their products. It is run by SentinEx Co Ltd.

## What ShopNest does
Sellers open a shop, add their products with pictures and prices, and share their shop link. Buyers browse the marketplace or a single shop, then tap WhatsApp to talk to the seller directly.

## What ShopNest does not do
ShopNest has no checkout and does not take payments. We do not hold your money and we do not deliver goods. Price, payment and delivery are agreed between the buyer and the seller on WhatsApp.

## Why we built it
Many good local businesses already sell through WhatsApp and social media. ShopNest gives them one tidy place where buyers can find them, see real prices and pictures, and contact them in one tap.

## Who runs it
ShopNest is operated by SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania.

## Contact us
- WhatsApp: +255 748 743 673
- Email: profitsylivester@gmail.com$sn$, $sn$ShopNest ni soko la mtandaoni ambapo watu wa Tanzania hufungua maduka na kuuza bidhaa zao. Linaendeshwa na SentinEx Co Ltd.

## ShopNest hufanya nini
Wauzaji hufungua duka, huweka bidhaa zao pamoja na picha na bei, kisha hushiriki kiungo cha duka lao. Wanunuzi hutazama soko au duka moja, kisha hubonyeza WhatsApp kuzungumza na muuzaji moja kwa moja.

## ShopNest haifanyi nini
ShopNest haina malipo ya moja kwa moja na haipokei pesa. Hatushikilii pesa zako na hatupeleki bidhaa. Bei, malipo na usafirishaji hukubaliwa kati ya mnunuzi na muuzaji kupitia WhatsApp.

## Kwa nini tuliijenga
Biashara nyingi nzuri za hapa nchini tayari zinauza kupitia WhatsApp na mitandao ya kijamii. ShopNest inawapa mahali pamoja pazuri ambapo wanunuzi wanaweza kuwapata, kuona bei na picha halisi, na kuwasiliana nao kwa kubonyeza mara moja.

## Nani anaiendesha
ShopNest inaendeshwa na SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania.

## Wasiliana nasi
- WhatsApp: +255 748 743 673
- Barua pepe: profitsylivester@gmail.com$sn$, false, NOW()) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "SitePage" ("id","slug","titleEn","titleSw","bodyEn","bodySw","isPublished","updatedAt") VALUES (gen_random_uuid()::text, 'privacy', $sn$Privacy policy$sn$, $sn$Sera ya faragha$sn$, $sn$This policy explains what information ShopNest keeps, why, and what choices you have. ShopNest is operated by SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania ("we", "us").

## Information we keep
- Account details: your name, email address and a scrambled (hashed) version of your password. If you sign in with Google, we receive your name, email address and Google account ID from Google. We never see your Google password.
- Shop details for sellers: shop name, description, WhatsApp number, location, opening hours, links and pictures you choose to add.
- Product details for sellers: names, prices, descriptions, pictures and stock.
- Pictures you upload, which are stored so they can be shown on the website.
- Basic activity: when a shop or product page is viewed and when a WhatsApp button is tapped. These are counted with a random visitor ID kept in your browser, not your name. Sellers and admins viewing their own shops are not counted.
- Security records: for sign-ins and account changes we record the time and your IP address.

## How we use it
- To run your account and show seller shops and products to buyers.
- To show sellers simple numbers about views and WhatsApp taps.
- To keep the service safe, find abuse and fix problems.

## What buyers and sellers see
A shop's public page shows what the seller chose to publish, including the shop WhatsApp number. Buyers can browse and contact sellers without an account. When you message a seller on WhatsApp, that chat is between you and the seller and is handled by WhatsApp under its own terms.

## Cookies and browser storage
We use your browser's local storage, not tracking cookies, to keep you signed in, remember your language, and keep the random visitor ID described above. Signing out removes your sign-in from the browser. Google's sign-in button loads a script from Google when you open the sign-in window.

## Sharing
We do not sell your information. We share it only with service providers that help us run ShopNest, when the law requires it, or to protect the service and its users.

## Keeping data safe
Passwords are stored hashed. We take reasonable steps to protect the information we keep, but no website can promise perfect security.

## How long we keep it
We keep account and shop information while the account is active. Security records are kept for a limited time. You can ask us to delete your account and the data tied to it.

## Your choices
You can change your shop and account details in your dashboard. You can ask us to see, correct or delete your information by contacting us:
- WhatsApp: +255 748 743 673
- Email: profitsylivester@gmail.com

## Children
ShopNest is not meant for children under 18 to sell on.

## Changes
We may update this policy. The date at the top of the page shows when it was last changed.$sn$, $sn$Sera hii inaeleza ni taarifa gani ShopNest inazohifadhi, kwa nini, na uchaguzi ulionao. ShopNest inaendeshwa na SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania ("sisi").

## Taarifa tunazohifadhi
- Taarifa za akaunti: jina lako, barua pepe na toleo lililofichwa (hashed) la nenosiri lako. Ukiingia kwa Google, tunapokea jina lako, barua pepe na kitambulisho cha akaunti ya Google kutoka Google. Hatuoni nenosiri lako la Google.
- Taarifa za duka kwa wauzaji: jina la duka, maelezo, namba ya WhatsApp, mahali, saa za kufungua, viungo na picha unazochagua kuweka.
- Taarifa za bidhaa kwa wauzaji: majina, bei, maelezo, picha na idadi iliyopo.
- Picha unazopakia, zinahifadhiwa ili ziweze kuonyeshwa kwenye tovuti.
- Shughuli za msingi: ukurasa wa duka au bidhaa unapotazamwa na kitufe cha WhatsApp kinapobonyezwa. Hizi huhesabiwa kwa kitambulisho cha mgeni cha nasibu kinachohifadhiwa kwenye kivinjari chako, si jina lako. Wauzaji na wasimamizi wanapotazama maduka yao wenyewe hawahesabiwi.
- Rekodi za usalama: kwa kuingia na mabadiliko ya akaunti tunarekodi muda na anwani yako ya IP.

## Tunavyozitumia
- Kuendesha akaunti yako na kuonyesha maduka na bidhaa za wauzaji kwa wanunuzi.
- Kuwaonyesha wauzaji namba rahisi kuhusu mitazamo na mibonyezo ya WhatsApp.
- Kuweka huduma salama, kugundua matumizi mabaya na kurekebisha matatizo.

## Wanunuzi na wauzaji wanaona nini
Ukurasa wa umma wa duka unaonyesha kile muuzaji alichochagua kuchapisha, pamoja na namba ya WhatsApp ya duka. Wanunuzi wanaweza kutazama na kuwasiliana na wauzaji bila akaunti. Unapomtumia muuzaji ujumbe kwa WhatsApp, mazungumzo hayo ni kati yako na muuzaji na yanashughulikiwa na WhatsApp kwa masharti yake.

## Vidakuzi na hifadhi ya kivinjari
Tunatumia hifadhi ya ndani ya kivinjari chako, si vidakuzi vya kufuatilia, ili kukuweka umeingia, kukumbuka lugha yako na kuhifadhi kitambulisho cha mgeni cha nasibu kilichoelezwa hapo juu. Kutoka kunaondoa kuingia kwako kwenye kivinjari. Kitufe cha kuingia cha Google hupakia hati kutoka Google unapofungua dirisha la kuingia.

## Kushiriki
Hatuuzi taarifa zako. Tunazishiriki tu na watoa huduma wanaotusaidia kuendesha ShopNest, sheria inapohitaji, au kulinda huduma na watumiaji wake.

## Kuweka data salama
Manenosiri huhifadhiwa yakiwa yamefichwa. Tunachukua hatua zinazofaa kulinda taarifa tunazohifadhi, lakini hakuna tovuti inayoweza kuahidi usalama kamili.

## Tunazihifadhi kwa muda gani
Tunahifadhi taarifa za akaunti na duka wakati akaunti inatumika. Rekodi za usalama zinahifadhiwa kwa muda mfupi. Unaweza kutuomba kufuta akaunti yako na data inayohusiana nayo.

## Uchaguzi wako
Unaweza kubadilisha taarifa za duka na akaunti yako kwenye dashibodi yako. Unaweza kutuomba kuona, kusahihisha au kufuta taarifa zako kwa kuwasiliana nasi:
- WhatsApp: +255 748 743 673
- Barua pepe: profitsylivester@gmail.com

## Watoto
ShopNest haikusudiwi watoto walio chini ya miaka 18 kuuza.

## Mabadiliko
Tunaweza kusasisha sera hii. Tarehe iliyo juu ya ukurasa inaonyesha ilipobadilishwa mara ya mwisho.$sn$, false, NOW()) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "SitePage" ("id","slug","titleEn","titleSw","bodyEn","bodySw","isPublished","updatedAt") VALUES (gen_random_uuid()::text, 'terms', $sn$Terms of use$sn$, $sn$Masharti ya matumizi$sn$, $sn$These terms apply when you use ShopNest. ShopNest is operated by SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania ("we", "us"). By using the website you agree to them.

## What ShopNest is
ShopNest is a marketplace where sellers list products and buyers contact them on WhatsApp. We provide the listing platform only. We are not the seller of the items, we do not take payments, and we do not deliver goods.

## Sales are between buyer and seller
Any sale is an agreement between the buyer and the seller. They decide the price, payment and delivery between themselves. We are not a party to that agreement and we do not guarantee any item, price, seller or buyer. Please take care and use your own judgement.

## Your account
- Give correct information and keep your password private.
- You are responsible for what happens under your account.
- Tell us if you think someone else has used your account.

## Rules for sellers
- Only list items you may legally sell and really have or can supply.
- Pictures, prices, descriptions and stock must be honest. Only enter an old price if it was your real earlier price.
- Keep your WhatsApp number correct and answer buyers fairly.
- Do not list illegal, stolen, counterfeit, dangerous or prohibited goods or services.
- You are responsible for your own taxes, licences and delivery.

## Rules for everyone
- Do not break the law, harass others, send spam or try to cheat people.
- Do not try to break into, overload or damage the website, or use it to collect other people's information.
- Do not upload content you do not have the right to use.

## Content you add
You keep the rights to your pictures and text. You allow us to show them on ShopNest so the service can work. You promise they are yours to share and do not break anyone's rights or the law.

## Removing content and accounts
We may hide a product, pause a shop or suspend an account that breaks these terms, is reported as dishonest, or puts people at risk. You can ask us to close your account at any time.

## No guarantees
We try to keep ShopNest available and accurate, but it is provided as it is. It may sometimes be unavailable or contain mistakes. To the extent the law allows, we are not responsible for losses from deals between buyers and sellers, or from content added by users.

## Changes
We may change these terms or the website. When we change the terms, the date at the top of this page is updated. Using ShopNest after that means you accept the new terms.

## Governing law
These terms are governed by the laws of Tanzania.

## Contact
- WhatsApp: +255 748 743 673
- Email: profitsylivester@gmail.com$sn$, $sn$Masharti haya yanatumika unapotumia ShopNest. ShopNest inaendeshwa na SentinEx Co Ltd, Kigamboni, Kisiwani, Dar es Salaam, Tanzania ("sisi"). Kwa kutumia tovuti unakubali masharti haya.

## ShopNest ni nini
ShopNest ni soko ambapo wauzaji huweka bidhaa na wanunuzi huwasiliana nao kwa WhatsApp. Tunatoa jukwaa la matangazo tu. Sisi si wauzaji wa bidhaa, hatupokei malipo, na hatupeleki bidhaa.

## Mauzo ni kati ya mnunuzi na muuzaji
Mauzo yoyote ni makubaliano kati ya mnunuzi na muuzaji. Wao huamua bei, malipo na usafirishaji wenyewe. Sisi si upande wa makubaliano hayo na hatudhamini bidhaa, bei, muuzaji wala mnunuzi yeyote. Tafadhali kuwa makini na utumie busara yako.

## Akaunti yako
- Toa taarifa sahihi na uweke nenosiri lako siri.
- Wewe unawajibika kwa kinachotokea kupitia akaunti yako.
- Tuambie ukidhani mtu mwingine ametumia akaunti yako.

## Sheria kwa wauzaji
- Weka tu bidhaa unazoruhusiwa kisheria kuuza na ambazo kweli unazo au unaweza kuzipata.
- Picha, bei, maelezo na idadi lazima viwe vya kweli. Weka bei ya zamani tu kama ilikuwa bei yako halisi ya awali.
- Weka namba yako ya WhatsApp sahihi na uwajibu wanunuzi kwa haki.
- Usiweke bidhaa au huduma haramu, zilizoibwa, bandia, hatari au zilizokatazwa.
- Unawajibika kwa kodi, leseni na usafirishaji wako mwenyewe.

## Sheria kwa kila mtu
- Usivunje sheria, usiwanyanyase wengine, usitume barua taka wala kujaribu kuwadanganya watu.
- Usijaribu kuvunja, kuzidisha mzigo au kuharibu tovuti, wala kuitumia kukusanya taarifa za watu wengine.
- Usipakie maudhui ambayo huna haki ya kuyatumia.

## Maudhui unayoweka
Unabaki na haki za picha na maandishi yako. Unaturuhusu kuyaonyesha kwenye ShopNest ili huduma ifanye kazi. Unaahidi ni yako kushiriki na hayavunji haki za mtu yeyote wala sheria.

## Kuondoa maudhui na akaunti
Tunaweza kuficha bidhaa, kusimamisha duka au kusimamisha akaunti inayovunja masharti haya, inaripotiwa kuwa si ya uaminifu, au inayoweka watu hatarini. Unaweza kutuomba kufunga akaunti yako wakati wowote.

## Hakuna dhamana
Tunajitahidi kuweka ShopNest ipatikane na iwe sahihi, lakini inatolewa kama ilivyo. Mara nyingine inaweza isipatikane au kuwa na makosa. Kwa kadri sheria inavyoruhusu, hatuwajibiki kwa hasara zitokanazo na makubaliano kati ya wanunuzi na wauzaji, au maudhui yaliyowekwa na watumiaji.

## Mabadiliko
Tunaweza kubadilisha masharti haya au tovuti. Tunapobadilisha masharti, tarehe iliyo juu ya ukurasa hii husasishwa. Kuendelea kutumia ShopNest baada ya hapo kunamaanisha unakubali masharti mapya.

## Sheria inayotumika
Masharti haya yanatawaliwa na sheria za Tanzania.

## Mawasiliano
- WhatsApp: +255 748 743 673
- Barua pepe: profitsylivester@gmail.com$sn$, false, NOW()) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "SitePage" ("id","slug","titleEn","titleSw","bodyEn","bodySw","isPublished","updatedAt") VALUES (gen_random_uuid()::text, 'support', $sn$Support$sn$, $sn$Msaada$sn$, $sn$We are happy to help with questions about using ShopNest, problems with your account, or a shop or listing you want to report.

## Contact us
- WhatsApp: +255 748 743 673
- Email: profitsylivester@gmail.com

## Before you write
- Quick answers are on the FAQs page.
- If your question is about a product, its price, or delivery, ask the seller on WhatsApp. They know the item and they agree the sale with you.

## What to include
- Your email address on ShopNest, if you have an account.
- The link to the shop or product you are writing about.
- A short description of what happened, and a screenshot if you can.

## Report a problem
If you think a listing is false or a seller is not being honest, send us the link and what happened. We will look into it. Never send passwords, one-time codes or card details to anyone.$sn$, $sn$Tunafurahi kusaidia kuhusu maswali ya matumizi ya ShopNest, matatizo ya akaunti yako, au duka au tangazo unalotaka kuripoti.

## Wasiliana nasi
- WhatsApp: +255 748 743 673
- Barua pepe: profitsylivester@gmail.com

## Kabla ya kuandika
- Majibu ya haraka yapo kwenye ukurasa wa Maswali ya mara kwa mara.
- Kama swali lako ni kuhusu bidhaa, bei yake au usafirishaji, muulize muuzaji kwa WhatsApp. Anaijua bidhaa na mnakubaliana mauzo naye.

## Cha kuweka kwenye ujumbe
- Barua pepe yako ya ShopNest, kama una akaunti.
- Kiungo cha duka au bidhaa unayoandikia.
- Maelezo mafupi ya kilichotokea, na picha ya skrini kama unaweza.

## Ripoti tatizo
Ukidhani tangazo ni la uongo au muuzaji si mwaminifu, tutumie kiungo na kilichotokea. Tutalifuatilia. Usitume nenosiri, misimbo ya mara moja au taarifa za kadi kwa mtu yeyote.$sn$, false, NOW()) ON CONFLICT ("slug") DO NOTHING;
