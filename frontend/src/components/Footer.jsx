import React from 'react';
import { Globe, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-8 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            W
          </div>
          <span className="font-semibold text-slate-800">WebInsight</span>
          <span>— Understand Any Website in Seconds.</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            SSRF & Bot Protected
          </span>
          <span>•</span>
          <span>Built with Flask & React</span>
        </div>
      </div>
    </footer>
  );
}
