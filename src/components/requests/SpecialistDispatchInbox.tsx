import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Inbox, 
  Check, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  Home, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  HeartHandshake
} from 'lucide-react';
import { SpecialistMatch } from '../../types/service-requests';
import { fetchSpecialistPendingMatches, acceptMatch, declineMatch } from '../../lib/matching-service';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatDateTime } from '../../lib/formatters';

export const SpecialistDispatchInbox: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [matches, setMatches] = useState<SpecialistMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadPendingMatches = async () => {
    setLoading(true);
    const data = await fetchSpecialistPendingMatches(user?.id || 'usr-pt-001');
    setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPendingMatches();
  }, [user?.id]);

  const handleAccept = async (match: SpecialistMatch) => {
    setProcessingId(match.id);
    const res = await acceptMatch(match.id, match.request_id);
    if (res.success) {
      setSuccessBanner(t('specialist.firstAcceptWins'));
      await loadPendingMatches();
    }
    setProcessingId(null);
  };

  const handleDecline = async (matchId: string) => {
    setProcessingId(matchId);
    await declineMatch(matchId, 'Specialist schedule conflict');
    await loadPendingMatches();
    setProcessingId(null);
  };

  const getServiceIcon = (type?: string) => {
    switch (type) {
      case 'in_person_clinic': return <Building className="w-4 h-4 text-blue-600" />;
      case 'home_visit': return <Home className="w-4 h-4 text-teal-600" />;
      case 'telehealth': return <Video className="w-4 h-4 text-emerald-600" />;
      default: return <HeartHandshake className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="text-start">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-teal-600 shrink-0" />
            {t('specialist.dispatchInbox')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('specialist.firstAcceptWins')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadPendingMatches}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </button>
          <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
            {matches.length} {t('common.pending')}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5 text-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 p-0.5 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">{t('specialist.dispatchInbox')}</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t('client.noBookings')}
          </p>
        </div>
      ) : (
        /* Dispatch Cards List */
        <div className="space-y-3">
          {matches.map((item) => {
            const req = item.request;
            if (!req) return null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all p-5 space-y-4"
              >
                {/* Top status & Compatibility score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                      {getServiceIcon(req.service_type)}
                    </div>
                    <div className="text-start">
                      <h4 className="font-bold text-sm text-slate-900">{req.condition_category}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{t(`serviceTypes.${req.service_type}` as any) || req.service_type}</span>
                        <span>•</span>
                        <span>{formatDateTime(item.dispatched_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {item.match_score}%
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.distance_km > 0 ? `${item.distance_km} km` : t('serviceTypes.telehealth')}
                    </span>
                  </div>
                </div>

                {/* Patient symptoms & Pain scale */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('specialist.patientComplaint')}</span>
                    <p className="text-slate-800 font-medium">{req.condition_description}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('specialist.painScore')}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        req.pain_level >= 7 ? 'bg-rose-100 text-rose-800' : req.pain_level >= 4 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {req.pain_level} / 10
                      </span>
                      <span className="text-slate-600 font-medium">{req.pain_area}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('specialist.requestedSlot')}</span>
                    <div className="text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(req.preferred_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.preferred_time_slot}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & notes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate text-start">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.location_address}</span>
                  </div>
                  {req.client_notes && (
                    <div className="italic text-slate-600 text-[11px] text-start">
                      "{req.client_notes}"
                    </div>
                  )}
                </div>

                {/* Action buttons (First accept wins) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => handleDecline(item.id)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('specialist.declineRequest')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => handleAccept(item)}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-teal-600/20"
                  >
                    {processingId === item.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t('specialist.acceptRequest')}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
