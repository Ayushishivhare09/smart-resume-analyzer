import { useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InputPanel } from "@/components/analyze/InputPanel";
import { ScoreCard } from "@/components/analyze/ScoreCard";
import { KeywordCard } from "@/components/analyze/KeywordCard";
import { SuggestionsCard } from "@/components/analyze/SuggestionsCard";
import { CoverLetterCard } from "@/components/analyze/CoverLetterCard";
import { InterviewCard } from "@/components/analyze/InterviewCard";
import { analyze } from "@/lib/analyzer";
import { saveHistory } from "@/lib/history";
import { useToast, usePageMeta } from "@/lib/toast";
function Skeleton() {
    return (<div className="space-y-6">
      {[1, 2, 3].map((i) => (<div key={i} className="surface-card p-7 animate-pulse">
          <div className="h-5 w-1/3 rounded bg-[hsl(var(--border-token))]"/>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-[hsl(var(--border-token))]"/>
            <div className="h-3 w-5/6 rounded bg-[hsl(var(--border-token))]"/>
            <div className="h-3 w-4/6 rounded bg-[hsl(var(--border-token))]"/>
          </div>
        </div>))}
    </div>);
}
function EmptyResults() {
    return (<div className="surface-card p-10 text-center">
      <div className="mx-auto mb-5 h-16 w-16 rounded-2xl grid place-items-center" style={{ background: "hsl(var(--accent-primary) / 0.1)" }}>
        <span className="font-display text-2xl gradient-text">→</span>
      </div>
      <h3 className="font-display text-cardtitle mb-2">Your report appears here</h3>
      <p className="text-sm text-muted-token max-w-sm mx-auto">
        Paste your resume on the left, optionally add a job description, then hit <strong>Analyze Resume</strong>. Results show up here instantly.
      </p>
    </div>);
}
export default function Analyze() {
    usePageMeta("Analyze your resume — ResumeIQ", "Paste your resume and optionally a job description to get a score, missing keywords, suggestions, a cover letter and interview prep.");
    const [resume, setResume] = useState("");
    const [jd, setJd] = useState("");
    const [options, setOptions] = useState({
        score: true, keywords: true, coverLetter: true, interview: true,
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const toast = useToast();
    const runAnalysis = () => {
        setLoading(true);
        setResult(null);
        window.setTimeout(() => {
            const r = analyze(resume.trim(), jd.trim());
            setResult(r);
            setLoading(false);
            // Auto-save
            const out = saveHistory(resume.trim(), jd.trim(), r);
            if (out.outcome === "ok")
                toast.info("Analysis saved to history");
            else if (out.outcome === "evicted")
                toast.info("Oldest analysis removed to make space");
            else
                toast.error("Couldn't save — storage full");
            // Smooth scroll to results on mobile
            window.requestAnimationFrame(() => {
                const el = document.getElementById("results-anchor");
                if (el && window.innerWidth < 1024)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }, 2500);
    };
    const reset = () => {
        setResult(null);
    };
    const printAll = () => window.print();
    return (<div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container-rq py-10 lg:py-14 flex-1 w-full">
        <header className="mb-8 max-w-2xl">
          <h1 className="font-display text-section">Analyze your resume</h1>
          <p className="text-muted-token mt-2">
            Paste your resume — and optionally the job posting — for a score, keyword check, suggestions, cover letter and interview prep.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <InputPanel resume={resume} setResume={setResume} jd={jd} setJd={setJd} options={options} setOptions={setOptions} onAnalyze={runAnalysis} loading={loading}/>

          <section id="results-anchor" className="space-y-6">
            {loading && <Skeleton />}
            {!loading && !result && <EmptyResults />}
            {!loading && result && (<>
                <div className="flex flex-wrap items-center justify-end gap-2" data-print-hide>
                  <button onClick={printAll} className="btn-ghost-token inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium">
                    <Printer className="h-3.5 w-3.5"/> Export PDF
                  </button>
                  <button onClick={reset} className="btn-ghost-token inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium">
                    <RotateCcw className="h-3.5 w-3.5"/> Re-analyze
                  </button>
                </div>
                {options.score && (<div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
                    <ScoreCard score={result.score} sub={result.subScores} scoreBreakdown={result.scoreBreakdown} strengthLevel={result.strengthLevel} atsSimulation={result.atsSimulation}/>
                  </div>)}
                {options.keywords && (<div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
                    <KeywordCard found={result.keywordsFound} missing={result.keywordsMissing} hasJD={!!jd.trim()}/>
                  </div>)}
                <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
                  <SuggestionsCard items={result.suggestions}/>
                </div>
                {options.coverLetter && (<div className="animate-fade-up" style={{ animationDelay: "450ms" }}>
                    <CoverLetterCard initial={result.coverLetter}/>
                  </div>)}
                {options.interview && (<div className="animate-fade-up" style={{ animationDelay: "600ms" }}>
                    <InterviewCard items={result.interviewQuestions}/>
                  </div>)}
              </>)}
          </section>
        </div>
      </main>
      <Footer />
    </div>);
}
