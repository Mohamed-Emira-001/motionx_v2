import React from 'react';
import { Key, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const EnvironmentStatus: React.FC = () => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const envs = [
    {
      group: 'Supabase Database & Auth (Required)',
      items: [
        { name: 'VITE_SUPABASE_URL', desc: 'Supabase project HTTPS API URL', sample: 'https://xyzcompany.supabase.co' },
        { name: 'VITE_SUPABASE_ANON_KEY', desc: 'Public client key with RLS enforcement', sample: 'eyJhbGciOiJIUzI1Ni...' },
        { name: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Server-side key for administrative tasks & webhooks', sample: 'eyJhbGciOiJIUzI1Ni...' },
      ],
    },
    {
      group: 'Email & Invoicing Delivery',
      items: [
        { name: 'RESEND_API_KEY', desc: 'Resend transactional email delivery API token', sample: 're_...' },
        { name: 'RESEND_FROM_EMAIL', desc: 'Verified sender domain email address', sample: 'MotionX Billing <billing@motionx.health>' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Environment Variables Specification</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            /.env.example
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
          MotionX uses real Supabase tables and authentication. The payment layer is provider-agnostic, with payment statuses stored directly in the database.
        </p>

        <div className="space-y-4">
          {envs.map((group) => (
            <div key={group.group} className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{group.group}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {group.items.map((item) => (
                  <div key={item.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs flex flex-col justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-800 text-[11px] block">{item.name}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{item.desc}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">{item.sample}</span>
                      <button
                        onClick={() => handleCopy(item.name, `${item.name}="${item.sample}"`)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Copy variable template"
                      >
                        {copiedKey === item.name ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
