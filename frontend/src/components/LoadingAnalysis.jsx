import React, { useEffect, useState } from 'react';
import { Sparkles, Globe, Cpu, CheckCircle2 } from 'lucide-react';

const PROGRESS_STAGES = [
  { label: 'Resolving DNS & verifying SSRF safety...', duration: 1500 },
  { label: 'Fetching HTML & stripping navigation, ads, and footers...', duration: 2500 },
  { label: 'Extracting key paragraphs, titles & metadata...', duration: 2000 },
  { label: 'Synthesizing 8-pillar AI summary & preparing Q&A session...', duration: 6000 },
];

export default function LoadingAnalysis({ targetUrl }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    let timer;
    if (currentStageIndex < PROGRESS_STAGES.length - 1) {
      timer = setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
      }, PROGRESS_STAGES[currentStageIndex].duration);
    }
    return () => clearTimeout(timer);
  }, [currentStageIndex]);

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-indigo-500/5 text-center">
      {/* Animated icon */}
      <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-ping opacity-75" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Cpu className="w-8 h-8 animate-pulse text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
        Analyzing Website
      </h3>
      <p className="text-sm font-mono text-indigo-600 bg-indigo-50/70 border border-indigo-100 rounded-lg px-3 py-1.5 inline-block max-w-md truncate mb-6">
        {targetUrl}
      </p>

      {/* Progress Steps list */}
      <div className="space-y-3 text-left max-w-sm mx-auto">
        {PROGRESS_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          return (
            <div
              key={stage.label}
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                isDone
                  ? 'text-slate-700 opacity-90'
                  : isCurrent
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-300 opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-200 flex-shrink-0" />
              )}
              <span className="truncate">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
        AI is processing real-time web content. This usually takes 3 to 10 seconds.
      </div>
    </div>
  );
}
