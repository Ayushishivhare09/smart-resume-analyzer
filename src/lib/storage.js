// Safe localStorage helpers — every call wrapped in try/catch.
export function safeGet(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null)
            return fallback;
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
export function safeSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return { ok: true };
    }
    catch (err) {
        const isQuota = err instanceof DOMException &&
            (err.name === "QuotaExceededError" || err.code === 22);
        return { ok: false, reason: isQuota ? "quota" : "unknown" };
    }
}
export function safeRemove(key) {
    try {
        localStorage.removeItem(key);
    }
    catch {
        /* noop */
    }
}
