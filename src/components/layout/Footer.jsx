import { Link } from "react-router-dom";
import { Target } from "lucide-react";
export function Footer() {
    return (<footer data-print-hide className="border-t border-token bg-surface mt-20">
      <div className="container-rq py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg text-white">
              <Target className="h-4 w-4"/>
            </span>
            <span className="font-display font-bold text-lg gradient-text">ResumeIQ</span>
          </div>
          <p className="text-muted-token text-sm max-w-sm leading-relaxed">
            A small, focused career toolkit for job seekers who'd rather get a clear next step than another inbox of advice.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 text-foreground">Product</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-token">
            <li><Link to="/analyze" className="hover:text-foreground transition-colors">Analyze</Link></li>
            <li><Link to="/tracker" className="hover:text-foreground transition-colors">Tracker</Link></li>
            <li><Link to="/history" className="hover:text-foreground transition-colors">Score History</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3 text-foreground">About</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted-token">
            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#how" className="hover:text-foreground transition-colors">How it works</a></li>
            <li><span className="opacity-70">Privacy — your data stays on your device</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-token">
        <div className="container-rq py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-muted-token">
          <span>© {new Date().getFullYear()} ResumeIQ — Made for job seekers.</span>
          <span>Everything runs in your browser. No tracking, no servers.</span>
        </div>
      </div>
    </footer>);
}
