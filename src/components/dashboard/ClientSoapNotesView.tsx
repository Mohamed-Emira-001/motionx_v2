import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  CheckCircle2, 
  Dumbbell, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { SessionNote } from '../../types/clinical';
import { formatDate } from '../../lib/formatters';

interface ClientSoapNotesViewProps {
  notes: SessionNote[];
}

export const ClientSoapNotesView: React.FC<ClientSoapNotesViewProps> = ({ notes }) => {
  const { t } = useTranslation();
  // Strictly filtered by client_visible = true in compliance with HIPAA
  const visibleNotes = notes.filter(n => n.client_visible);

  if (visibleNotes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-800 text-sm">{t('client.noSoapNotes')}</h4>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-start">
          <span className="font-bold block">{t('common.hipaaCompliant')}</span>
          <span>{t('soap.clientVisibleHelp')}</span>
        </div>
      </div>

      <div className="space-y-4">
        {visibleNotes.map((note) => {
          const dateStr = formatDate(note.created_at);

          return (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4"
            >
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-start">
                    <h4 className="font-bold text-sm text-slate-900">
                      {t('client.soapNotes')}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t('common.verified')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {note.pain_level_pre !== undefined && note.pain_level_post !== undefined && (
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px]" dir="ltr">
                      <span className="text-slate-500">VAS:</span>
                      <span className="text-rose-600 font-bold">{note.pain_level_pre}/10</span>
                      <span className="text-slate-400">&rarr;</span>
                      <span className="text-emerald-600 font-bold">{note.pain_level_post}/10</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SOAP Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-start">
                
                {/* S - Subjective */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-blue-700 flex items-center gap-1">
                    <span>S</span> • {t('soap.subjectiveTitle')}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{note.subjective_notes}</p>
                </div>

                {/* O - Objective */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-teal-700 flex items-center gap-1">
                    <span>O</span> • {t('soap.objectiveTitle')}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{note.objective_metrics}</p>
                </div>

                {/* A - Assessment */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-indigo-700 flex items-center gap-1">
                    <span>A</span> • {t('soap.assessmentTitle')}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{note.assessment_diagnosis}</p>
                </div>

                {/* P - Plan & Prescribed Home Exercises */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>P</span> • {t('soap.planTitle')}
                  </div>
                  <p className="text-emerald-900 leading-relaxed font-medium">{note.plan_and_home_exercises}</p>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
