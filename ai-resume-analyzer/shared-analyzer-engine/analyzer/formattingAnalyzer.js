/**
 * Formatting Analyzer
 * Checks for the presence of key resume sections.
 */
const SECTIONS = ['summary', 'profile', 'experience', 'education', 'skills', 'projects'];

export function analyzeFormatting(resumeText) {
    const text = resumeText.toLowerCase();
    const detectedSections = SECTIONS.filter(s => text.includes(s));
    const missingSections = ['experience', 'education', 'skills'].filter(s => !detectedSections.includes(s));
    
    // Score is based on the number of essential sections found.
    const formattingScore = Math.min(100, 30 + (detectedSections.length * 12));
    return { detectedSections, missingSections, formattingScore };
}