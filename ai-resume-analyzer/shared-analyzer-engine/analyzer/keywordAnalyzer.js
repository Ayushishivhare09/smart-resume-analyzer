/**
 * Keyword Analyzer
 * Dynamically extracts and compares keywords between a resume and job description.
 */
import { normalizeText } from '../utils/normalizeText.js';
import { SKILL_DATABASE } from '../utils/skillDatabase.js';

export function matchKeywords(resumeText, jobDescText) {
  if (!jobDescText) {
    return { matchedKeywords: [], missingKeywords: [], keywordScore: 100 };
  }

  const resumeNormalized = normalizeText(resumeText);
  
  // Extract potential keywords from JD: words longer than 3 chars, not in skill DB, not a common stop word.
  const stopWords = new Set(['and', 'the', 'for', 'with', 'our', 'you', 'are', 'will', 'be', 'this', 'that', 'from', 'etc']);
  const jdWords = normalizeText(jobDescText).split(/\s+/).filter(w => 
    w.length > 2 && 
    !stopWords.has(w) &&
    !SKILL_DATABASE.some(s => s.toLowerCase() === w)
  );
  const uniqueJdKeywords = [...new Set(jdWords)];

  if (uniqueJdKeywords.length === 0) {
    return { matchedKeywords: [], missingKeywords: [], keywordScore: 100 };
  }
  
  // More robust matching: check if keyword exists as a whole word or significant substring
  const matchedKeywords = uniqueJdKeywords.filter(kw => {
    // Check for exact word match or if it's part of a phrase in the normalized text
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(resumeNormalized) || resumeNormalized.includes(kw);
  });
  const missingKeywords = uniqueJdKeywords.filter(kw => !matchedKeywords.includes(kw));
  
  const keywordScore = Math.round((matchedKeywords.length / uniqueJdKeywords.length) * 100);
  
  return { matchedKeywords, missingKeywords, keywordScore };
}
