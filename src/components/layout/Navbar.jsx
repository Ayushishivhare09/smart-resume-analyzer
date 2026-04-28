import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Target, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
const links = [
    { to: "/", label: "Home" },
    { to: "/analyze", label: "Analyze" },
    { to: "/tracker", label: "Tracker" },
    { to: "/history", label: "History" },
];
export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const loc = useLocation();
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    useEffect(() => setOpen(false), [loc.pathname]);
    return (<header data-print-hide className={`sticky top-0 z-50 transition-all ${scrolled ? "backdrop-blur-md bg-[hsl(var(--bg)/0.75)] border-b border-token" : "bg-transparent"}`}>
      <nav className="container-rq flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg text-white">
            <Target className="h-4 w-4"/>
          </span>
          <span className="gradient-text">ResumeIQ</span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (<li key={l.to}>
              <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => `px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                ? "text-foreground bg-[hsl(var(--accent-primary)/0.08)]"
                : "text-muted-token hover:text-foreground"}`}>
                {l.label}
              </NavLink>
            </li>))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/analyze" className="hidden sm:inline-flex btn-ghost-token px-3 py-2 text-sm">
            Sign In
          </Link>
          <Link to="/analyze" className="hidden sm:inline-flex btn-gradient px-4 py-2 text-sm font-medium">
            Get Started
          </Link>
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-token text-foreground">
            <Menu className="h-4 w-4"/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (<div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-[hsl(var(--bg)/0.7)] backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}/>
          <aside className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-surface border-l border-token p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display font-bold gradient-text text-lg">ResumeIQ</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-token">
                <X className="h-4 w-4"/>
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {links.map((l) => (<li key={l.to}>
                  <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => `block px-3 py-3 rounded-lg text-base ${isActive
                    ? "bg-[hsl(var(--accent-primary)/0.1)] text-foreground"
                    : "text-muted-token"}`}>
                    {l.label}
                  </NavLink>
                </li>))}
            </ul>
            <div className="mt-8 flex flex-col gap-2">
              <Link to="/analyze" className="btn-ghost-token px-4 py-3 text-center text-sm">
                Sign In
              </Link>
              <Link to="/analyze" className="btn-gradient px-4 py-3 text-center text-sm font-medium">
                Get Started
              </Link>
            </div>
          </aside>
        </div>)}
    </header>);
}
