import React, { useState } from 'react';
import { Layers, ArrowRight, UserCheck, Stethoscope, HeartHandshake, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';

export const ErdVisualizer: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('profiles');

  const entities = [
    {
      id: 'auth_users',
      label: 'auth.users',
      category: 'Supabase Auth',
      color: 'bg-emerald-600 text-white',
      badge: 'Supabase Built-in',
      desc: 'Base authentication user records containing email, encrypted password, and session tokens.',
      relations: ['profiles (1:1 cascade)'],
    },
    {
      id: 'profiles',
      label: 'public.profiles',
      category: 'Core Identity',
      color: 'bg-blue-600 text-white',
      badge: 'Central Hub',
      desc: 'Linked to auth.users via trigger. Holds user role (client, specialist, admin) and contact details.',
      relations: [
        'specialist_profiles (1:1)',
        'client_profiles (1:1)',
        'service_requests (1:M as client)',
        'bookings (1:M as client / specialist)',
        'invoices (1:M)',
      ],
    },
    {
      id: 'specialist_profiles',
      label: 'specialist_profiles',
      category: 'Therapist Verification',
      color: 'bg-teal-600 text-white',
      badge: 'Admin Approved',
      desc: 'DPT license number, verification state, specialties array, clinic coordinates, rates, and ratings.',
      relations: [
        'specialist_availability (1:M weekly shifts)',
        'specialist_matches (1:M dispatches)',
        'specialist_payouts (1:M)',
      ],
    },
    {
      id: 'client_profiles',
      label: 'client_profiles',
      category: 'Protected Health Data',
      color: 'bg-rose-600 text-white',
      badge: 'HIPAA Isolated',
      desc: 'Medical intake summary, emergency contacts, contraindications, and surgery history.',
      relations: ['Controlled access via treating specialist bookings'],
    },
    {
      id: 'service_requests',
      label: 'service_requests',
      category: 'Matching Engine',
      color: 'bg-amber-600 text-white',
      badge: 'On-Demand',
      desc: 'Condition category, pain scale (1-10), address coordinates, time slots, and status.',
      relations: [
        'specialist_matches (1:M)',
        'bookings (1:1 on match acceptance)',
      ],
    },
    {
      id: 'specialist_matches',
      label: 'specialist_matches',
      category: 'Matching Engine',
      color: 'bg-amber-500 text-white',
      badge: 'Accept / Decline',
      desc: 'Dispatched to nearby therapists based on distance and specialty score. Specialists accept or decline.',
      relations: ['service_requests', 'specialist_profiles'],
    },
    {
      id: 'bookings',
      label: 'public.bookings',
      category: 'Consultations',
      color: 'bg-indigo-600 text-white',
      badge: 'Scheduled',
      desc: 'Confirmed appointments, telehealth URLs or physical locations, booking payment status.',
      relations: [
        'session_notes (1:1)',
        'progress_records (1:M)',
        'invoices (1:1)',
        'specialist_payouts (1:1)',
      ],
    },
    {
      id: 'session_notes',
      label: 'session_notes',
      category: 'Clinical SOAP Charts',
      color: 'bg-rose-700 text-white',
      badge: 'HIPAA Strict RLS',
      desc: 'Subjective, Objective, Assessment, Plan (SOAP), pre/post pain scores, client-visible flag.',
      relations: ['bookings (1:1)', 'client_profiles', 'specialist_profiles'],
    },
    {
      id: 'progress_records',
      label: 'progress_records',
      category: 'Recovery Tracking',
      color: 'bg-cyan-600 text-white',
      badge: 'Metrics',
      desc: 'Mobility score (0-100), pain level over time, home exercise compliance percentage.',
      relations: ['client_profiles', 'specialist_profiles'],
    },
    {
      id: 'subscriptions',
      label: 'public.subscriptions',
      category: 'Billing Plans',
      color: 'bg-emerald-700 text-white',
      badge: 'Billing Plans',
      desc: 'Care membership tiers (Starter, Pro, Elite), monthly therapy sessions quota, renewal period.',
      relations: ['profiles', 'invoices'],
    },
    {
      id: 'invoices',
      label: 'public.invoices',
      category: 'Auto-Invoicing',
      color: 'bg-emerald-800 text-white',
      badge: 'Resend Email',
      desc: 'Itemized charges, PDF URLs, Resend email status, and transaction reference IDs.',
      relations: ['bookings', 'subscriptions', 'profiles'],
    },
    {
      id: 'specialist_payouts',
      label: 'specialist_payouts',
      category: 'Therapist Earnings',
      color: 'bg-emerald-900 text-white',
      badge: 'Payouts',
      desc: 'Session earnings minus platform fee, net payout calculations, transfer status.',
      relations: ['specialist_profiles', 'bookings'],
    },
  ];

  const selectedEntity = entities.find((e) => e.id === activeNode) || entities[1];

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Entity Relationship Architecture (12 Connected Tables)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any entity node to inspect its relational dependencies, foreign keys, and role boundaries.
          </p>
        </div>
      </div>

      {/* Relational Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {entities.map((ent) => {
          const isSelected = activeNode === ent.id;
          return (
            <button
              key={ent.id}
              onClick={() => setActiveNode(ent.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  {ent.category}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'
                }`}>
                  {ent.badge}
                </span>
              </div>

              <div className="font-mono font-bold text-sm tracking-tight mb-1">
                {ent.label}
              </div>

              <p className={`text-xs line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {ent.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Entity Deep-Dive Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Selected Entity Node
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono">
                {selectedEntity.label}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mt-1">{selectedEntity.category}</h4>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
            {selectedEntity.badge}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Purpose &amp; Data Contract
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedEntity.desc}
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Foreign Key Relations &amp; Linkages
            </div>
            <ul className="space-y-1.5">
              {selectedEntity.relations.map((rel, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{rel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
