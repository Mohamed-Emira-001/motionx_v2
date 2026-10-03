import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  FileText, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Save, 
  Dumbbell,
  Flame,
  Activity
} from 'lucide-react';
import { SessionNote } from '../../types/clinical';
import { BookingRecord } from '../../types/service-requests';
import { saveSoapNote } from '../../lib/clinical-service';
import { useAuth } from '../../contexts/AuthContext';

interface SpecialistSoapEditorProps {
  booking: BookingRecord;
  existingNote?: SessionNote | null;
  onClose: () => void;
  onSaved: () => void;
}

export const SpecialistSoapEditor: React.FC<SpecialistSoapEditorProps> = ({
  booking,
  existingNote,
  onClose,
  onSaved,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [subjective, setSubjective] = useState(
    existingNote?.subjective_notes || 'Patient reports pain decreased from 6/10 to 3/10. Able to perform activities of daily living with minimal discomfort.'
  );
  const [objective, setObjective] = useState(
    existingNote?.objective_metrics || 'Active ROM measured: Flexion 130°, Extension 0°. Manual muscle testing: Quadriceps 4+/5, Hamstrings 5/5. Negative Lachman test.'
  );
  const [assessment, setAssessment] = useState(
    existingNote?.assessment_diagnosis || 'Post-operative recovery showing steady functional adaptation. Joint stability intact.'
  );
  const [plan, setPlan] = useState(
    existingNote?.plan_and_home_exercises || 'Home Exercise Program (HEP): 1. Single-leg balance 3x45s. 2. Squats to parallel 3x12. 3. Resistance band lateral walks 3x15.'
  );
  const [painPre, setPainPre] = useState<number>(existingNote?.pain_level_pre ?? 5);
  const [painPost, setPainPost] = useState<number>(existingNote?.pain_level_post ?? 2);
  const [clientVisible, setClientVisible] = useState<boolean>(existingNote?.client_visible ?? true);
  const [isLocked, setIsLocked] = useState<boolean>(existingNote?.is_locked ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!subjective.trim() || !objective.trim() || !assessment.trim() || !plan.trim()) {
      setErrorMsg(t('soap.allSectionsRequired'));
      return;
    }

    setIsSaving(true);
    await saveSoapNote({
      id: existingNote?.id,
      booking_id: booking.id,
      client_id: booking.client_id,
      specialist_id: user?.id || 'usr-pt-001',
      subjective_notes: subjective,
      objective_metrics: objective,
      assessment_diagnosis: assessment,
      plan_and_home_exercises: plan,
      pain_level_pre: painPre,
      pain_level_post: painPost,
      client_visible: clientVisible,
      is_locked: isLocked,
    });
    setIsSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute end-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold uppercase tracking-wider">
              {t('soap.chartingBadge')}
            </span>
            <span className="text-slate-400 text-xs">• public.session_notes</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-start">
            {existingNote ? t('soap.editTitle') : t('soap.newTitle')}
          </h3>
          <p className="text-xs text-teal-100/80 mt-0.5 text-start">
            {t('soap.sessionRef')}: <code className="font-mono text-white">{booking.id.slice(0, 10)}</code> • {t('soap.clientId')}: {booking.client_id}
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="text-start">{errorMsg}</span>
            </div>
          )}

          {/* Pain Scale Pre / Post */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-start">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{t('soap.prePain')}</span>
                </span>
                <span className="font-mono font-bold text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded" dir="ltr">{painPre} / 10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={painPre}
                onChange={(e) => setPainPre(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{t('soap.postPain')}</span>
                </span>
                <span className="font-mono font-bold text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded" dir="ltr">{painPost} / 10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={painPost}
                onChange={(e) => setPainPost(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* S - Subjective */}
          <div className="text-start">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-blue-700">
              {t('soap.subjectiveFull')}
            </label>
            <textarea
              rows={2}
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-start"
              required
            />
          </div>

          {/* O - Objective */}
          <div className="text-start">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-teal-700">
              {t('soap.objectiveFull')}
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-start"
              required
            />
          </div>

          {/* A - Assessment */}
          <div className="text-start">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-indigo-700">
              {t('soap.assessmentFull')}
            </label>
            <textarea
              rows={2}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-start"
              required
            />
          </div>

          {/* P - Plan & Prescribed Home Exercises */}
          <div className="text-start">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-emerald-800 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('soap.planFull')}</span>
            </label>
            <textarea
              rows={2}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-start"
              required
            />
          </div>

          {/* Privacy & Lock Controls */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={clientVisible}
                onChange={(e) => setClientVisible(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="font-semibold text-slate-800">
                {t('soap.publishToClient')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
              />
              <span>{t('soap.lockChart')}</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? t('soap.savingNote') : t('soap.saveAndSign')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
