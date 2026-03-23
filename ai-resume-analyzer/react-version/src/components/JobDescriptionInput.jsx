// JobDescriptionInput Component
import React from 'react';

export function JobDescriptionInput({ value, onChange }) {
  return (
    <textarea 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder="Paste job description..."
    />
  );
}
