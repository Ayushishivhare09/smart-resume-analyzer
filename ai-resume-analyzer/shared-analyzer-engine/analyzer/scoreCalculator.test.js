/**
 * Unit Tests for Score Calculator
 * verifiable via Node.js: node shared-analyzer-engine/analyzer/scoreCalculator.test.js
 */

import { calculateATSScore } from './scoreCalculator.js';

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
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected > ${expected} but got ${actual}`);
      }
    },
    toEqual: (expected) => { // Shallow object comparison
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
         throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
      }
    }
  };
}

// --- TESTS ---

describe('calculateATSScore Logic', () => {

  it('should return a high score for a perfect match', () => {
    const mockData = {
      matchedSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'REST API'],
      jdSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'REST API'],
      extractedSections: {
        experience: 'I built a web app using React and JavaScript. Used Git for version control.',
        projects: ''
      },
      impactScore: 100,
      educationScore: 100
    };

    const result = calculateATSScore(mockData);
    
    // Core(40) + Tools(20) + Bonus(10) + Exp(30) + Impact(5) + Edu(5) = 110 (capped at 100)
    expect(result.atsScore).toBe(100);
  });

  it('should penalize missing core skills', () => {
    const mockData = {
      matchedSkills: ['HTML', 'CSS'], // Missing JS, React
      jdSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
      extractedSections: { experience: 'I wrote some HTML code.' },
      impactScore: 50,
      educationScore: 50
    };

    const result = calculateATSScore(mockData);
    
    // Core: 2/4 matched = 50% of 40pts = 20pts
    // Tools: 100% (none required) = 20pts
    // Bonus: 100% (none required) = 10pts
    // Exp: Low match = ~0-10pts
    // Impact/Edu: ~5pts
    // Total approx: 55-65
    expect(result.atsScore).toBeGreaterThan(0);
    if (result.atsScore > 70) throw new Error(`Score ${result.atsScore} is too high for missing core skills`);
  });

  it('should score lower if skills are listed but not found in experience context', () => {
    const mockData = {
      matchedSkills: ['React', 'JavaScript'],
      jdSkills: ['React', 'JavaScript'],
      extractedSections: { 
        experience: 'I worked as a manager. I attended meetings.', // No mention of React/JS here
        projects: ''
      },
      impactScore: 50,
      educationScore: 50
    };

    const result = calculateATSScore(mockData);
    
    // Core: 40 (perfect match list)
    // Tools: 20
    // Bonus: 10
    // Experience: 0 (skills not found in context)
    // Sub-scores: ~5
    // Total: ~75
    
    // Expected breakdown: projectExperience should be 0
    expect(result.scoreBreakdown.projectExperience).toBe(0);
    expect(result.atsScore).toBe(75);
  });
});