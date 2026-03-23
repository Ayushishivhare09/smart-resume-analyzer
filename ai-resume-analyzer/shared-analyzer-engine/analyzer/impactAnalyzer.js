/**
 * Impact Analyzer
 * Detects quantified achievements and words demonstrating impact.
 */
const IMPACT_PATTERNS = [/\d+%/, /increased by/, /reduced by/, /grew by/, /saved \$/, /achieved/];

export function analyzeImpact(resumeText) {
    const text = resumeText.toLowerCase();
    let matchCount = 0;
    IMPACT_PATTERNS.forEach(pattern => {
        if (pattern.test(text)) matchCount++;
    });
    // Score is based on the number of impact-related patterns found.
    const impactScore = Math.min(100, 25 + matchCount * 15);
    return { impactScore };
}