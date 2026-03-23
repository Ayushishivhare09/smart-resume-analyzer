/**
 * Main Analyzer Entry Point
 * Exports the primary analyzeResume function using ES Modules.
 */
import { matchKeywords } from './analyzer/keywordAnalyzer.js';
import { matchSkills } from './analyzer/skillMatcher.js';
import { analyzeExperience } from './analyzer/experienceAnalyzer.js';
import { analyzeEducation } from './analyzer/educationAnalyzer.js';
import { analyzeFormatting } from './analyzer/formattingAnalyzer.js';
import { analyzeImpact } from './analyzer/impactAnalyzer.js';
import { calculateATSScore } from './analyzer/scoreCalculator.js';
import { generateSuggestions } from './suggestions/suggestionEngine.js';
import { extractSections } from './analyzer/sectionExtractor.js';
import { extractSkillsFromText } from './utils/extractSkills.js';

export function analyzeResume(resumeText, jobDescText = '') {
  // 1. Perform initial text processing and sectioning
  const extractedSections = extractSections(resumeText);
  const jdSkills = extractSkillsFromText(jobDescText);

  // 2. Run all individual analyzers on the full text
  const keywordRes = matchKeywords(resumeText, jobDescText);
  const skillRes = matchSkills(resumeText, jobDescText);
  const expRes = analyzeExperience(resumeText);
  const eduRes = analyzeEducation(resumeText);
  const formatRes = analyzeFormatting(resumeText);
  const impactRes = analyzeImpact(resumeText);
  
  // 3. Create a comprehensive results object for the new score calculator
  const combinedResults = {
    ...keywordRes,
    ...skillRes,
    ...expRes,
    ...eduRes,
    ...formatRes,
    ...impactRes,
    extractedSections, // Add the structured sections
    jdSkills, // Add the list of skills required by the job
  };
  
  // 4. Calculate the new, weighted ATS score
  const { atsScore, scoreBreakdown } = calculateATSScore(combinedResults);
  combinedResults.atsScore = atsScore;
  combinedResults.scoreBreakdown = scoreBreakdown;
  
  // 5. Generate suggestions based on the new, more accurate results
  const suggestions = generateSuggestions(combinedResults);
  
  // 6. Return the final, comprehensive report
  return { ...combinedResults, suggestions };
}