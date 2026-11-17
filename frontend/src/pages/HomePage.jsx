import React from 'react';
import { Sparkles, Globe, Zap, ShieldCheck } from 'lucide-react';
import UrlInputForm from '../components/UrlInputForm';
import ExampleSuggestions from '../components/ExampleSuggestions';
import HowItWorks from '../components/HowItWorks';

export default function HomePage({ onAnalyze, isLoading }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center">
      
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 text-indigo-700 border border-indigo-200/70 shadow-sm mb-6 animate-fadeIn">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Next-Generation AI Website Intelligence</span>
      </div>

      {/* Hero Title & Tagline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Understand Any Website <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
            in Seconds.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Paste any public link. WebInsight extracts clean content, strips clutter, 
          and generates structured executive summaries with an interactive Q&A assistant.
        </p>
      </div>

      {/* Large URL Input Form */}
      <UrlInputForm onAnalyze={onAnalyze} isLoading={isLoading} />

      {/* Example Suggestions */}
      <ExampleSuggestions onSelectExample={(url) => onAnalyze(url)} disabled={isLoading} />

      {/* How It Works Section */}
      <HowItWorks />

    </div>
  );
}
