/**
 * Analyzer Service
 * Acts as a bridge between the React components and the shared analysis engine.
 */
export async function analyzeResume(resume, jobDesc = '') {
  // Dynamically import the main entry point of the shared engine.
  const module = await import('../../../shared-analyzer-engine/index.js');
  return module.analyzeResume(resume, jobDesc);
}
