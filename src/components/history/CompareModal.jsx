import { ArrowDown, ArrowUp, Minus, X } from "lucide-react";
import { useEffect } from "react";
export function CompareModal({ a, b, onClose }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);
    // Order older → newer for clarity
    const [older, newer] = [a, b].sort((x, y) => x.date.localeCompare(y.date));
    const delta = newer.score - older.score;
    const tone = delta > 0 ? "var(--success)" : delta < 0 ? "var(--danger)" : "var(--muted-token)";
    const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
    const lostKeywords = older.keywordsFound.filter((k) => !newer.keywordsFound.includes(k));
    const gainedKeywords = newer.keywordsFound.filter((k) => !older.keywordsFound.includes(k));
    return (<div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-[hsl(var(--bg)/0.7)] backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-5xl bg-surface border border-token rounded-[20px] max-h-[90vh] overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-token bg-surface">
          <div>
            <h2 className="font-display text-cardtitle">Side-by-side comparison</h2>
            <p className="text-xs text-muted-token mt-0.5">Older version on the left, newer on the right.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-token">
            <X className="h-4 w-4"/>
          </button>
        </header>

        <div className="px-6 py-6 grid md:grid-cols-2 gap-6">
          <Side label="Older" entry={older}/>
          <Side label="Newer" entry={newer}/>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-token p-5 flex items-center gap-4" style={{ background: `hsl(${tone} / 0.08)` }}>
            <div className="h-12 w-12 rounded-xl grid place-items-center" style={{ background: `hsl(${tone} / 0.15)`, color: `hsl(${tone})` }}>
              <Icon className="h-5 w-5"/>
            </div>
            <div>
              <div className="font-display text-lg font-semibold" style={{ color: `hsl(${tone})` }}>
                {delta > 0 ? `+${delta} points` : delta < 0 ? `${delta} points` : "No change"}
              </div>
              <div className="text-sm text-muted-token">
                {delta > 0 ? "Score improved between these two versions." : delta < 0 ? "Score dropped — review the diffs below." : "Same score, different content."}
              </div>
            </div>
          </div>

          {(gainedKeywords.length > 0 || lostKeywords.length > 0) && (<div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="surface-card p-5">
                <h4 className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--success))" }}>
                  Gained keywords ({gainedKeywords.length})
                </h4>
                {gainedKeywords.length === 0 ? (<p className="text-xs text-muted-token">No new keywords picked up.</p>) : (<div className="flex flex-wrap gap-1.5">
                    {gainedKeywords.map((k) => (<span key={k} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))" }}>{k}</span>))}
                  </div>)}
              </div>
              <div className="surface-card p-5">
                <h4 className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--danger))" }}>
                  Lost keywords ({lostKeywords.length})
                </h4>
                {lostKeywords.length === 0 ? (<p className="text-xs text-muted-token">Nothing dropped from the previous version.</p>) : (<div className="flex flex-wrap gap-1.5">
                    {lostKeywords.map((k) => (<span key={k} className="text-xs px-2.5 py-1 rounded-full border border-dashed" style={{ borderColor: "hsl(var(--danger)/0.5)", color: "hsl(var(--danger))" }}>{k}</span>))}
                  </div>)}
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
function Side({ label, entry }) {
    return (<div className="surface-card p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-token mb-2">{label}</div>
      <div className="font-display text-3xl font-bold gradient-text mb-1">{entry.score}<span className="text-base text-muted-token font-normal"> /100</span></div>
      <div className="text-xs text-muted-token">{new Date(entry.date).toLocaleString()}</div>
      <div className="text-xs text-muted-token mt-1">{entry.jobTitle ?? "General Resume"} · {entry.wordCount} words</div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <SubStat label="Format" value={entry.subScores.formatting}/>
        <SubStat label="Clarity" value={entry.subScores.clarity}/>
        <SubStat label="Keywords" value={entry.subScores.keywords}/>
      </div>
    </div>);
}
function SubStat({ label, value }) {
    return (<div className="rounded-lg border border-token p-2.5">
      <div className="font-semibold text-foreground tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-token uppercase tracking-wider">{label}</div>
    </div>);
}
