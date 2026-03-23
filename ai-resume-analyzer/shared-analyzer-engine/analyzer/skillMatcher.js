/**
 * Skill Matcher
 * Compares skills from a resume against a job description.
 */
import { extractSkillsFromText } from '../utils/extractSkills.js';

export function matchSkills(resumeText, jobDescText = '') {
  // This is now much more accurate due to the fix in extractSkills.js
  const resumeSkills = extractSkillsFromText(resumeText);
  const jdSkills = jobDescText ? extractSkillsFromText(jobDescText) : [];
  
  // If no job description is provided, score based on the number of skills found in the resume.
  if (jdSkills.length === 0) {
    const skillMatchPercentage = Math.min(100, resumeSkills.length * 10);
    return { matchedSkills: resumeSkills, missingSkills: [], skillMatchPercentage };
  }

  // Find skills from the JD that are also present in the resume's extracted skills.
  const matchedSkills = [...new Set(jdSkills.filter(jdSkill =>
    resumeSkills.some(resumeSkill => resumeSkill.toLowerCase() === jdSkill.toLowerCase())
  ))];

  // Missing skills are those from the JD that are not in our matched list.
  const missingSkills = [...new Set(jdSkills.filter(jdSkill => 
    !matchedSkills.some(matchedSkill => matchedSkill.toLowerCase() === jdSkill.toLowerCase())
  ))];
  
  // Correctly calculate the percentage based on the number of matched skills vs. required skills.
  const skillMatchPercentage = jdSkills.length > 0 
    ? Math.round((matchedSkills.length / jdSkills.length) * 100)
    : 100;
  
  return { matchedSkills, missingSkills, skillMatchPercentage: Math.min(100, skillMatchPercentage) };
}