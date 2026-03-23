/**
 * Score Calculator
 * Implements a weighted, context-aware scoring model.
 */
import { CORE_SKILLS, SUPPORTING_TOOLS, BONUS_SKILLS } from '../utils/skillDatabase.js';
import { extractSkillsFromText } from '../utils/extractSkills.js';

function calculateCategoryScore(matchedSkills, jdSkills, category) {
  const relevantJdSkills = jdSkills.filter(s => category.includes(s));
  if (relevantJdSkills.length === 0) return 1; // Full score if not required

  const matchedCategorySkills = matchedSkills.filter(s => relevantJdSkills.includes(s));
  return matchedCategorySkills.length / relevantJdSkills.length;
}

export function calculateATSScore(analysisResults) {
  const { matchedSkills, jdSkills, extractedSections } = analysisResults;

  // 1. Calculate weighted score for skill categories (Core: 40%, Tools: 20%, Bonus: 10%)
  const coreSkillScore = calculateCategoryScore(matchedSkills, jdSkills, CORE_SKILLS) * 40;
  const toolScore = calculateCategoryScore(matchedSkills, jdSkills, SUPPORTING_TOOLS) * 20;
  const bonusSkillScore = calculateCategoryScore(matchedSkills, jdSkills, BONUS_SKILLS) * 10;

  // 2. Calculate context-aware project experience score (30%)
  let projectExperienceScore = 0;
  const experienceAndProjectsText = (extractedSections.experience || '') + (extractedSections.projects || '');
  const skillsInExperience = extractSkillsFromText(experienceAndProjectsText);
  
  // Find which of the required core skills are mentioned in the experience/projects sections
  const requiredCoreSkills = jdSkills.filter(s => CORE_SKILLS.includes(s));
  if (requiredCoreSkills.length > 0) {
    const coreSkillsWithExperience = requiredCoreSkills.filter(s => skillsInExperience.includes(s));
    projectExperienceScore = (coreSkillsWithExperience.length / requiredCoreSkills.length) * 30;
  } else {
    // If no core skills are in JD, give partial credit if experience section exists
    projectExperienceScore = experienceAndProjectsText.length > 100 ? 30 : 10;
  }

  // 3. Add other minor scores from original analyzers
  const impactSubScore = (analysisResults.impactScore / 100) * 5; // Max 5 points
  const educationSubScore = (analysisResults.educationScore / 100) * 5; // Max 5 points

  // 4. Sum all scores
  const finalScore =
    coreSkillScore +
    toolScore +
    bonusSkillScore +
    projectExperienceScore +
    impactSubScore +
    educationSubScore;

  return {
    atsScore: Math.min(100, Math.round(finalScore)),
    scoreBreakdown: {
      coreSkills: coreSkillScore,
      supportingTools: toolScore,
      projectExperience: projectExperienceScore,
    }
  };
}