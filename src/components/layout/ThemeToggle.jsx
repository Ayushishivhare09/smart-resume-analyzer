import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
export function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";
    return (<button onClick={toggle} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} className="relative inline-flex h-9 w-16 items-center rounded-full border border-token bg-surface transition-colors hover:border-[hsl(var(--accent-primary)/0.5)]">
      <span className={`absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full gradient-bg text-white shadow transition-transform duration-300 ${isDark ? "translate-x-7" : "translate-x-0"}`}>
        {isDark ? <Moon className="h-3.5 w-3.5"/> : <Sun className="h-3.5 w-3.5"/>}
      </span>
    </button>);
}
