import React from 'react';
import { AlertCircle } from 'lucide-react';

const formatRelativeTime = (dateString) => {
  if (!dateString) return { text: 'Never', color: 'red', diffDays: Infinity };
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let text = '';
  if (diffDays === 0) text = 'Today';
  else if (diffDays === 1) text = '1 day ago';
  else text = `${diffDays} days ago`;

  let color = 'amber';
  if (diffDays <= 1) color = 'green';
  else if (diffDays > 5) color = 'red';

  return { text, color, diffDays };
};

const LastTouchedBadge = ({ date, variant = 'full' }) => {
  const { text, color, diffDays } = formatRelativeTime(date);
  
  let colorClasses = '';
  if (color === 'red') colorClasses = 'text-red-400 bg-red-500/10 border border-red-500/20';
  else if (color === 'green') colorClasses = 'text-green-400 bg-green-500/10 border border-green-500/20';
  else colorClasses = 'text-amber-400 bg-amber-500/10 border border-amber-500/20';

  const shortText = text.replace(' days ago', 'd ago').replace(' day ago', 'd ago');

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${colorClasses}`}>
      {color === 'red' && diffDays > 5 && <AlertCircle size={12} />}
      {variant === 'short' ? shortText : text}
    </span>
  );
};

export default LastTouchedBadge;
