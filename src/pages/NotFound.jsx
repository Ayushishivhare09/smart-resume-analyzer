import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePageMeta } from "@/lib/toast";
export default function NotFound() {
    usePageMeta("Page not found — ResumeIQ", "We couldn't find that page. Head back to the home page to start over.");
    return (<div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center section-pad">
        <div className="container-rq text-center max-w-lg">
          <div className="relative mx-auto mb-8 h-32 w-32">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-token"/>
            <div className="absolute inset-4 rounded-full" style={{ background: "hsl(var(--accent-primary) / 0.12)" }}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl font-bold gradient-text">404</span>
            </div>
          </div>
          <h1 className="font-display text-section">This page wandered off</h1>
          <p className="text-muted-token mt-3">
            The link you followed might be old, or the page may have moved. Let's get you back on track.
          </p>
          <Link to="/" className="btn-gradient inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-medium">
            <ArrowLeft className="h-4 w-4"/> Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>);
}
