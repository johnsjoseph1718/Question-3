import React from 'react';
import { Sparkles, Globe, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Navbar({ onReset, hasResults, isAnalyzing }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={hasResults && !isAnalyzing ? onReset : undefined}
          className={`flex items-center gap-3 ${hasResults && !isAnalyzing ? 'cursor-pointer group' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-slate-900 tracking-tight">WebInsight</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/60">
                AI Summarizer
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Intelligent Web Content Extraction</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SSRF Protected</span>
          </div>

          {hasResults && (
            <button
              onClick={onReset}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze Another</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
