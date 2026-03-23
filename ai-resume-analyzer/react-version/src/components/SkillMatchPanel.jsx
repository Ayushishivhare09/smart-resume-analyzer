// SkillMatchPanel Component
import React from 'react';

export function SkillMatchPanel({ title = "Skills", matched, missing }) {
  return (
    <div className="skill-panel card">
      <h4>{title}</h4>
      <h5>Matched</h5>
      {matched && matched.length > 0 ? (
        <ul className="matched-list">{matched.map(s => <li key={s}>{s}</li>)}</ul>
      ) : (
        <p className="empty-list-message">None found.</p>
      )}
      <h5>Missing</h5>
      {missing && missing.length > 0 ? (
        <ul className="missing-list">{missing.map(s => <li key={s}>{s}</li>)}</ul>
      ) : (
        <p className="empty-list-message">None.</p>
      )}
    </div>
  );
}
