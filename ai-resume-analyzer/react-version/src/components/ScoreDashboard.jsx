// ScoreDashboard Component
import React from 'react';

export function ScoreDashboard({ score, breakdown }) {
  return (
    <div className="score-dashboard">
      <div className="score-circle">{score}</div>
      <div className="breakdown">
        {breakdown && Object.entries(breakdown).map(([key, val]) => (
          <div key={key}>{key}: {(val * 100).toFixed(0)}%</div>
        ))}
      </div>
    </div>
  );
}
