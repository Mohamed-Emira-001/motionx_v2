import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserCheck, 
  Activity, 
  PlusCircle, 
  TrendingUp, 
  Calendar, 
  FileText, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CreateRequestModal } from '../requests/CreateRequestModal';
import { ClientRequestsTracker } from '../requests/ClientRequestsTracker';
import { ClientBookingsList } from '../dashboard/ClientBookingsList';
import { ClientSoapNotesView } from '../dashboard/ClientSoapNotesView';
import { ClientProgressTracker } from '../dashboard/ClientProgressTracker';
import { createServiceRequest } from '../../lib/matching-service';
import { fetchClientBookings, fetchClientVisibleNotes, fetchClientProgressRecords } from '../../lib/clinical-service';
import { CreateRequestInput, BookingRecord } from '../../types/service-requests';
import { SessionNote, ProgressRecord } from '../../types/clinical';

interface ClientPortalViewProps {
  onNavigateToStep1: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({ onNavigateToStep1 }) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'bookings' | 'notes' | 'progress'>('requests');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [soapNotes, setSoapNotes] = useState<SessionNote[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const clientId = profile?.id || 'usr-client-001';
    const [b, n, p] = await Promise.all([
      fetchClientBookings(clientId),
      fetchClientVisibleNotes(clientId), // STRICTLY client_visible = true!
      fetchClientProgressRecords(clientId),
    ]);
    setBookings(b);
    setSoapNotes(n);
    setProgressRecords(p);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [profile?.id, refreshTrigger]);

  const handleCreateRequest = async (input: CreateRequestInput): Promise<boolean> => {
    setIsSubmitting(true);
    const res = await createServiceRequest(profile?.id || 'usr-client-001', input);
    setIsSubmitting(false);

    if (res.success) {
      setRefreshTrigger(prev => prev + 1);
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Route Badge & Greeting */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 text-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{t('client.portalTitle')} • /client</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.full_name || t('roles.client')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {t('client.portalSubtitle')}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t('client.requestTherapy')}</span>
            </button>
            <span className="text-slate-400 text-[11px] font-mono">
              ID: {profile?.id}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-700 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span>{t('client.activeRequests')}</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-blue-600 text-blue-700 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{t('client.myBookings')}</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-700 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>{t('client.soapNotes')}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {soapNotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'progress'
              ? 'border-blue-600 text-blue-700 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>{t('client.progressTracker')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'requests' && (
          <ClientRequestsTracker
            onOpenNewRequest={() => setIsModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'bookings' && (
          <ClientBookingsList
            bookings={bookings}
            onOpenNewRequest={() => setIsModalOpen(true)}
          />
        )}

        {activeTab === 'notes' && (
          <ClientSoapNotesView
            notes={soapNotes}
          />
        )}

        {activeTab === 'progress' && (
          <ClientProgressTracker
            records={progressRecords}
            onRecordSaved={loadData}
          />
        )}
      </div>

      {/* Modal for Creating Request */}
      <CreateRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateRequest}
        isSubmitting={isSubmitting}
      />

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
