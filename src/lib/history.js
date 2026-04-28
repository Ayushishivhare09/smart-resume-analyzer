import { safeGet, safeSet } from "./storage";
const KEY = "resumeiq-history";
const CAP = 50;
export function listHistory() {
    return safeGet(KEY, []);
}
export function saveHistory(resumeText, jobDescription, result) {
    const id = String(Date.now());
    const entry = {
        id,
        date: new Date().toISOString(),
        resumeText,
        jobDescription,
        jobTitle: result.jobTitle,
        wordCount: result.wordCount,
        score: result.score,
        subScores: result.subScores,
        keywordsFound: result.keywordsFound,
        keywordsMissing: result.keywordsMissing,
        suggestions: result.suggestions,
        coverLetter: result.coverLetter,
        interviewQuestions: result.interviewQuestions,
    };
    const current = listHistory();
    let evicted = false;
    let next = [entry, ...current];
    if (next.length > CAP) {
        next = next.slice(0, CAP);
        evicted = true;
    }
    const res = safeSet(KEY, next);
    if (!res.ok)
        return { outcome: "error" };
    return { outcome: evicted ? "evicted" : "ok", entry };
}
export function deleteHistory(id) {
    const next = listHistory().filter((e) => e.id !== id);
    safeSet(KEY, next);
}
export function clearHistory() {
    safeSet(KEY, []);
}
