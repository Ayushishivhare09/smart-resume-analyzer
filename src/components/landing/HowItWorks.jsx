import { ClipboardPaste, FileSearch, Sparkles } from "lucide-react";
const steps = [
    { n: 1, icon: ClipboardPaste, title: "Paste your resume", body: "Drop the full text right in — work history, skills, education, the lot." },
    { n: 2, icon: FileSearch, title: "Add the job (optional)", body: "Paste the job description you're aiming at to unlock the match score." },
    { n: 3, icon: Sparkles, title: "Get your full report", body: "Score, keywords, suggestions, cover letter, interview prep — all in seconds." },
];
export function HowItWorks() {
    return (<section id="how" className="section-pad bg-surface border-y border-token">
      <div className="container-rq">
        <div className="text-center mb-14 max-w-xl mx-auto">
          <h2 className="font-display text-section">How it works</h2>
          <p className="text-muted-token mt-3">Three steps. No signup. Nothing to install.</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div aria-hidden className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px border-t border-dashed" style={{ borderColor: "hsl(var(--accent-primary) / 0.4)" }}/>
          {steps.map((s) => {
            const Icon = s.icon;
            return (<div key={s.n} className="relative flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-token text-foreground mb-3">
                  <Icon className="h-5 w-5"/>
                </span>
                <span className="font-display text-3xl font-bold mb-2" style={{
                    WebkitTextStroke: "1.5px hsl(var(--accent-primary))",
                    color: "transparent",
                }}>
                  0{s.n}
                </span>
                <h3 className="font-display text-cardtitle">{s.title}</h3>
                <p className="text-sm text-muted-token mt-2 max-w-xs">{s.body}</p>
              </div>);
        })}
        </div>
      </div>
    </section>);
}
