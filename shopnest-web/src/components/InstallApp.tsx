"use client";
import { useState } from "react";
import { useInstall } from "../lib/pwa";
import type { Lang } from "../lib/i18n";

const TXT = {
  EN: { btn: "Install app", hint: "On iPhone: tap the Share button, then Add to Home Screen." },
  SW: { btn: "Weka programu", hint: "Kwenye iPhone: bonyeza kitufe cha Shiriki, kisha Ongeza kwenye Skrini ya Mwanzo." },
};

// "Install app" button. Shows only when the phone offers it (or on iPhone, with the Share hint) and never once installed.
export default function InstallApp({ lang, variant }: { lang: Lang; variant: "footer" | "row" | "side" }) {
  const { canInstall, isIos, installed, install } = useInstall();
  const [hint, setHint] = useState(false);
  if (installed || (!canInstall && !isIos)) return null;
  const t = TXT[lang] || TXT.EN;
  const click = () => { if (canInstall) install(); else setHint(!hint); };
  return (
    <div className={"sn-install sn-install-" + variant}>
      <button type="button" className="sn-install-btn" onClick={click}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M5 21h14" /></svg>
        {t.btn}
      </button>
      {hint && !canInstall && <p className="sn-install-hint" role="status">{t.hint}</p>}
    </div>
  );
}
