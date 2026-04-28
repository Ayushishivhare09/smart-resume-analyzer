import { Trash2, Eye } from "lucide-react";
import { scoreLabel } from "@/lib/analyzer";
const TONE_VAR = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
};
export function HistoryCard({ entry, selected, onToggleSelect, onView, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete, }) {
    const { tone, label } = scoreLabel(entry.score);
    const colorVar = TONE_VAR[tone];
    const date = new Date(entry.date);
    const snippet = entry.resumeText.replace(/\s+/g, " ").slice(0, 100);
    const title = entry.jobTitle ?? "General Resume";
    return (<article className={`surface-card surface-card-hover p-5 group relative transition ${selected ? "ring-2" : ""}`} style={selected ? { boxShadow: `0 0 0 2px hsl(var(--accent-primary))` } : undefined}>
      {/* Compare checkbox */}
      <label className="absolute top-3 right-3 z-10 cursor-pointer opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition has-[:checked]:opacity-100">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="sr-only peer"/>
        <span className="h-5 w-5 grid place-items-center rounded-md border-2 border-token bg-surface peer-checked:gradient-bg peer-checked:border-transparent transition">
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: selected ? 1 : 0 }}>
            <path d="M3 8.5l3 3 7-7"/>
          </svg>
        </span>
      </label>

      <div className="flex items-start gap-4 mb-3">
        <div className="h-14 w-14 shrink-0 rounded-xl grid place-items-center font-display font-bold text-lg tabular-nums" style={{ background: `hsl(${colorVar} / 0.15)`, color: `hsl(${colorVar})` }}>
          {entry.score}
        </div>
        <div className="min-w-0 pr-7">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-token mt-0.5">
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[11px] text-muted-token mt-0.5">
            {entry.wordCount} words · <span style={{ color: `hsl(${colorVar})` }}>{label}</span>
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-token leading-relaxed line-clamp-3 min-h-[3.75rem]">
        {snippet}{entry.resumeText.length > 100 ? "…" : ""}
      </p>

      {confirmingDelete ? (<div className="mt-4 p-3 rounded-lg border border-token bg-[hsl(var(--bg))]">
          <p className="text-xs text-foreground mb-2">Delete this analysis?</p>
          <div className="flex gap-2">
            <button onClick={onConfirmDelete} className="text-xs px-3 py-1.5 rounded-md text-white" style={{ background: "hsl(var(--danger))" }}>
              Yes, delete
            </button>
            <button onClick={onCancelDelete} className="text-xs px-3 py-1.5 rounded-md btn-ghost-token">
              No, keep it
            </button>
          </div>
        </div>) : (<div className="mt-4 flex items-center gap-2">
          <button onClick={onView} className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium">
            <Eye className="h-3 w-3"/> View Full
          </button>
          <button onClick={onDelete} className="btn-ghost-token inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Trash2 className="h-3 w-3"/> Delete
          </button>
        </div>)}
    </article>);
}
