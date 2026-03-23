// SuggestionPanel Component
import React from 'react';

export function SuggestionPanel({ suggestions }) {
  return (
    <div className="suggestion-panel">
      <h4>Suggestions</h4>
      {suggestions?.map((s, i) => (
        <div key={i} className="suggestion">
          <span>{s.icon}</span>
          <strong>{s.title}</strong>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}
