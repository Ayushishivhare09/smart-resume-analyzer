import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Column } from "@/components/tracker/Column";
import { JobModal } from "@/components/tracker/JobModal";
import { JobCard } from "@/components/tracker/JobCard";
import { STATUS_LABEL, STATUS_ORDER, STATUS_TOKEN, listApplications, nextStatus, saveApplications, } from "@/lib/applications";
import { useToast, usePageMeta } from "@/lib/toast";
const PRIO_RANK = { hot: 0, warm: 1, cold: 2 };
export default function Tracker() {
    usePageMeta("Application Tracker — ResumeIQ", "Track every job you've applied to with a Kanban board. Wishlist, Applied, Interview, Offer, Rejected — all in one place.");
    const [apps, setApps] = useState(() => listApplications());
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [modal, setModal] = useState({
        open: false,
        initial: null,
    });
    const [openCols, setOpenCols] = useState({
        wishlist: true, applied: true, interview: true, offer: false, rejected: false,
    });
    const toast = useToast();
    useEffect(() => saveApplications(apps), [apps]);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let base = apps;
        if (q)
            base = base.filter((a) => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q));
        base = [...base].sort((a, b) => {
            if (sort === "priority")
                return PRIO_RANK[a.priority] - PRIO_RANK[b.priority];
            if (sort === "oldest")
                return a.createdAt.localeCompare(b.createdAt);
            return b.createdAt.localeCompare(a.createdAt);
        });
        return base;
    }, [apps, query, sort]);
    const byStatus = (s) => filtered.filter((a) => a.status === s);
    const onSave = (a) => {
        setApps((prev) => {
            const exists = prev.some((p) => p.id === a.id);
            const next = exists ? prev.map((p) => (p.id === a.id ? a : p)) : [a, ...prev];
            return next;
        });
        toast.success(modal.initial ? "Application updated" : "Application added");
        setModal({ open: false, initial: null });
    };
    const onDelete = (a) => {
        if (!confirm(`Delete ${a.company} — ${a.role}?`))
            return;
        setApps((prev) => prev.filter((p) => p.id !== a.id));
        toast.success("Application deleted");
    };
    const onAdvance = (a) => {
        const ns = nextStatus(a.status);
        if (!ns)
            return;
        setApps((prev) => prev.map((p) => (p.id === a.id ? { ...p, status: ns } : p)));
        toast.info(`Moved to ${STATUS_LABEL[ns]}`);
    };
    return (<div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container-rq py-10 lg:py-14 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-section flex items-center gap-3">
              My Applications
              <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-[hsl(var(--accent-primary)/0.12)]" style={{ color: "hsl(var(--accent-primary))" }}>
                {apps.length}
              </span>
            </h1>
            <p className="text-muted-token text-sm mt-1">Drag your search through five clean stages.</p>
          </div>
          <button onClick={() => setModal({ open: true, initial: null })} className="btn-gradient inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4"/> Add Job
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-token"/>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by company or role" className="input-token w-full pl-9 pr-3 py-2.5 text-sm"/>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-token px-3 py-2.5 text-sm" aria-label="Sort applications">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">By priority</option>
          </select>
        </div>

        {/* Desktop kanban */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_ORDER.map((s) => (<Column key={s} status={s} apps={byStatus(s)} onAdd={() => setModal({ open: true, initial: null, defaultStatus: s })} onEdit={(a) => setModal({ open: true, initial: a })} onDelete={onDelete} onAdvance={onAdvance}/>))}
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden space-y-3">
          {STATUS_ORDER.map((s) => {
            const items = byStatus(s);
            const tone = STATUS_TOKEN[s];
            const isOpen = openCols[s];
            return (<div key={s} className="bg-surface border border-token rounded-[18px] overflow-hidden" style={{ borderLeft: `3px solid hsl(${tone})` }}>
                <button onClick={() => setOpenCols((p) => ({ ...p, [s]: !p[s] }))} className="w-full flex items-center justify-between px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm text-foreground">{STATUS_LABEL[s]}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `hsl(${tone} / 0.15)`, color: `hsl(${tone})` }}>
                      {items.length}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-token transition-transform ${isOpen ? "rotate-180" : ""}`}/>
                </button>
                {isOpen && (<div className="px-3 pb-3 space-y-2.5 max-h-[60vh] overflow-y-auto border-t border-token pt-3">
                    {items.length === 0 ? (<p className="text-center text-xs text-muted-token py-6">
                        Nothing in {STATUS_LABEL[s]} yet.
                      </p>) : (items.map((a) => (<JobCard key={a.id} app={a} onEdit={() => setModal({ open: true, initial: a })} onDelete={() => onDelete(a)} onAdvance={() => onAdvance(a)}/>)))}
                    <button onClick={() => setModal({ open: true, initial: null, defaultStatus: s })} className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-dashed border-token rounded-lg text-muted-token">
                      <Plus className="h-3.5 w-3.5"/> Add
                    </button>
                  </div>)}
              </div>);
        })}
        </div>
      </main>

      <JobModal open={modal.open} initial={modal.initial} defaultStatus={modal.defaultStatus} onClose={() => setModal({ open: false, initial: null })} onSave={onSave}/>
      <Footer />
    </div>);
}
