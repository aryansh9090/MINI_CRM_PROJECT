import React from 'react';

const ScoreBadge = ({ score = 0 }) => {
  if (score >= 70) {
    return (
      <span 
        className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 inline-flex items-center justify-center whitespace-nowrap"
        title="High Score"
      >
        ★ {score}
      </span>
    );
  }
  if (score >= 40) {
    return (
      <span 
        className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center justify-center whitespace-nowrap"
        title="Medium Score"
      >
        ★ {score}
      </span>
    );
  }
  return (
    <span 
      className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center justify-center whitespace-nowrap"
      title="Low Score"
    >
      ★ {score}
    </span>
  );
};

export default ScoreBadge;
