import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
export function FinalCTA() {
    return (<section className="section-pad">
      <div className="container-rq">
        <div className="relative overflow-hidden rounded-[24px] border border-token bg-surface px-8 py-16 text-center">
          <div aria-hidden className="absolute inset-0 opacity-[0.12]" style={{
            background: "linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))",
        }}/>
          <div className="relative">
            <h2 className="font-display text-section text-foreground">Ready to stand out?</h2>
            <p className="mt-3 text-muted-token">No account needed. Start in seconds.</p>
            <Link to="/analyze" className="btn-gradient inline-flex items-center gap-2 mt-7 px-7 py-4 text-sm font-semibold">
              Analyze My Resume Now <ArrowRight className="h-4 w-4"/>
            </Link>
          </div>
        </div>
      </div>
    </section>);
}
