/**
 * Education Analyzer
 * Scores the education section based on the presence of degree-related keywords.
 */
export const DEGREE_KEYWORDS = ['bachelor', 'b.tech', 'bsc', 'master', 'msc', 'phd', 'computer science', 'engineering', 'university', 'college'];

export function analyzeEducation(resumeText) {
  if (!resumeText) return { educationScore: 0 };
  const n = resumeText.toLowerCase();
  
  let degreeCount = 0;
  DEGREE_KEYWORDS.forEach(k => { if (n.includes(k)) degreeCount++; });
  
  const educationScore = degreeCount > 0 ? Math.min(15 + degreeCount * 17, 100) : 0;
  return { educationScore };
}
