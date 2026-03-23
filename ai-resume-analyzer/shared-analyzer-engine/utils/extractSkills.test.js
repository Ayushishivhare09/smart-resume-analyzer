/**
 * Unit Tests for extractSkills
 * To run: node shared-analyzer-engine/utils/extractSkills.test.js
 */

import { extractSkillsFromText } from './extractSkills.js';

// Simple test runner
function describe(description, fn) {
  console.log(`\n📦 ${description}`);
  fn();
}

function it(description, fn) {
  try {
    fn();
    console.log(`  ✅ ${description}`);
  } catch (error) {
    console.error(`  ❌ ${description}`);
    console.error(`     Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    // Custom matcher for arrays that ignores order
    toEqualUnordered: (expected) => {
      const sortedActual = [...actual].sort();
      const sortedExpected = [...expected].sort();
      if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
         throw new Error(`Expected ${JSON.stringify(sortedExpected)} but got ${JSON.stringify(sortedActual)}`);
      }
    }
  };
}

// --- TESTS ---

describe('extractSkillsFromText Logic', () => {

  it('should identify a skill by its alias "JS"', () => {
    const text = 'I have 5 years of experience with JS.';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered(['JavaScript']);
  });

  it('should identify skills by aliases "React.js" and "Nodejs"', () => {
    const text = 'Developed a web app using React.js and Nodejs.';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered(['React', 'Node.js']);
  });

  it('should identify a skill by its alias "ts"', () => {
    const text = 'The project was written in ts.';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered(['TypeScript']);
  });

  it('should handle multiple aliases and canonical names', () => {
    const text = 'My skills include JavaScript, react, and python.';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered(['JavaScript', 'React', 'Python']);
  });

  it('should not match partial words (e.g., "pajamas" for "js")', () => {
    const text = 'This is a test for the word "pajamas".';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered([]);
  });
  
  it('should handle case-insensitivity for both skills and aliases', () => {
    const text = 'I know REACT and JAVASCRIPT, plus some TS.';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered(['React', 'JavaScript', 'TypeScript']);
  });

  it('should return an empty array for text with no skills', () => {
    const text = 'I am a project manager with great communication.';
    const skills = extractSkillsFromText(text);
    expect(skills).toEqualUnordered([]);
  });
});