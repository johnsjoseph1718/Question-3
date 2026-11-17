import React from 'react';
import { Shield, FileText, Cpu, MessageSquareText } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Shield,
    title: 'URL & SSRF Protection',
    description: 'Validates target domains and blocks private, loopback, or cloud-internal addresses before fetching.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Content Extraction',
    description: 'BeautifulSoup4 purges navigation, scripts, ads, and footers to retain high-signal text.',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'AI Synthesis',
    description: 'An LLM organizes the webpage into 8 structured pillars: overview, purpose, features, audience, and more.',
  },
  {
    step: '04',
    icon: MessageSquareText,
    title: 'Ask & Export',
    description: 'Ask deep questions grounded strictly in the source text, copy to clipboard, or export to TXT.',
  },
];

export default function HowItWorks() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-200/80">
      <div className="text-center mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          How WebInsight Works
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 max-w-lg mx-auto">
          From any public web link to structured intelligence in four automated steps.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">{s.step}</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
