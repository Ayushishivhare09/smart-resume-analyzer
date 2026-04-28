import { safeGet, safeSet } from "./storage";
const KEY = "resumeiq-applications";
export function listApplications() {
    return safeGet(KEY, []);
}
export function saveApplications(apps) {
    safeSet(KEY, apps);
}
export const STATUS_LABEL = {
    wishlist: "Wishlist",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
};
export const STATUS_ORDER = ["wishlist", "applied", "interview", "offer", "rejected"];
export const STATUS_TOKEN = {
    wishlist: "var(--col-wishlist)",
    applied: "var(--col-applied)",
    interview: "var(--col-interview)",
    offer: "var(--col-offer)",
    rejected: "var(--col-rejected)",
};
export function nextStatus(s) {
    const i = STATUS_ORDER.indexOf(s);
    if (i < 0 || i >= STATUS_ORDER.length - 1)
        return null;
    return STATUS_ORDER[i + 1];
}
