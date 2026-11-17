import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, Link as LinkIcon } from 'lucide-react';

export default function UrlInputForm({ onAnalyze, isLoading, initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Please enter a website URL (e.g. wikipedia.org or python.org).');
      return;
    }

    // Basic syntax check
    if (trimmed.includes(' ') || (!trimmed.includes('.') && !trimmed.startsWith('http'))) {
      setValidationError('Please enter a valid domain name (e.g. example.com).');
      return;
    }

    onAnalyze(trimmed);
  };

  const handleClear = () => {
    setUrl('');
    setValidationError('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-indigo-500/5 border border-slate-200/90 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          
          {/* URL Icon / Prefix */}
          <div className="flex items-center pl-3 pr-2 py-2 sm:py-0 text-slate-400">
            <LinkIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          </div>

          {/* Input field */}
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Enter any website URL (e.g. wikipedia.org, stripe.com, python.org)..."
            disabled={isLoading}
            className="w-full px-2 py-3 text-slate-800 placeholder-slate-400 bg-transparent text-base sm:text-lg focus:outline-none disabled:opacity-60"
            autoFocus
          />

          {/* Clear button if text entered */}
          {url && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mr-1 flex-shrink-0"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="mt-2 sm:mt-0 flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Website</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </>
            )}
          </button>
        </div>

        {/* Validation warning */}
        {validationError && (
          <p className="mt-2 text-sm text-rose-600 font-medium pl-3 animate-fadeIn">
            {validationError}
          </p>
        )}
      </form>

      {/* Helper text */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Auto-HTTPS prefixing
        </span>
        <span>•</span>
        <span>Extracts readable text & meta</span>
        <span>•</span>
        <span>Zero frontend API exposure</span>
      </div>
    </div>
  );
}
