import React from 'react';
import { Tag } from 'lucide-react';

export default function KeywordsCloud({ keywords = [] }) {
  if (!keywords || keywords.length === 0) {
    return <p className="text-sm text-slate-500 italic">No significant keywords identified.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {keywords.map((kw, idx) => (
        <span
          key={`${kw}-${idx}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 transition-colors cursor-default"
        >
          <Tag className="w-3 h-3 text-slate-400" />
          <span>{kw}</span>
        </span>
      ))}
    </div>
  );
}
