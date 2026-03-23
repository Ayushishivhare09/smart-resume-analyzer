// React App Component
import React from 'react';
// Import the service function to keep the component clean.
import { analyzeResume as analyzeResumeService } from './services/analyzerService.js';
import { ScoreDashboard } from './components/ScoreDashboard.js';
import { SuggestionPanel } from './components/SuggestionPanel.js';
import { SkillMatchPanel } from './components/SkillMatchPanel.js';
import { JobDescriptionInput } from './components/JobDescriptionInput.js';
import { DebugPanel } from './components/DebugPanel.js';
import { ResumeUploader } from './components/ResumeUploader.js';
import { extractTextFromPDF } from './utils/pdfUtils.js';

function App() {
  const [resume, setResume] = React.useState('');
  const [jobDesc, setJobDesc] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleAnalyze = async () => {
    if (!resume) {
      alert('Please enter resume text to analyze.');
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      // Call the analysis engine via the service
      const result = await analyzeResumeService(resume, jobDesc);
      setResults(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("An error occurred during analysis. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = (file) => {
    if (!file) return;

    const allowedTypes = ['txt', 'pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      alert(`Unsupported file type. Please upload one of the following: .txt, .pdf, .doc, .docx`);
      return;
    }

    if (fileExtension === 'pdf') {
      extractTextFromPDF(file)
        .then(text => setResume(text))
        .catch(err => {
          console.error("PDF Parsing Error:", err);
          alert("Failed to parse PDF. Please copy/paste the text manually.");
        });
      return;
    }

    // For complex formats like DOC/DOCX, reading as text can be messy. Warn the user.
    if (['doc', 'docx'].includes(fileExtension)) {
      alert('Note: For best results with DOC/DOCX files, copy-pasting the text directly is recommended. The automatic text extraction may not be perfect.');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setResume(e.target.result);
    };
    reader.onerror = () => {
      alert('Error reading file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Resume Analyzer</h1>
        <p>Get an instant analysis of your resume against a job description.</p>
      </header>
      
      <main>
        <div className="input-grid">
          <div className="textarea-container">
            <ResumeUploader onUpload={handleResumeUpload} />
            <textarea 
              value={resume} 
              onChange={e => setResume(e.target.value)} 
              placeholder="Paste your resume here or upload a file..." 
              rows="20"
            />
          </div>
          <JobDescriptionInput value={jobDesc} onChange={setJobDesc} />
        </div>
        <button 
          onClick={handleAnalyze} 
          disabled={isLoading}
          className="analyze-button"
        >
          {isLoading ? 'Analyzing...' : '🚀 Analyze'}
        </button>
        
        {results && (
          <div className="results-container">
            <div className="card">
              <ScoreDashboard score={results.atsScore} breakdown={
                results.scoreBreakdown ? {
                  'Core Skills (40%)': results.scoreBreakdown.coreSkills / 40,
                  'Tooling (20%)': results.scoreBreakdown.supportingTools / 20,
                  'Project Exp (30%)': results.scoreBreakdown.projectExperience / 30,
                } : {
                  'Keywords': (results.keywordScore || 0) / 100,
                  'Skills': (results.skillMatchPercentage || 0) / 100,
                }
              } />
            </div>

            <div className="card">
              <SuggestionPanel suggestions={results.suggestions} />
            </div>

            <div className="input-grid">
              <SkillMatchPanel title="Skills" matched={results.matchedSkills} missing={results.missingSkills} />
              <SkillMatchPanel title="Keywords" matched={results.matchedKeywords} missing={results.missingKeywords} />
            </div>

            <div className="card">
              <DebugPanel results={results} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
