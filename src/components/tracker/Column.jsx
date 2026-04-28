import { Plus } from "lucide-react";
import { STATUS_LABEL, STATUS_TOKEN } from "@/lib/applications";
import { JobCard } from "./JobCard";
export function Column({ status, apps, onAdd, onEdit, onDelete, onAdvance }) {
    const tone = STATUS_TOKEN[status];
    return (<div className="bg-surface border border-token rounded-[18px] flex flex-col" style={{ borderLeft: `3px solid hsl(${tone})`, maxHeight: "72vh" }}>
      <header className="flex items-center justify-between px-4 py-3 border-b border-token">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-sm">{STATUS_LABEL[status]}</h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `hsl(${tone} / 0.15)`, color: `hsl(${tone})` }}>
            {apps.length}
          </span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {apps.length === 0 ? (<EmptyColumn status={status}/>) : (apps.map((a) => (<JobCard key={a.id} app={a} onEdit={() => onEdit(a)} onDelete={() => onDelete(a)} onAdvance={() => onAdvance(a)}/>)))}
      </div>
      <button onClick={onAdd} className="m-3 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-dashed border-token rounded-lg text-muted-token hover:text-foreground hover:border-[hsl(var(--accent-primary)/0.5)] transition">
        <Plus className="h-3.5 w-3.5"/> Add
      </button>
    </div>);
}
const EMPTY = {
    wishlist: "Nothing here yet — add a role you're eyeing.",
    applied: "When you apply, drag it here so you can keep score.",
    interview: "Empty for now. The next interview will land right here.",
    offer: "No offers yet — every yes starts somewhere.",
    rejected: "Clean slate. Rejections sting, but they sharpen the pitch.",
};
function EmptyColumn({ status }) {
    return (<div className="text-center py-8 px-2">
      <div className="mx-auto mb-3 h-10 w-10 relative">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-token"/>
        <div className="absolute inset-2 rounded-full" style={{ background: `hsl(${STATUS_TOKEN[status]} / 0.15)` }}/>
      </div>
      <p className="text-xs text-muted-token leading-relaxed">{EMPTY[status]}</p>
    </div>);
}
