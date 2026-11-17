import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

const EXAMPLES = [
  {
    name: 'Wikipedia AI',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    category: 'Knowledge',
    tag: 'Long Form',
  },
  {
    name: 'Python.org',
    url: 'https://www.python.org',
    category: 'Developer',
    tag: 'Software',
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    category: 'Tech Platform',
    tag: 'SaaS',
  },
  {
    name: 'Stripe',
    url: 'https://stripe.com',
    category: 'Fintech',
    tag: 'Enterprise',
  },
  {
    name: 'Cloudflare',
    url: 'https://www.cloudflare.com',
    category: 'Cloud & Security',
    tag: 'Infrastructure',
  },
  {
    name: 'BBC News',
    url: 'https://www.bbc.com',
    category: 'Media',
    tag: 'News',
  },
];

export default function ExampleSuggestions({ onSelectExample, disabled }) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Try an example website:</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {EXAMPLES.map((example) => (
          <button
            key={example.url}
            type="button"
            disabled={disabled}
            onClick={() => onSelectExample(example.url)}
            className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50/90 border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="min-w-0 pr-2">
              <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                {example.name}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {example.category}
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 px-2 py-0.5 rounded-full transition-colors flex-shrink-0">
              {example.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
