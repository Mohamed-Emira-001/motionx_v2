import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  ShieldAlert, 
  FileBadge, 
  CheckCircle2, 
  LogOut, 
  Building,
  RefreshCw,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../lib/formatters';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';

export const AwaitingApprovalScreen: React.FC = () => {
  const { t } = useTranslation();
  const { profile, specialistProfile, logout, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Language Switcher Bar */}
      <div className="flex justify-end mb-3">
        <LanguageSwitcher />
      </div>

      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-lg shadow-amber-500/5 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="text-start">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                  {t('awaitingApproval.pendingBadge')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  {t('awaitingApproval.title')}
                </h2>
                <p className="text-xs sm:text-sm text-amber-50/90 mt-0.5">
                  {t('awaitingApproval.greeting', { name: profile?.full_name || t('roles.specialist') })}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all"
            >
              <LogOut className="w-4 h-4 rtl-flip" />
              <span>{t('common.logOut')}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Explanation Alert */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed text-start">
              <span className="font-bold block text-sm mb-0.5">{t('awaitingApproval.restrictedTitle')}</span>
              {t('awaitingApproval.restrictedDesc')}
            </div>
          </div>

          {/* Submitted Credentials Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t('awaitingApproval.submittedSummary')}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                {t('awaitingApproval.statusPending')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="text-start">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('awaitingApproval.licenseNum')}</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {specialistProfile?.license_number || 'PT-902144'}
                </span>
              </div>
              <div className="text-start">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('awaitingApproval.stateJurisdiction')}</span>
                <span className="font-semibold text-slate-800">
                  {specialistProfile?.license_state || 'CA'}
                </span>
              </div>
              <div className="text-start">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('awaitingApproval.hourlyRate')}</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(specialistProfile?.hourly_rate_cents || 13500)}
                </span>
              </div>
            </div>

            <div className="text-start">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">{t('awaitingApproval.registeredSpecialties')}</span>
              <div className="flex flex-wrap gap-1.5">
                {(specialistProfile?.specialties || ['Orthopedics', 'Sports Rehab']).map((spec, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Pipeline Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-start">
              {t('awaitingApproval.pipelineTitle')}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-start">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('awaitingApproval.step1')}</span>
                </div>
                <p className="text-[11px] text-emerald-700">{t('awaitingApproval.step1Desc')}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 ring-2 ring-amber-500/20 text-start">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                  <span>{t('awaitingApproval.step2')}</span>
                </div>
                <p className="text-[11px] text-amber-700">{t('awaitingApproval.step2Desc')}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-start">
                <div className="flex items-center gap-1.5 font-bold text-slate-500 mb-1">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{t('awaitingApproval.step3')}</span>
                </div>
                <p className="text-[11px] text-slate-400">{t('awaitingApproval.step3Desc')}</p>
              </div>
            </div>
          </div>

          {/* Verification Status Action Card */}
          <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {t('awaitingApproval.statusCardTitle')}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                {t('awaitingApproval.liveStatus')}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed text-start">
              {t('awaitingApproval.statusCardDesc')}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? t('awaitingApproval.checkingStatus') : t('awaitingApproval.checkStatus')}</span>
              </button>

              <a
                href="mailto:support@motionx.health"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('awaitingApproval.contactTeam')}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
