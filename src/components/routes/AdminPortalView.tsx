import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { AdminMetricsOverview } from '../dashboard/AdminMetricsOverview';

interface AdminPortalViewProps {
  onNavigateToStep1: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onNavigateToStep1 }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Route Badge & Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 text-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{t('admin.portalTitle')} • /admin</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('admin.portalTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
              {t('admin.portalSubtitle')}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-300 shrink-0" />
              {t('admin.authorityBadge')}
            </span>
            <span className="text-purple-300 text-[11px]">{t('admin.hipaaAudit')}</span>
          </div>
        </div>
      </div>

      {/* Admin Metrics, Approval Desk & Users Directory */}
      <AdminMetricsOverview />

      {/* Banner connecting back to schema inspection */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="text-start">
          <span className="font-bold text-slate-900">{t('roadmap.step1Title')}:</span> {t('roadmap.step1Desc')}
        </div>
        <button
          onClick={onNavigateToStep1}
          className="font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 shrink-0"
        >
          <span>{t('nav.database')}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
        </button>
      </div>
    </div>
  );
};
