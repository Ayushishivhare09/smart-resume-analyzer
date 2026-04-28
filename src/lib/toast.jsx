import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
const Ctx = createContext(null);
let counter = 0;
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((kind, message) => {
        const id = ++counter;
        setToasts((p) => [...p, { id, kind, message }]);
        window.setTimeout(() => {
            setToasts((p) => p.filter((t) => t.id !== id));
        }, 3000);
    }, []);
    const value = {
        success: (m) => push("success", m),
        error: (m) => push("error", m),
        info: (m) => push("info", m),
    };
    const dismiss = (id) => setToasts((p) => p.filter((t) => t.id !== id));
    const portal = typeof document !== "undefined"
        ? createPortal(<div data-print-hide className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)]" aria-live="polite" role="status">
            {toasts.map((t) => {
                const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? AlertCircle : Info;
                const tone = t.kind === "success"
                    ? "border-[hsl(var(--success))] text-[hsl(var(--success))]"
                    : t.kind === "error"
                        ? "border-[hsl(var(--danger))] text-[hsl(var(--danger))]"
                        : "border-[hsl(var(--accent-primary))] text-[hsl(var(--accent-primary))]";
                return (<div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg animate-fade-up ${tone}`} style={{ minWidth: 280 }}>
                  <Icon className="h-5 w-5 mt-0.5 shrink-0"/>
                  <p className="text-sm text-foreground flex-1 leading-snug">{t.message}</p>
                  <button onClick={() => dismiss(t.id)} className="text-muted-token hover:text-foreground transition-colors" aria-label="Dismiss notification">
                    <X className="h-4 w-4"/>
                  </button>
                </div>);
            })}
          </div>, document.body)
        : null;
    return (<Ctx.Provider value={value}>
      {children}
      {portal}
    </Ctx.Provider>);
}
export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
export function usePageMeta(title, description) {
    useEffect(() => {
        document.title = title;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", description);
    }, [title, description]);
}
