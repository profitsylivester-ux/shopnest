"use client";
import { T, fill, type Lang } from "../lib/i18n";

export type TrustInfo = { ratingAvg?: number | null; ratingCount?: number; topRated?: boolean; verified?: boolean; vProducts?: number; vVisitors?: number };

// The one honest sentence shown on hover (and on the shop page) saying WHY a shop is Verified.
export function verifiedReason(t: TrustInfo, lang: Lang): string {
  return fill(T[lang].verifiedWhy, { p: t.vProducts || 0, v: t.vVisitors || 0 });
}

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5l2.6 2 3.3-.2 1 3.1 2.7 1.9-1 3.1 1 3.1-2.7 1.9-1 3.1-3.3-.2-2.6 2-2.6-2-3.3.2-1-3.1L2.4 15l1-3.1-1-3.1 2.7-1.9 1-3.1 3.3.2 2.6-2z" /><path d="M8.4 12.2l2.5 2.5 4.8-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

// Small tick next to a shop name. It only renders for shops that really earned the badge.
export function VerifiedTick({ t, lang }: { t: TrustInfo; lang: Lang }) {
  if (!t.verified) return null;
  const why = verifiedReason(t, lang);
  return <span className="sn-vtick" title={why} aria-label={T[lang].verifiedAria + ". " + why} role="img"><CheckIcon /></span>;
}

// Bigger badge with the word, used on the shop page and shop cards. The reason is written out so it also works on phones (no hover).
export function VerifiedBadge({ t, lang, showReason }: { t: TrustInfo; lang: Lang; showReason?: boolean }) {
  if (!t.verified) return null;
  const why = verifiedReason(t, lang);
  return (
    <span className="sn-vbadge-wrap">
      <span className="sn-vbadge" title={why}><CheckIcon size={15} />{T[lang].verified}</span>
      {showReason ? <span className="sn-vreason">{why}</span> : null}
    </span>
  );
}

export function Star({ on, size = 14 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={on ? "sn-star on" : "sn-star"}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor" /></svg>
  );
}

// "star 4.8 (12)": only when there are real reviews.
export function RatingLine({ t, lang, className }: { t: TrustInfo; lang: Lang; className?: string }) {
  const n = t.ratingCount || 0;
  if (n <= 0 || t.ratingAvg === null || t.ratingAvg === undefined) return null;
  return (
    <span className={"sn-rate " + (className || "")} title={T[lang].ratingAria} aria-label={T[lang].ratingAria + ": " + t.ratingAvg.toFixed(1) + " (" + n + ")"}>
      <Star on size={13} /><b>{t.ratingAvg.toFixed(1)}</b><span>({n})</span>
    </span>
  );
}

export function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  return <span className="sn-starrow" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <Star key={i} on={i <= Math.round(value)} size={size} />)}</span>;
}
