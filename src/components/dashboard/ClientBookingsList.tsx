import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Building, 
  Home, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { BookingRecord } from '../../types/service-requests';
import { formatDateTime, formatCurrency } from '../../lib/formatters';

interface ClientBookingsListProps {
  bookings: BookingRecord[];
  onOpenNewRequest: () => void;
}

export const ClientBookingsList: React.FC<ClientBookingsListProps> = ({ bookings, onOpenNewRequest }) => {
  const { t } = useTranslation();

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'in_person_clinic': return <Building className="w-4 h-4 text-blue-600" />;
      case 'home_visit': return <Home className="w-4 h-4 text-teal-600" />;
      case 'telehealth': return <Video className="w-4 h-4 text-emerald-600" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">{t('bookingStatuses.confirmed')}</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">{t('bookingStatuses.completed')}</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{t('bookingStatuses.cancelled')}</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="font-bold text-slate-800 text-sm">{t('client.noBookings')}</h4>
        <button
          onClick={onOpenNewRequest}
          className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
        >
          <span>{t('client.createNewRequest')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const formattedDate = formatDateTime(booking.scheduled_start);

        return (
          <div
            key={booking.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                  {getServiceIcon(booking.session_type)}
                </div>
                <div className="text-start">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {t('client.sessionWith')}
                    </h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{t(`serviceTypes.${booking.session_type}` as any) || booking.session_type}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-600">ID: {booking.id.slice(0, 10)}</span>
                  </div>
                </div>
              </div>

              <div className="text-start sm:text-end text-xs">
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(booking.total_amount_cents, booking.currency || 'USD')}
                </div>
                <span className="text-[10px] text-slate-400 capitalize">
                  {t('client.paymentStatus')}: {t(`paymentStatuses.${booking.payment_status}` as any) || booking.payment_status}
                </span>
              </div>
            </div>

            {/* Specialist & Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-start">
              
              {/* Specialist */}
              <div className="flex items-center gap-2.5">
                <img
                  src={booking.specialist?.profile?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                  alt="Therapist"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    {booking.specialist?.profile?.full_name || t('roles.specialist')}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-1">
                    {booking.specialist?.title || 'Doctor of Physical Therapy'}
                  </span>
                </div>
              </div>

              {/* Time & Schedule */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{booking.location_address}</span>
                </div>
              </div>

            </div>

            {/* Telehealth or Action Button */}
            {booking.session_type === 'telehealth' && booking.telehealth_room_url && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {t('common.hipaaCompliant')}
                </span>
                <a
                  href={booking.telehealth_room_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs"
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
  );
};
