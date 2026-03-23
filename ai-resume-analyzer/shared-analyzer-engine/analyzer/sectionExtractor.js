/**
 * Section Extractor
 * Parses resume text to extract content from distinct sections.
 */

const SECTION_KEYWORDS = {
  experience: /^(?:experience|work experience|professional experience|work history|employment history|employment|career history|career summary|experience summary)$/i,
  projects: /^(?:projects|personal projects|key projects|academic projects|project history)$/i,
  skills: /^(?:skills|technical skills|technologies|tech stack|core competencies|competencies|skills & expertise|technical expertise)$/i,
  education: /^(?:education|academic background|academic history|qualifications|academic qualifications|degrees)$/i,
};

export function extractSections(resumeText) {
  const sections = {
    experience: '',
    projects: '',
    skills: '',
    education: '',
    fullText: resumeText,
  };
  const lines = resumeText.split('\n');
  let currentSection = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    let foundSection = false;
    for (const [sectionName, regex] of Object.entries(SECTION_KEYWORDS)) {
      if (regex.test(trimmedLine)) {
        currentSection = sectionName;
        foundSection = true;
        break;
      }
    }

    if (!foundSection && currentSection && trimmedLine) {
      sections[currentSection] += line + '\n';
    }
  }
  return sections;
}