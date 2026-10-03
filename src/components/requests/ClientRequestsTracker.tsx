import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Calendar, 
  Building, 
  Home, 
  Video, 
  AlertCircle, 
  UserCheck, 
  ArrowRight, 
  ExternalLink,
  Flame,
  X,
  RefreshCw,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { ServiceRequest, RequestStatus } from '../../types/service-requests';
import { fetchClientRequests, cancelServiceRequest } from '../../lib/matching-service';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency, formatNumber } from '../../lib/formatters';

interface ClientRequestsTrackerProps {
  onOpenNewRequest: () => void;
  refreshTrigger: number;
}

export const ClientRequestsTracker: React.FC<ClientRequestsTrackerProps> = ({
  onOpenNewRequest,
  refreshTrigger,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const data = await fetchClientRequests(user?.id || 'usr-client-001');
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [user?.id, refreshTrigger]);

  const handleCancel = async (id: string) => {
    if (!confirm(t('client.confirmCancel'))) return;
    setCancellingId(id);
    await cancelServiceRequest(id);
    await loadRequests();
    setCancellingId(null);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'open_for_matching':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>{t('client.matchingSpecialists')}</span>
          </span>
        );
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t('client.specialistMatchedBooked')}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t('client.cancelled')}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t('client.sessionCompleted')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'in_person_clinic': return <Building className="w-3.5 h-3.5 text-blue-600" />;
      case 'home_visit': return <Home className="w-3.5 h-3.5 text-teal-600" />;
      case 'telehealth': return <Video className="w-3.5 h-3.5 text-emerald-600" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">{t('client.loadingRequests')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="text-start">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('client.careRequestsTitle')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('client.careRequestsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadRequests}
            title={t('common.refresh')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </button>

          <button
            onClick={onOpenNewRequest}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('client.newCareRequest')}</span>
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">{t('client.noActiveRequests')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              {t('client.noActiveRequestsDesc')}
            </p>
          </div>
          <button
            onClick={onOpenNewRequest}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 inline-flex items-center gap-2"
          >
            <span>{t('client.submitCareRequest')}</span>
            <ArrowRight className="w-4 h-4 rtl-flip" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all space-y-3 p-5"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                    {getServiceTypeIcon(req.service_type)}
                  </div>
                  <div className="text-start">
                    <h4 className="font-bold text-sm text-slate-900">{req.condition_category}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{t(`serviceTypes.${req.service_type}` as any) || req.service_type}</span>
                      <span>•</span>
                      <span>Ref: <code className="font-mono text-slate-600">{req.id.slice(0, 12)}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {getStatusBadge(req.status)}
                  {req.status === 'open_for_matching' && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      disabled={cancellingId === req.id}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      {cancellingId === req.id ? t('client.cancelling') : t('client.cancelRequest')}
                    </button>
                  )}
                </div>
              </div>

              {/* Symptoms & Pain Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('client.reportedSymptoms')}</span>
                  <p className="text-slate-700 font-medium line-clamp-2">{req.condition_description}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('client.painIntensity')}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      req.pain_level >= 7 ? 'bg-rose-100 text-rose-800' : req.pain_level >= 4 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`} dir="ltr">
                      {req.pain_level} / 10
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">{req.pain_area}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('client.preferredWindow')}</span>
                  <div className="text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(req.preferred_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.preferred_time_slot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE MATCHING STATUS PIPELINE */}
              {req.status === 'open_for_matching' && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start sm:items-center gap-3 text-start">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-950 block">
                        {t('client.dispatchedToTop')}
                      </span>
                      <span className="text-[11px] text-amber-800/90">
                        {t('client.dispatchedToTopDesc')}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] tracking-wider uppercase shrink-0">
                    {t('client.activeDispatch')}
                  </span>
                </div>
              )}

              {/* MATCHED SPECIALIST CARD */}
              {req.status === 'matched' && req.matched_specialist && (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider text-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('client.confirmedTherapistMatch')}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {t('client.bookingConfirmedBadge')}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-start">
                      <img
                        src={req.matched_specialist.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                        alt="Specialist"
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-200 shadow-2xs shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">
                          {req.matched_specialist.profile?.full_name || 'Dr. Marcus Vance, PT, DPT'}
                        </h5>
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          {req.matched_specialist.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-emerald-700">{t('client.licenseLabel')}: {req.matched_specialist.license_number}</span>
                          <span>•</span>
                          <span className="text-amber-600 font-semibold">★ {req.matched_specialist.rating} ({formatNumber(req.matched_specialist.review_count)} {t('client.reviewsCount')})</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-start sm:text-end text-xs">
                      <div className="font-mono font-bold text-emerald-900 text-sm" dir="ltr">
                        {formatCurrency(req.matched_specialist.hourly_rate_cents || 13500, 'USD')}
                      </div>
                      <span className="text-[10px] text-slate-500 block">{t('client.sessionFee')}</span>
                      {req.service_type === 'telehealth' && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 underline cursor-pointer">
                          {t('client.videoRoomReady')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
