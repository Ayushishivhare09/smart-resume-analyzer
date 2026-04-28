import { ArrowRight, FileText, Target, PenLine, Mic, KanbanSquare, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
const items = [
    {
        icon: FileText,
        title: "Resume Scorer",
        body: "Paste your resume and get a detailed score across formatting, clarity, impact, and keywords — in seconds.",
        to: "/analyze",
        hue: "var(--accent-primary)",
    },
    {
        icon: Target,
        title: "Job Match Tool",
        body: "Paste a job description alongside your resume. See exactly how well you match and what's missing.",
        to: "/analyze",
        hue: "var(--accent-secondary)",
    },
    {
        icon: PenLine,
        title: "Cover Letter Builder",
        body: "Fill in a quick form, pick a tone, and get a clean, ready-to-send cover letter formatted for you.",
        to: "/analyze",
        hue: "var(--accent-primary)",
    },
    {
        icon: Mic,
        title: "Interview Prep",
        body: "Pick your role and get a bank of likely interview questions with example answers you can practice from.",
        to: "/analyze",
        hue: "var(--accent-secondary)",
    },
    {
        icon: KanbanSquare,
        title: "Application Tracker",
        body: "Track every job you've applied to with a Kanban board. See your pipeline at a glance.",
        to: "/tracker",
        hue: "var(--accent-primary)",
    },
    {
        icon: LineChart,
        title: "Score History",
        body: "Every analysis is saved. Come back, compare versions, and watch your score improve over time.",
        to: "/history",
        hue: "var(--accent-secondary)",
    },
];
export function Features() {
    return (<section id="features" className="section-pad">
      <div className="container-rq">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="font-display text-section text-foreground">
            Everything you need to{" "}
            <span className="gradient-text">land your dream job</span>
          </h2>
          <p className="mt-4 text-muted-token">
            Six tools that play together — paste once, get a full picture, then track every step from wishlist to offer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => {
            const Icon = it.icon;
            return (<Link key={it.title} to={it.to} className="surface-card surface-card-hover p-7 group block">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5" style={{ background: `hsl(${it.hue} / 0.15)`, color: `hsl(${it.hue})` }}>
                  <Icon className="h-5 w-5"/>
                </span>
                <h3 className="text-cardtitle font-display text-foreground mb-2">{it.title}</h3>
                <p className="text-sm text-muted-token leading-relaxed">{it.body}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium gradient-text -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Try it <ArrowRight className="ml-1 h-3.5 w-3.5"/>
                </span>
              </Link>);
        })}
        </div>
      </div>
    </section>);
}
