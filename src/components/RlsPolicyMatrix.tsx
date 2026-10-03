import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Stethoscope, Shield, Check, X, AlertTriangle } from 'lucide-react';
import { SCHEMA_TABLES } from '../lib/schema-data';

export const RlsPolicyMatrix: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'all' | 'client' | 'specialist' | 'admin'>('all');

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">HIPAA &amp; Multi-Role Row Level Security (RLS) Architecture</h3>
            <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
              Every table enforces granular PostgreSQL Row Level Security. Health data (SOAP notes, intake medical history, pain scores) is isolated to the client, the licensed therapist treating them, and verified system administrators.
            </p>
          </div>
        </div>

        {/* Role toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-emerald-200 text-xs font-medium shrink-0">
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedRole === 'all' ? 'bg-emerald-700 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedRole('client')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedRole === 'client' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Client Role
          </button>
          <button
            onClick={() => setSelectedRole('specialist')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedRole === 'specialist' ? 'bg-teal-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Specialist Role
          </button>
          <button
            onClick={() => setSelectedRole('admin')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedRole === 'admin' ? 'bg-purple-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Role
          </button>
        </div>
      </div>

      {/* RLS Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Database Entity</th>
                {(selectedRole === 'all' || selectedRole === 'client') && (
                  <th className="py-3 px-4 font-bold text-blue-700 bg-blue-50/50">Client Access (Patient)</th>
                )}
                {(selectedRole === 'all' || selectedRole === 'specialist') && (
                  <th className="py-3 px-4 font-bold text-teal-700 bg-teal-50/50">Specialist Access (PT)</th>
                )}
                {(selectedRole === 'all' || selectedRole === 'admin') && (
                  <th className="py-3 px-4 font-bold text-purple-700 bg-purple-50/50">Admin Access</th>
                )}
                <th className="py-3 px-4 font-bold">Security Constraint Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCHEMA_TABLES.map((table) => {
                const clientAllowed = table.rlsPolicies.some((p) => p.rolesAllowed.includes('client'));
                const specialistAllowed = table.rlsPolicies.some((p) => p.rolesAllowed.includes('specialist'));
                const adminAllowed = table.rlsPolicies.some((p) => p.rolesAllowed.includes('admin'));

                return (
                  <tr key={table.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">{table.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{table.description}</div>
                      {table.hipaaCompliant && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> PHI / Health Protected
                        </span>
                      )}
                    </td>

                    {(selectedRole === 'all' || selectedRole === 'client') && (
                      <td className="py-3 px-4 bg-blue-50/20">
                        {clientAllowed ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <Check className="w-3 h-3 text-blue-600" /> Authorized
                            </span>
                            <div className="text-[10px] text-slate-600">
                              {table.id === 'client_profiles' && 'Read/Write own medical history only'}
                              {table.id === 'service_requests' && 'Create & track own treatment requests'}
                              {table.id === 'bookings' && 'Book sessions, view schedule & room links'}
                              {table.id === 'session_notes' && 'View published SOAP notes & home exercises'}
                              {table.id === 'progress_records' && 'Log self pain score & view mobility chart'}
                              {table.id === 'specialist_profiles' && 'Browse verified therapist profiles'}
                              {table.id === 'invoices' && 'Download own PDF invoices'}
                              {table.id === 'subscriptions' && 'Manage active care memberships'}
                              {table.id === 'profiles' && 'Edit profile details'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            <X className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </td>
                    )}

                    {(selectedRole === 'all' || selectedRole === 'specialist') && (
                      <td className="py-3 px-4 bg-teal-50/20">
                        {specialistAllowed ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              <Check className="w-3 h-3 text-teal-600" /> Authorized
                            </span>
                            <div className="text-[10px] text-slate-600">
                              {table.id === 'specialist_profiles' && 'Edit bio, rates, specialties (status pending approval)'}
                              {table.id === 'specialist_availability' && 'Configure weekly shifts & schedule'}
                              {table.id === 'service_requests' && 'Review matching requests in service radius'}
                              {table.id === 'specialist_matches' && 'Accept or decline dispatch requests'}
                              {table.id === 'session_notes' && 'Create & sign SOAP charts for booked patients'}
                              {table.id === 'client_profiles' && 'View medical intake ONLY for assigned patients'}
                              {table.id === 'specialist_payouts' && 'View earnings & payout transfers'}
                              {table.id === 'bookings' && 'Manage upcoming patient consultations'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            <X className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </td>
                    )}

                    {(selectedRole === 'all' || selectedRole === 'admin') && (
                      <td className="py-3 px-4 bg-purple-50/20">
                        {adminAllowed ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              <Shield className="w-3 h-3 text-purple-600" /> Full Admin Control
                            </span>
                            <div className="text-[10px] text-slate-600">
                              {table.id === 'specialist_profiles' && 'License verification & credential approval'}
                              {table.id === 'invoices' && 'Global billing ledger & revenue monitoring'}
                              {table.id === 'profiles' && 'Role assignment & user administration'}
                              {table.id === 'bookings' && 'Dispute resolution & override access'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <X className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </td>
                    )}

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {table.rlsPolicies[0]?.rule || 'auth.uid() isolation'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
