import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HistoryCard } from "@/components/history/HistoryCard";
import { ViewFullDrawer } from "@/components/history/ViewFullDrawer";
import { CompareModal } from "@/components/history/CompareModal";
import { clearHistory, deleteHistory, listHistory } from "@/lib/history";
import { useToast, usePageMeta } from "@/lib/toast";
export default function History() {
    usePageMeta("Score History — ResumeIQ", "Every analysis you've run is saved on your device. Compare versions and watch your score improve over time.");
    const [entries, setEntries] = useState(() => listHistory());
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [viewing, setViewing] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [selected, setSelected] = useState([]);
    const [comparing, setComparing] = useState(null);
    const toast = useToast();
    useEffect(() => {
        const onFocus = () => setEntries(listHistory());
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let base = entries;
        if (q)
            base = base.filter((e) => e.resumeText.toLowerCase().includes(q) || (e.jobTitle ?? "").toLowerCase().includes(q));
        base = [...base].sort((a, b) => {
            if (sort === "oldest")
                return a.date.localeCompare(b.date);
            if (sort === "highest")
                return b.score - a.score;
            if (sort === "lowest")
                return a.score - b.score;
            return b.date.localeCompare(a.date);
        });
        return base;
    }, [entries, query, sort]);
    const onToggleSelect = (id) => {
        setSelected((prev) => {
            if (prev.includes(id))
                return prev.filter((p) => p !== id);
            if (prev.length >= 2) {
                toast.info("You can compare up to 2 analyses at once");
                return prev;
            }
            return [...prev, id];
        });
    };
    const openCompare = () => {
        if (selected.length !== 2)
            return;
        const [a, b] = selected.map((id) => entries.find((e) => e.id === id)).filter(Boolean);
        if (a && b)
            setComparing([a, b]);
    };
    const onDeleteEntry = (id) => {
        deleteHistory(id);
        setEntries(listHistory());
        setSelected((p) => p.filter((s) => s !== id));
        setConfirmingId(null);
        toast.success("Analysis deleted");
    };
    const onClearAll = () => {
        if (!confirm(`Clear all ${entries.length} saved analyses? This can't be undone.`))
            return;
        clearHistory();
        setEntries([]);
        setSelected([]);
        toast.success("History cleared");
    };
    return (<div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container-rq py-10 lg:py-14 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-section">Score History</h1>
            <p className="text-muted-token text-sm mt-1">
              {entries.length === 0 ? "Your saved analyses will appear here." : `${entries.length} ${entries.length === 1 ? "analysis" : "analyses"} saved`}
            </p>
          </div>
          {entries.length > 0 && (<button onClick={onClearAll} className="btn-ghost-token inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium self-start sm:self-auto">
              <Trash2 className="h-3.5 w-3.5"/> Clear All History
            </button>)}
        </div>

        {entries.length > 0 && (<div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-token"/>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by resume text or job title" className="input-token w-full pl-9 pr-3 py-2.5 text-sm"/>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-token px-3 py-2.5 text-sm" aria-label="Sort history">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest score</option>
              <option value="lowest">Lowest score</option>
            </select>
          </div>)}

        {entries.length === 0 ? (<div className="surface-card p-10 sm:p-16 text-center">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-token"/>
              <div className="absolute inset-3 rounded-full" style={{ background: "hsl(var(--accent-primary) / 0.12)" }}/>
              <div className="absolute inset-7 rounded-full gradient-bg opacity-80"/>
            </div>
            <h2 className="font-display text-cardtitle mb-2">You haven't analyzed any resumes yet.</h2>
            <p className="text-muted-token text-sm max-w-md mx-auto mb-6">
              Run your first analysis and it'll be saved here automatically — so you can compare future versions side by side.
            </p>
            <Link to="/analyze" className="btn-gradient inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
              Analyze My Resume →
            </Link>
          </div>) : filtered.length === 0 ? (<div className="surface-card p-10 text-center">
            <p className="text-muted-token text-sm">No analyses match that search. Try different words.</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((e) => (<HistoryCard key={e.id} entry={e} selected={selected.includes(e.id)} onToggleSelect={() => onToggleSelect(e.id)} onView={() => setViewing(e)} onDelete={() => setConfirmingId(e.id)} confirmingDelete={confirmingId === e.id} onConfirmDelete={() => onDeleteEntry(e.id)} onCancelDelete={() => setConfirmingId(null)}/>))}
          </div>)}
      </main>

      {selected.length === 2 && (<div data-print-hide className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 animate-fade-up">
          <button onClick={openCompare} className="btn-gradient inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-2xl">
            Compare 2 Selected →
          </button>
        </div>)}

      <ViewFullDrawer entry={viewing} onClose={() => setViewing(null)}/>
      {comparing && <CompareModal a={comparing[0]} b={comparing[1]} onClose={() => { setComparing(null); setSelected([]); }}/>}

      <Footer />
    </div>);
}
