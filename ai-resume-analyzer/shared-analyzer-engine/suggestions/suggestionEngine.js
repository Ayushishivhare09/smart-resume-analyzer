/**
 * Suggestion Engine
 * Generates actionable feedback based on analysis results.
 */
export function generateSuggestions(analysisResults) {
  const suggestions = [];
  
  if (analysisResults.missingSkills && analysisResults.missingSkills.length > 0) {
    suggestions.push({ 
      icon: '💡', 
      title: 'Add Missing Skills', 
      text: `Your resume is missing key skills from the job description. Consider adding: ${analysisResults.missingSkills.slice(0, 5).join(', ')}.`
    });
  }

  if (analysisResults.keywordScore < 70 && analysisResults.missingKeywords?.length > 0) {
    suggestions.push({ 
      icon: '🎯', 
      title: 'Keyword Optimization', 
      text: `Boost your match by including important keywords like: ${analysisResults.missingKeywords.slice(0, 5).join(', ')}.`
    });
  }

  if (analysisResults.experienceScore < 60) {
    suggestions.push({ 
      icon: '💪', 
      title: 'Strengthen Experience Section', 
      text: 'Use more strong action verbs (e.g., developed, managed, optimized) to describe your accomplishments.' 
    });
  }

  if (analysisResults.scoreBreakdown && analysisResults.scoreBreakdown.projectExperience < 20) {
    suggestions.push({
      icon: '🛠️',
      title: 'Detail Your Experience',
      text: 'Your resume needs to better connect your skills to your work. For each role or project, explicitly mention the technologies you used (e.g., "Developed a web app using React and Node.js").'
    });
  }

  if (analysisResults.impactScore < 50) {
    suggestions.push({ 
      icon: '📈', 
      title: 'Quantify Your Achievements', 
      text: 'Add measurable results and metrics (e.g., "increased by 20%", "saved $10k") to demonstrate your impact.' 
    });
  }

  if (analysisResults.missingSections && analysisResults.missingSections.length > 0) {
    suggestions.push({ 
      icon: '📝', 
      title: 'Improve Resume Structure', 
      text: `Your resume could be missing key sections like: ${analysisResults.missingSections.join(', ')}.` 
    });
  }
  
  if (suggestions.length === 0 && analysisResults.atsScore > 80) {
    suggestions.push({ icon: '🎉', title: 'Great Job!', text: 'Your resume looks strong and well-optimized for this role.' });
  }
  
  // Add a final, high-level "Pro Tip" to guide the user's next steps.
  let proTip;
  if (analysisResults.atsScore < 60) {
    proTip = {
      icon: '⭐',
      title: 'Pro Tip: Focus on Fundamentals',
      text: 'Your resume isn\'t closely aligned with the job description. To get past the first screening, you must heavily tailor your resume with the exact skills and keywords mentioned in the job posting. This is the most critical step.'
    };
  } else if (analysisResults.atsScore < 85) {
    proTip = {
      icon: '⭐',
      title: 'Pro Tip: Quantify and Refine',
      text: 'You have a good foundation. To move from "good" to "great", focus on quantifying your achievements. Instead of saying you "managed a team", say you "managed a team of 5 engineers to deliver a project 3 weeks ahead of schedule". Numbers prove your impact.'
    };
  } else {
    proTip = {
      icon: '⭐',
      title: 'Pro Tip: Prepare for the Human Review',
      text: 'Your resume is well-optimized for automated systems. Now, ensure it captivates a human reader in 6 seconds. Place your most impactful achievement or summary at the top. Proofread meticulously for any typos and ensure the visual layout is clean and professional.'
    };
  }
  suggestions.push(proTip);
  
  return suggestions;
}
