import { createContext, useContext, useEffect, useState } from "react";
import { safeGet, safeSet } from "./storage";
const ThemeCtx = createContext(null);
const KEY = "resumeiq-theme";
function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
}
function initialTheme() {
    const stored = safeGet(KEY, null);
    if (stored === "light" || stored === "dark")
        return stored;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const t = initialTheme();
        if (typeof document !== "undefined")
            applyTheme(t);
        return t;
    });
    useEffect(() => {
        applyTheme(theme);
        safeSet(KEY, theme);
    }, [theme]);
    const value = {
        theme,
        toggle: () => setThemeState((p) => (p === "dark" ? "light" : "dark")),
        setTheme: setThemeState,
    };
    return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
export function useTheme() {
    const ctx = useContext(ThemeCtx);
    if (!ctx)
        throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
