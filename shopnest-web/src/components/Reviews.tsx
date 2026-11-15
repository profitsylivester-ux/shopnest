"use client";
import { useCallback, useEffect, useState } from "react";
import { T, fill, type Lang } from "../lib/i18n";
import { API_URL } from "../lib/seo";
import { readUser, type SessionUser } from "../lib/site";
import { Star, StarRow } from "./Trust";

type Item = { id: string; rating: number; comment: string | null; createdAt: string; author: string };
type Summary = { count: number; avg: number | null; distribution: { stars: number; count: number }[] };
type Mine = { id: string; rating: number; comment: string | null; status: string } | null;

const when = (iso: string, lang: Lang) => new Date(iso).toLocaleDateString(lang === "SW" ? "sw-TZ" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

// Reviews for one shop: summary, list, and a form for signed-in buyers. Everything shown is real; nothing is made up.
export default function Reviews({ slug, lang, onChanged }: { slug: string; lang: Lang; onChanged?: () => void }) {
  const d = T[lang];
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [approval, setApproval] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mine, setMine] = useState<Mine>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const base = API_URL + "/stores/" + encodeURIComponent(slug) + "/reviews";
  const token = () => { try { return localStorage.getItem("shopnest_token") || ""; } catch { return ""; } };

  const loadList = useCallback(async (pg: number, replace: boolean) => {
    try {
      const r = await fetch(base + "?limit=10&page=" + pg);
      if (!r.ok) return;
      const j = await r.json();
      setSummary(j.summary); setPages(j.pages); setPage(pg); setApproval(!!j.approvalRequired);
      setItems((prev) => (replace ? j.items : [...prev, ...j.items]));
    } catch { /* offline: keep what is shown */ }
  }, [base]);

  const loadMine = useCallback(async () => {
    const tk = token();
    if (!tk) { setMine(null); setIsOwner(false); return; }
    try {
      const r = await fetch(base + "/mine", { headers: { Authorization: "Bearer " + tk } });
      if (!r.ok) { setMine(null); return; }
      const j = await r.json();
      setMine(j.review || null); setIsOwner(!!j.isOwner);
      if (j.review) { setStars(j.review.rating); setText(j.review.comment || ""); }
    } catch { /* ignore */ }
  }, [base]);

  useEffect(() => { loadList(1, true); }, [loadList]);
  useEffect(() => {
    const sync = () => { setUser(readUser()); loadMine(); };
    sync();
    window.addEventListener("shopnest-auth", sync);
    return () => window.removeEventListener("shopnest-auth", sync);
  }, [loadMine]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars < 1) { setMsg({ kind: "err", text: d.reviewNeedStars }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(base, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() }, body: JSON.stringify({ rating: stars, comment: text.trim() || undefined }) });
      if (r.ok) {
        const j = await r.json();
        setMine(j); setEditing(false);
        setMsg({ kind: "ok", text: j.status === "PENDING" ? d.reviewPending : d.reviewThanks });
        await loadList(1, true); onChanged?.();
      } else if (r.status === 403) setMsg({ kind: "err", text: isOwner ? d.ownShop : d.cantReview });
      else setMsg({ kind: "err", text: d.reviewFail });
    } catch { setMsg({ kind: "err", text: d.reviewFail }); }
    setBusy(false);
  };

  const remove = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(base + "/mine", { method: "DELETE", headers: { Authorization: "Bearer " + token() } });
      if (r.ok) { setMine(null); setStars(0); setText(""); setEditing(false); setMsg({ kind: "ok", text: d.reviewDeleted }); await loadList(1, true); onChanged?.(); }
      else setMsg({ kind: "err", text: d.reviewFail });
    } catch { setMsg({ kind: "err", text: d.reviewFail }); }
    setBusy(false);
  };

  const openSignIn = () => window.dispatchEvent(new CustomEvent("shopnest-open-auth", { detail: { mode: "login" } }));
  const shown = hover || stars;
  const canWrite = !!user && user.role !== "ADMIN" && !isOwner;
  const count = summary ? summary.count : 0;

  return (
    <section className="sn-reviews" id="reviews" aria-label={d.reviewsTitle}>
      <h2 className="sn-h2">{d.reviewsTitle}</h2>

      {summary && count > 0 && summary.avg !== null && (
        <div className="sn-rv-summary">
          <div className="sn-rv-big"><b>{summary.avg.toFixed(1)}</b><StarRow value={summary.avg} size={20} /><span>{count === 1 ? d.reviewsCountOne : fill(d.reviewsCount, { n: count })}</span></div>
          <div className="sn-rv-bars">
            {summary.distribution.map((x) => (
              <div key={x.stars} className="sn-rv-bar"><span>{x.stars}</span><Star on size={12} /><i><u style={{ width: (count ? Math.round((x.count / count) * 100) : 0) + "%" }} /></i><em>{x.count}</em></div>
            ))}
          </div>
        </div>
      )}

      <div className="sn-rv-form">
        {!user ? (
          <div className="sn-rv-cta"><p>{d.signInToReview}</p><button type="button" className="sn-btn sn-btn-dark sn-btn-sm" onClick={openSignIn}>{d.signIn}</button></div>
        ) : isOwner ? (
          <p className="sn-rv-note">{d.ownShop}</p>
        ) : !canWrite ? (
          <p className="sn-rv-note">{d.cantReview}</p>
        ) : mine && !editing ? (
          <div className="sn-rv-mine">
            <div className="sn-rv-mine-head"><strong>{d.youLabel}</strong><StarRow value={mine.rating} /></div>
            {mine.comment ? <p>{mine.comment}</p> : null}
            {mine.status === "PENDING" && <p className="sn-rv-note">{d.reviewPending}</p>}
            {mine.status === "HIDDEN" && <p className="sn-rv-note">{d.reviewHidden}</p>}
            <div className="sn-rv-actions">
              <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={() => { setEditing(true); setMsg(null); }}>{d.updateReview}</button>
              <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={remove} disabled={busy}>{d.deleteReview}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>{mine ? d.updateReview : d.writeReview}</h3>
            <div className="sn-rv-pick" role="radiogroup" aria-label={d.yourRating} onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={fill(d.starsLabel, { n })} className="sn-rv-star" onMouseEnter={() => setHover(n)} onClick={() => setStars(n)}>
                  <Star on={n <= shown} size={30} />
                </button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))} maxLength={500} rows={3} placeholder={d.commentPh} aria-label={d.commentPh} />
            <div className="sn-rv-count">{text.length}/500</div>
            {approval && <p className="sn-rv-note">{d.reviewsApprovalNote}</p>}
            <div className="sn-rv-actions">
              <button type="submit" className="sn-btn sn-btn-dark sn-btn-sm" disabled={busy}>{mine ? d.updateReview : d.postReview}</button>
              {mine && <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={() => { setEditing(false); setStars(mine.rating); setText(mine.comment || ""); }}>x</button>}
            </div>
          </form>
        )}
        {msg && <p role="status" className={"sn-rv-msg " + msg.kind}>{msg.text}</p>}
      </div>

      {count === 0 ? <p className="sn-rv-empty">{d.noReviews}</p> : (
        <ul className="sn-rv-list">
          {items.map((r) => (
            <li key={r.id}>
              <div className="sn-rv-head"><strong>{r.author}</strong><StarRow value={r.rating} size={14} /><span>{when(r.createdAt, lang)}</span></div>
              {r.comment ? <p>{r.comment}</p> : null}
            </li>
          ))}
        </ul>
      )}
      {page < pages && <button type="button" className="sn-btn sn-btn-line sn-btn-sm" onClick={() => loadList(page + 1, false)}>{d.showMore}</button>}
    </section>
  );
}
