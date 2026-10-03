import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, CheckCircle2, ExternalLink } from 'lucide-react';

export const SqlExporter: React.FC<{ sqlContent: string }> = ({ sqlContent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'motionx-supabase-schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">Supabase PostgreSQL Schema Script</h3>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
              Ready for Supabase SQL Editor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete script includes 12 tables, custom enums, performance indexes, automated triggers, and 24 Row Level Security (RLS) policies.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download .sql
          </button>
        </div>
      </div>

      {/* Supabase Execution Guide */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs">
        <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          How to Execute in Your Supabase Project
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-emerald-900 leading-relaxed">
          <li>
            Open your project in the{' '}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline hover:text-emerald-700 inline-flex items-center gap-0.5"
            >
              Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>Navigate to the <strong>SQL Editor</strong> in the left sidebar menu</li>
          <li>Click <strong>New Query</strong> and paste the copied SQL schema script</li>
          <li>Click <strong>Run</strong> (or press Cmd+Enter / Ctrl+Enter) to execute the migration</li>
          <li>All 12 tables, auth triggers, and RLS policies will be instantly generated and secured</li>
        </ol>
      </div>

      {/* SQL Code Box */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400 text-[11px]">/supabase/schema.sql</span>
          <span>PostgreSQL • 450+ Lines</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {sqlContent}
        </pre>
      </div>
    </div>
  );
};
