import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Building, 
  Home, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { BookingRecord } from '../../types/service-requests';
import { formatDateTime, formatCurrency } from '../../lib/formatters';

interface SpecialistScheduleViewProps {
  schedule: BookingRecord[];
  onOpenSoapEditor: (booking: BookingRecord) => void;
}

export const SpecialistScheduleView: React.FC<SpecialistScheduleViewProps> = ({ 
  schedule, 
  onOpenSoapEditor 
}) => {
  const { t } = useTranslation();

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'in_person_clinic': return <Building className="w-4 h-4 text-blue-600" />;
      case 'home_visit': return <Home className="w-4 h-4 text-teal-600" />;
      case 'telehealth': return <Video className="w-4 h-4 text-emerald-600" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (schedule.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-800 text-sm">{t('client.noBookings')}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t('specialist.portalSubtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Patient Address Revealed Callout */}
      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-start">
          <span className="font-bold block">{t('specialist.confirmedLocation')}</span>
          <span>
            {t('specialist.fullAddressRevealed')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.map((booking) => {
          const dateStr = formatDateTime(booking.scheduled_start);

          return (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 shrink-0">
                    {getServiceIcon(booking.session_type)}
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {t('client.sessionWith')} {booking.client?.full_name || t('roles.client')}
                      </h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {t(`bookingStatuses.${booking.status}` as any) || booking.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span>{t('roles.client')}: <code className="font-mono text-slate-700">{booking.client_id.slice(0, 10)}</code></span>
                      <span> • </span>
                      <span>{t('specialist.grossFee')}: {formatCurrency(booking.total_amount_cents, booking.currency || 'USD')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => onOpenSoapEditor(booking)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('specialist.editSoapNote')}</span>
                  </button>
                </div>
              </div>

              {/* Patient & Location info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('client.scheduledAt')}</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Eye className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>{t('specialist.confirmedLocation')}</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{booking.location_address}</span>
                  </div>
                </div>
              </div>

              {/* Telehealth Room Link */}
              {booking.session_type === 'telehealth' && booking.telehealth_room_url && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {t('serviceTypes.telehealth')}
                  </span>
                  <a
                    href={booking.telehealth_room_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{t('client.telehealthLink')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
