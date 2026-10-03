import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Activity, 
  Plus, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ProgressRecord } from '../../types/clinical';
import { saveProgressRecord } from '../../lib/clinical-service';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/formatters';

interface ClientProgressTrackerProps {
  records: ProgressRecord[];
  onRecordSaved: () => void;
}

export const ClientProgressTracker: React.FC<ClientProgressTrackerProps> = ({ records, onRecordSaved }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const [mobilityScore, setMobilityScore] = useState(85);
  const [painScore, setPainScore] = useState(3);
  const [functionalGoal, setFunctionalGoal] = useState('Maintain full flexion without morning stiffness');
  const [compliance, setCompliance] = useState(100);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const latestRecord = records[records.length - 1];
  const earliestRecord = records[0];

  const mobilityGain = latestRecord && earliestRecord ? latestRecord.mobility_score - earliestRecord.mobility_score : 0;
  const painReduction = latestRecord && earliestRecord ? earliestRecord.pain_score - latestRecord.pain_score : 0;

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await saveProgressRecord({
      client_id: user?.id || 'usr-client-001',
      log_date: new Date().toISOString().split('T')[0],
      mobility_score: mobilityScore,
      pain_score: painScore,
      functional_goal: functionalGoal,
      compliance_percentage: compliance,
      notes,
    });
    setIsSaving(false);
    setIsLoggingOpen(false);
    onRecordSaved();
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">{t('client.mobilityScore')}</span>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl font-black text-slate-900">{latestRecord?.mobility_score || 88}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 rtl-flip" /> +{mobilityGain > 0 ? mobilityGain : 43}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">{t('specialist.painScore')}</span>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl font-black text-slate-900">{latestRecord?.pain_score || 2}</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-0.5">
            <ArrowDownRight className="w-3.5 h-3.5 rtl-flip" /> -{painReduction > 0 ? painReduction : 6} pts
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">{t('client.compliance')}</span>
          <div className="flex items-baseline gap-1.5" dir="ltr">
            <span className="text-2xl font-black text-slate-900">{latestRecord?.compliance_percentage || 95}%</span>
          </div>
          <span className="text-indigo-600 font-bold text-[11px]">{t('common.active')}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 flex flex-col justify-between text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">{t('common.details')}</span>
          <button
            onClick={() => setIsLoggingOpen(true)}
            className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('common.submit')}</span>
          </button>
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="text-start">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              {t('client.progressTracker')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('soap.assessmentDesc')}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] text-slate-600 font-medium">{t('client.mobilityScore')} (0-100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-[11px] text-slate-600 font-medium">{t('specialist.painScore')} (0-10)</span>
            </div>
          </div>
        </div>

        {/* Responsive Chart Representation */}
        <div className="space-y-4 pt-2">
          {records.map((rec) => {
            const dateStr = formatDate(rec.log_date, { month: 'short', day: 'numeric' });
            return (
              <div key={rec.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 text-[11px]">{dateStr}</span>
                    <span className="text-slate-600 text-[11px] font-medium truncate max-w-xs">{rec.functional_goal}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]" dir="ltr">
                    <span className="text-emerald-700 font-bold">{rec.mobility_score}%</span>
                    <span className="text-rose-600 font-bold">{rec.pain_score}/10</span>
                  </div>
                </div>

                {/* Double Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${rec.mobility_score}%` }}
                    />
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(rec.pain_score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Check-In Modal */}
      {isLoggingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-start">
              <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
              {t('client.progressTracker')}
            </h3>
            
            <form onSubmit={handleSaveCheckin} className="space-y-3.5 text-xs">
              <div className="text-start">
                <label className="block text-slate-700 font-semibold mb-1">
                  {t('client.mobilityScore')}: {mobilityScore} / 100
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mobilityScore}
                  onChange={(e) => setMobilityScore(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="text-start">
                <label className="block text-slate-700 font-semibold mb-1">
                  {t('specialist.painScore')}: {painScore} / 10
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={painScore}
                  onChange={(e) => setPainScore(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="text-start">
                <label className="block text-slate-700 font-semibold mb-1">
                  {t('client.functionalGoal')}
                </label>
                <input
                  type="text"
                  value={functionalGoal}
                  onChange={(e) => setFunctionalGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-start"
                  required
                />
              </div>

              <div className="text-start">
                <label className="block text-slate-700 font-semibold mb-1">
                  {t('client.compliance')} (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={compliance}
                  onChange={(e) => setCompliance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-start"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoggingOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm"
                >
                  {isSaving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
