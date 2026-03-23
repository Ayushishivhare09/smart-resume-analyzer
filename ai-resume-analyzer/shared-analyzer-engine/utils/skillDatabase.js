/**
 * Skill Database for ATS Resume Analyzer
 * Categorizes skills for weighted scoring and provides aliases for semantic matching.
 */

// Define skill categories for weighted scoring
export const CORE_SKILLS = ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'];
export const SUPPORTING_TOOLS = ['Git', 'Bootstrap', 'Tailwind', 'Docker', 'Jira', 'Agile', 'Scrum'];
export const BONUS_SKILLS = ['REST API', 'GraphQL', 'AWS', 'Next.js', 'Node.js', 'Python', 'Performance Optimization'];

// Combine all skills into a single database for extraction
export const SKILL_DATABASE = [
  ...CORE_SKILLS,
  ...SUPPORTING_TOOLS,
  ...BONUS_SKILLS,
  // Add other common skills that might not be in categories but are good to recognize
  'MongoDB', 'PostgreSQL', 'MySQL', 'Linux', 'Kubernetes', 'Azure', 'GCP', 'Firebase'
];

export const SKILL_ALIASES = {
  'react': 'React', 'reactjs': 'React',
  'node': 'Node.js', 'nodejs': 'Node.js',
  'javascript': 'JavaScript', 'js': 'JavaScript',
  'typescript': 'TypeScript', 'ts': 'TypeScript',
  'next': 'Next.js',
  'aws': 'AWS',
  'rest': 'REST API', 'restful api': 'REST API',
  'tailwind css': 'Tailwind'
};

export function normalizeSkillName(skill) { 
  if (!skill) return '';
  return SKILL_ALIASES[skill.toLowerCase()] || CORE_SKILLS.find(s => s.toLowerCase() === skill.toLowerCase()) || SUPPORTING_TOOLS.find(s => s.toLowerCase() === skill.toLowerCase()) || BONUS_SKILLS.find(s => s.toLowerCase() === skill.toLowerCase()) || skill;
}
