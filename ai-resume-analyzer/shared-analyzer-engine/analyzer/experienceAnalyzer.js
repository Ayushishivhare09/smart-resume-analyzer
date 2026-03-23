/**
 * Experience Analyzer
 * Detects action verbs to score the quality of the experience section.
 */
const ACTION_VERBS = [
  'developed', 'built', 'implemented', 'designed', 'created', 'led', 'optimized', 
  'managed', 'achieved', 'delivered', 'architected', 'spearheaded', 'drove', 'engineered'
];

export function analyzeExperience(resumeText) {
    const text = resumeText.toLowerCase();
    let actionVerbCount = 0;
    ACTION_VERBS.forEach(verb => {
        if (text.includes(verb)) actionVerbCount++;
    });
    // Score is based on the number of unique action verbs found.
    const experienceScore = Math.min(100, actionVerbCount * 8);
    return { experienceScore };
}