import { Link } from "react-router-dom";
import { ArrowRight, Rocket } from "lucide-react";
export function Hero() {
    return (<section className="relative section-pad overflow-hidden">
      {/* gradient orbs */}
      <div aria-hidden className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full" style={{
            background: "radial-gradient(closest-side, hsl(var(--accent-primary) / 0.18), transparent 70%)",
            filter: "blur(20px)",
        }}/>
      <div aria-hidden className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full" style={{
            background: "radial-gradient(closest-side, hsl(var(--accent-secondary) / 0.18), transparent 70%)",
            filter: "blur(20px)",
        }}/>

      <div className="container-rq relative text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-token bg-surface px-4 py-1.5 text-xs font-medium text-muted-token">
          <span className="h-1.5 w-1.5 rounded-full gradient-bg"/>
          Smart Career Platform
        </span>

        <h1 className="font-display text-hero mt-8">
          <span className="block text-foreground">Analyze.</span>
          <span className="block shimmer">Optimize.</span>
          <span className="block text-foreground">Get Hired.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-token">
          Get your resume scored, find missing keywords, write cover letters, and prep for interviews — all in one tab.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/analyze" className="btn-gradient inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold">
            <Rocket className="h-4 w-4"/>
            Analyze My Resume
          </Link>
          <a href="#how" className="btn-ghost-token inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium">
            View Demo <ArrowRight className="h-4 w-4"/>
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { n: "Helping job seekers", l: "build stronger resumes" },
            { n: "2 min", l: "average analysis time" },
            { n: "Loved by early adopters", l: "growing daily" },
        ].map((s) => (<div key={s.l} className="text-center">
              <div className="font-display text-2xl font-bold gradient-text">{s.n}</div>
              <div className="text-sm text-muted-token mt-1">{s.l}</div>
            </div>))}
        </div>
      </div>
    </section>);
}
