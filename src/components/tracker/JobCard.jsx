import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { nextStatus } from "@/lib/applications";
const PRIO_TONE = {
    hot: { label: "Hot", tone: "var(--danger)" },
    warm: { label: "Warm", tone: "var(--warning)" },
    cold: { label: "Cold", tone: "var(--accent-secondary)" },
};
export function JobCard({ app, onEdit, onDelete, onAdvance }) {
    const next = nextStatus(app.status);
    const prio = PRIO_TONE[app.priority];
    const noteShort = app.notes ? (app.notes.length > 60 ? `${app.notes.slice(0, 60)}…` : app.notes) : "";
    return (<article className="surface-card p-4 group animate-fade-up">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-[15px] text-foreground truncate">{app.company}</h4>
          <p className="text-[13px] text-muted-token truncate">{app.role}</p>
        </div>
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md shrink-0" style={{ background: `hsl(${prio.tone} / 0.15)`, color: `hsl(${prio.tone})` }}>
          {prio.label}
        </span>
      </div>
      {(app.dateApplied || app.salary) && (<div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          {app.dateApplied && (<span className="px-2 py-0.5 rounded-md border border-token text-muted-token">
              {new Date(app.dateApplied).toLocaleDateString()}
            </span>)}
          {app.salary && (<span className="px-2 py-0.5 rounded-md border border-token text-muted-token">{app.salary}</span>)}
        </div>)}
      {noteShort && <p className="mt-3 text-[13px] text-muted-token leading-snug">{noteShort}</p>}
      <div className="mt-3 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} aria-label="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-token hover:text-foreground hover:bg-[hsl(var(--bg))]">
          <Pencil className="h-3.5 w-3.5"/>
        </button>
        <button onClick={onDelete} aria-label="Delete" className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-token hover:bg-[hsl(var(--danger)/0.1)]" style={{ color: "" }}>
          <Trash2 className="h-3.5 w-3.5"/>
        </button>
        {next && (<button onClick={onAdvance} aria-label={`Move to ${next}`} className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md hover:bg-[hsl(var(--accent-primary)/0.1)]" style={{ color: "hsl(var(--accent-primary))" }}>
            Advance <ArrowRight className="h-3 w-3"/>
          </button>)}
      </div>
    </article>);
}
