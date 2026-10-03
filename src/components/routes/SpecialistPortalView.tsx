import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Stethoscope, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  Inbox, 
  FileText, 
  CreditCard 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SpecialistDispatchInbox } from '../requests/SpecialistDispatchInbox';
import { SpecialistScheduleView } from '../dashboard/SpecialistScheduleView';
import { SpecialistSoapEditor } from '../dashboard/SpecialistSoapEditor';
import { SpecialistEarningsView } from '../dashboard/SpecialistEarningsView';
import { fetchSpecialistSchedule, fetchSpecialistSoapNotes, fetchSpecialistEarningsSummary } from '../../lib/clinical-service';
import { BookingRecord } from '../../types/service-requests';
import { SessionNote, SpecialistEarningsSummary } from '../../types/clinical';
import { formatDate } from '../../lib/formatters';

interface SpecialistPortalViewProps {
  onNavigateToStep1: () => void;
}

export const SpecialistPortalView: React.FC<SpecialistPortalViewProps> = ({ onNavigateToStep1 }) => {
  const { t } = useTranslation();
  const { profile, specialistProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'schedule' | 'soap' | 'earnings'>('inbox');

  const [schedule, setSchedule] = useState<BookingRecord[]>([]);
  const [soapNotes, setSoapNotes] = useState<SessionNote[]>([]);
  const [earnings, setEarnings] = useState<SpecialistEarningsSummary | null>(null);

  const [selectedBookingForSoap, setSelectedBookingForSoap] = useState<BookingRecord | null>(null);
  const [selectedNoteToEdit, setSelectedNoteToEdit] = useState<SessionNote | null>(null);

  const loadData = async () => {
    const specId = profile?.id || 'usr-pt-001';
    const [s, n, e] = await Promise.all([
      fetchSpecialistSchedule(specId),
      fetchSpecialistSoapNotes(specId),
      fetchSpecialistEarningsSummary(specId),
    ]);
    setSchedule(s);
    setSoapNotes(n);
    setEarnings(e);
  };

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const handleOpenSoapEditor = (booking: BookingRecord) => {
    const existing = soapNotes.find(n => n.booking_id === booking.id);
    setSelectedNoteToEdit(existing || null);
    setSelectedBookingForSoap(booking);
  };

  return (
    <div className="space-y-6">
      {/* Route Badge & Specialist Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 text-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span>{t('specialist.portalTitle')} • /specialist</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.full_name || 'Specialist'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
              {specialistProfile?.title || t('roles.specialist')}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {t('common.verified')}: {specialistProfile?.license_number || 'PT-CA-892419'}
            </span>
            <span className="text-teal-200 text-[11px]">{specialistProfile?.license_state || 'CA'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'inbox'
              ? 'border-teal-600 text-teal-700 bg-teal-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Inbox className="w-4 h-4 shrink-0" />
          <span>{t('specialist.dispatchInbox')}</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-teal-600 text-teal-700 bg-teal-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{t('specialist.schedule')}</span>
          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {schedule.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('soap')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'soap'
              ? 'border-teal-600 text-teal-700 bg-teal-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>{t('specialist.soapEditor')}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {soapNotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'earnings'
              ? 'border-teal-600 text-teal-700 bg-teal-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>{t('specialist.earnings')}</span>
        </button>
      </div>

      {/* Panels */}
      <div className="pt-2">
        {activeTab === 'inbox' && (
          <SpecialistDispatchInbox />
        )}

        {activeTab === 'schedule' && (
          <SpecialistScheduleView
            schedule={schedule}
            onOpenSoapEditor={handleOpenSoapEditor}
          />
        )}

        {activeTab === 'soap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-start">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                  {t('specialist.soapEditor')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('soap.clientVisibleHelp')}
                </p>
              </div>

              {schedule.length > 0 && (
                <button
                  onClick={() => handleOpenSoapEditor(schedule[0])}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  + {t('specialist.createSoapNote')}
                </button>
              )}
            </div>

            {soapNotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                {t('client.noSoapNotes')}
              </div>
            ) : (
              <div className="space-y-3">
                {soapNotes.map((note) => (
                  <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">
                          {t('common.details')}: {note.booking_id.slice(0, 8)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          note.client_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {note.client_visible ? t('client.soapNotes') : t('common.hipaaCompliant')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(note.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-start">
                      <div>
                        <span className="font-bold text-blue-700 block text-[10px]">{t('soap.subjectiveTitle')}</span>
                        <p className="text-slate-700 line-clamp-2">{note.subjective_notes}</p>
                      </div>
                      <div>
                        <span className="font-bold text-teal-700 block text-[10px]">{t('soap.objectiveTitle')}</span>
                        <p className="text-slate-700 line-clamp-2">{note.objective_metrics}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && earnings && (
          <SpecialistEarningsView summary={earnings} />
        )}
      </div>

      {/* Modal SOAP Editor */}
      {selectedBookingForSoap && (
        <SpecialistSoapEditor
          booking={selectedBookingForSoap}
          existingNote={selectedNoteToEdit}
          onClose={() => {
            setSelectedBookingForSoap(null);
            setSelectedNoteToEdit(null);
          }}
          onSaved={loadData}
        />
      )}

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
