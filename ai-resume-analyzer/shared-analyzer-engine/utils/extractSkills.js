/**
 * Skill Extraction Utility
 * Extracts skills from text based on the skill database.
 */
import { SKILL_DATABASE, normalizeSkillName, SKILL_ALIASES } from './skillDatabase.js';
import { normalizeText } from './normalizeText.js';

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export function extractSkillsFromText(text) {
  const normText = normalizeText(text);
  const found = new Set();

  // Create a map from canonical skill to all its aliases (including itself)
  const skillMap = {};
  SKILL_DATABASE.forEach(skill => {
    skillMap[skill] = [skill];
  });
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    if (skillMap[canonical]) {
      skillMap[canonical].push(alias);
    }
  }

  // Now iterate through the map and test all aliases
  for (const [canonicalSkill, aliases] of Object.entries(skillMap)) {
    // Create a regex that matches any of the aliases as a whole word
    const regexPattern = [...new Set(aliases.map(a => a.toLowerCase()))].map(a => escapeRegExp(a)).join('|');
    const regex = new RegExp(`\\b(${regexPattern})\\b`, 'i');

    if (regex.test(normText)) {
      found.add(canonicalSkill); // Add the canonical name
    }
  }

  return [...found];
}
