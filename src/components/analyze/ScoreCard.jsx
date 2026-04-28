import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { scoreLabel } from "@/lib/analyzer";
const TONE_VAR = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
};
function useCount(target, ms = 1200) {
    const [v, setV] = useState(0);
    useEffect(() => {
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            setV(target);
            return;
        }
        const start = performance.now();
        let raf = 0;
        const tick = (t) => {
            const p = Math.min(1, (t - start) / ms);
            const eased = 1 - Math.pow(1 - p, 3);
            setV(Math.round(target * eased));
            if (p < 1)
                raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, ms]);
    return v;
}
function Bar({ label, value, max }) {
    const safeValue = Number.isFinite(value) ? value : 0;
    const pct = Math.round((safeValue / max) * 100);
    return (<div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-token">{label}</span>
        <span className="text-xs text-muted-token tabular-nums">{safeValue}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[hsl(var(--border-token))] overflow-hidden">
        <div className="h-full gradient-bg rounded-full transition-[width] duration-1000 ease-out" style={{ width: `${pct}%` }}/>
      </div>
    </div>);
}
function BreakdownRow({ item }) {
    if (!item)
        return null;
    return (<div className="rounded-lg border border-token p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{item.label}</p>
        <span className="text-xs text-muted-token tabular-nums">{item.score}/{item.max}</span>
      </div>
      <p className="text-[11px] text-muted-token mt-1">{item.reason}</p>
    </div>);
}
export function ScoreCard({ score, sub, scoreBreakdown, strengthLevel, atsSimulation }) {
    const v = useCount(score);
    const fallback = scoreLabel(score);
    const label = strengthLevel?.label ?? fallback.label;
    const tone = strengthLevel?.tone ?? fallback.tone;
    const colorVar = TONE_VAR[tone];
    const radius = 70;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (v / 100) * circ;
    const breakdownItems = scoreBreakdown ? Object.values(scoreBreakdown) : [];
    const whyText = breakdownItems.map((b) => `${b.label}: ${b.score}/${b.max} — ${b.reason}`).join("\n");
    return (<article className="surface-card p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-cardtitle font-display">Resume Score</h3>
          {whyText && (<button title={whyText} aria-label="Why this score" className="h-6 w-6 rounded-md border border-token inline-flex items-center justify-center text-muted-token hover:text-foreground">
              <Info className="h-3.5 w-3.5"/>
            </button>)}
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `hsl(${colorVar} / 0.15)`, color: `hsl(${colorVar})` }}>{label}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-7">
        <div className="relative h-44 w-44 shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r={radius} stroke="hsl(var(--border-token))" strokeWidth="10" fill="none"/>
            <circle cx="80" cy="80" r={radius} stroke={`hsl(${colorVar})`} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s ease-out" }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-5xl font-bold tabular-nums" style={{ color: `hsl(${colorVar})` }}>
              {v}
            </span>
            <span className="text-xs text-muted-token mt-1">out of 100</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          <Bar label="Formatting" value={sub?.formatting ?? 0} max={20}/>
          <Bar label="Clarity" value={sub?.clarity ?? 0} max={35}/>
          <Bar label="Keyword Strength" value={sub?.keywords ?? 0} max={35}/>
          {strengthLevel?.message && <p className="text-xs text-muted-token">{strengthLevel.message}</p>}
        </div>
      </div>

      {atsSimulation && (<div className="mt-5 rounded-xl border border-token p-4" style={{ background: `hsl(var(--bg))` }}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">ATS Simulation</p>
            <span className="text-xs px-2 py-1 rounded-md" style={{
                color: `hsl(${TONE_VAR[atsSimulation.tone] ?? "var(--accent-primary)"})`,
                background: `hsl(${TONE_VAR[atsSimulation.tone] ?? "var(--accent-primary)"} / 0.15)`,
            }}>
              {atsSimulation.verdict}
            </span>
          </div>
          <p className="text-xs text-muted-token mt-2">Confidence: {atsSimulation.confidence}%</p>
          {Array.isArray(atsSimulation.reasons) && atsSimulation.reasons.length > 0 && (<ul className="mt-2 text-xs text-muted-token list-disc pl-4 space-y-1">
              {atsSimulation.reasons.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
            </ul>)}
        </div>)}

      {breakdownItems.length > 0 && (<div className="mt-5">
          <h4 className="text-sm font-semibold text-foreground mb-2">Transparent scoring breakdown</h4>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {breakdownItems.map((b) => <BreakdownRow key={b.label} item={b}/>) }
          </div>
        </div>)}
    </article>);
}
