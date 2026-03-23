// ResumeUploader Component
import React from 'react';

export function ResumeUploader({ onUpload }) {
  return (
    <div>
      <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={e => onUpload(e.target.files[0])} />
    </div>
  );
}
