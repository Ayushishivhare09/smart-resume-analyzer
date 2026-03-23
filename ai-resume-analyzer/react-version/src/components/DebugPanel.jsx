// DebugPanel Component
import React from 'react';

export function DebugPanel({ results }) {
  if (!results) return null;
  return (
    <div className="debug-panel">
      <h3>Debug Info</h3>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
