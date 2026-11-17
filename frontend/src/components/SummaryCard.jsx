import React from 'react';

export default function SummaryCard({
  icon: Icon,
  title,
  children,
  badge,
  className = '',
  accent = 'indigo',
}) {
  const accentColors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
  };

  const badgeStyle = accentColors[accent] || accentColors.indigo;

  return (
    <div className={`p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${badgeStyle}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className="font-bold text-slate-900 text-base tracking-tight">{title}</h3>
        </div>
        {badge && (
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
            {badge}
          </span>
        )}
      </div>
      <div className="text-sm text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
