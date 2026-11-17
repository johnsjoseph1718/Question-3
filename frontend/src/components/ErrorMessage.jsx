import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ErrorMessage({ error, onRetry, onReset }) {
  const isSecurity = error?.toLowerCase().includes('ssrf') || error?.toLowerCase().includes('restricted');
  const isBlocked = error?.toLowerCase().includes('403') || error?.toLowerCase().includes('blocked');

  return (
    <div className="w-full max-w-xl mx-auto my-10 p-6 rounded-3xl bg-rose-50/60 border border-rose-200 shadow-sm text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
        {isSecurity ? (
          <ShieldAlert className="w-6 h-6" />
        ) : (
          <AlertCircle className="w-6 h-6" />
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5">
        {isSecurity
          ? 'Security Restriction'
          : isBlocked
          ? 'Website Access Restricted'
          : 'Unable to Analyze Website'}
      </h3>

      <p className="text-sm text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
        {error || 'An unexpected error occurred while communicating with the server.'}
      </p>

      {/* Troubleshooting hints */}
      <div className="text-xs text-slate-500 bg-white/80 p-3.5 rounded-xl border border-rose-100 mb-6 text-left space-y-1">
        <span className="font-semibold text-slate-700 block mb-1">Troubleshooting Tips:</span>
        {isBlocked ? (
          <>
            <div>• This website is guarded by anti-bot verification or Cloudflare protection.</div>
            <div>• Try analyzing another publicly open domain or a Wikipedia article.</div>
          </>
        ) : isSecurity ? (
          <>
            <div>• Private, loopback, or cloud metadata IP addresses are strictly blocked.</div>
            <div>• Ensure you are entering a public website URL.</div>
          </>
        ) : (
          <>
            <div>• Check that the domain name is spelled correctly and is currently online.</div>
            <div>• Websites requiring user logins or full client-side JavaScript rendering may not return static content.</div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Enter Another URL</span>
        </button>
      </div>
    </div>
  );
}
