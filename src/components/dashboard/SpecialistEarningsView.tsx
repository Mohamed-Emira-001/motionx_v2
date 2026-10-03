import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  Percent, 
  Calendar,
  Building
} from 'lucide-react';
import { SpecialistEarningsSummary } from '../../types/clinical';
import { formatCurrency, formatDate, formatNumber } from '../../lib/formatters';

interface SpecialistEarningsViewProps {
  summary: SpecialistEarningsSummary;
}

export const SpecialistEarningsView: React.FC<SpecialistEarningsViewProps> = ({ summary }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('specialist.netTakeHome')}
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono" dir="ltr">
            {formatCurrency(summary.net_payout_cents, 'USD')}
          </div>
          <span className="text-slate-500 text-[10px]">
            {t('specialist.afterPlatformSplit')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('specialist.grossBilledGmv')}
          </span>
          <div className="text-2xl font-black text-slate-800 font-mono" dir="ltr">
            {formatCurrency(summary.gross_earnings_cents, 'USD')}
          </div>
          <span className="text-slate-500 text-[10px]">
            {formatNumber(summary.completed_sessions_count)} {t('specialist.sessionsBilled')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('specialist.platformFeeSplit')}
          </span>
          <div className="text-2xl font-black text-slate-700 font-mono" dir="ltr">
            {formatCurrency(summary.platform_fee_cents, 'USD')}
          </div>
          <span className="text-slate-500 text-[10px]">
            {t('specialist.hipaaInfra')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('specialist.pendingTransfer')}
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono" dir="ltr">
            {formatCurrency(summary.pending_payout_cents, 'USD')}
          </div>
          <span className="text-amber-700 text-[10px] font-semibold">
            {t('specialist.weeklyDeposit')}
          </span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="text-start">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
              {t('specialist.ledgerTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('specialist.ledgerSubtitle')}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
            {t('specialist.automatedPayouts')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-semibold text-start">{t('specialist.sessionDate')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('specialist.clientName')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('specialist.grossFee')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('specialist.platformFee')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('specialist.netFee')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('specialist.transferStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {summary.recent_payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 text-slate-700 font-sans text-start">
                    {formatDate(p.session_date)}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900 text-start">
                    {p.client_name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-start" dir="ltr">
                    {formatCurrency(p.gross_cents, 'USD')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-start" dir="ltr">
                    -{formatCurrency(p.fee_cents, 'USD')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700 text-start" dir="ltr">
                    {formatCurrency(p.net_cents, 'USD')}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-start">
                    {p.status === 'transferred' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{t('specialist.transferred')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{t('specialist.processing')}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
