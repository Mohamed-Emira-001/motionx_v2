import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  FileBadge, 
  Check, 
  X, 
  ShieldCheck, 
  Search, 
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { AdminPlatformMetrics } from '../../types/clinical';
import { UserProfile, SpecialistProfile } from '../../types/auth';
import { BookingRecord } from '../../types/service-requests';
import { 
  fetchAdminPlatformMetrics, 
  fetchAllPlatformUsers, 
  fetchPendingSpecialists, 
  updateSpecialistVerificationStatus,
  fetchAllBookings,
  updateBookingPaymentStatus
} from '../../lib/clinical-service';
import { formatDate, formatCurrency, formatNumber } from '../../lib/formatters';

export const AdminMetricsOverview: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<AdminPlatformMetrics | null>(null);
  const [users, setUsers] = useState<Array<UserProfile & { status?: string }>>([]);
  const [pendingSpecialists, setPendingSpecialists] = useState<SpecialistProfile[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'client' | 'specialist' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [updatingSpecId, setUpdatingSpecId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [m, u, pSpecs, bks] = await Promise.all([
      fetchAdminPlatformMetrics(),
      fetchAllPlatformUsers(),
      fetchPendingSpecialists(),
      fetchAllBookings(),
    ]);
    setMetrics(m);
    setUsers(u);
    setPendingSpecialists(pSpecs);
    setBookings(bks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveSpecialist = async (specialistId: string, status: 'approved' | 'rejected') => {
    setUpdatingSpecId(specialistId);
    const res = await updateSpecialistVerificationStatus(specialistId, status);
    if (res.success) {
      setActionSuccessMsg(
        status === 'approved' 
          ? t('admin.specialistApprovedSuccess') 
          : t('admin.specialistRejectedSuccess')
      );
      await loadData();
    }
    setUpdatingSpecId(null);
  };

  // Requirement 3: Simple "Mark as paid" admin action placeholder
  const handleMarkAsPaid = async (bookingId: string) => {
    setUpdatingPaymentId(bookingId);
    const res = await updateBookingPaymentStatus(bookingId, 'paid');
    if (res.success) {
      setActionSuccessMsg(
        t('admin.bookingMarkedPaidSuccess', { id: bookingId.slice(0, 10) })
      );
      await loadData();
    }
    setUpdatingPaymentId(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = 
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert for Actions */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('admin.grossTherapyVolume')}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono" dir="ltr">
            {formatCurrency(metrics?.gross_gmv_cents || 0, 'USD')}
          </div>
          <span className="text-emerald-600 font-semibold text-[10px] flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3 rtl-flip shrink-0" />
            <span>{t('admin.liveSupabaseRecords')}</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('admin.platformRevenueAgnostic')}
          </span>
          <div className="text-2xl font-black text-purple-700 font-mono" dir="ltr">
            {formatCurrency(metrics?.platform_revenue_cents || 0, 'USD')}
          </div>
          <span className="text-slate-500 text-[10px]">
            {t('admin.providerAgnosticLedger')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('admin.totalBookingsVolume')}
          </span>
          <div className="text-2xl font-black text-slate-800 font-mono" dir="ltr">
            {formatNumber(metrics?.total_bookings || bookings.length)} {t('admin.sessionsCount')}
          </div>
          <span className="text-blue-600 font-semibold text-[10px]">
            {formatNumber(bookings.filter(b => b.payment_status === 'paid').length)} {t('admin.paidInFull')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-start">
          <span className="text-slate-400 block uppercase font-bold text-[10px]">
            {t('admin.specialistBoardQueue')}
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono" dir="ltr">
            {formatNumber(pendingSpecialists.length)} {t('admin.pendingCount')}
          </div>
          <span className="text-amber-700 font-semibold text-[10px]">
            {formatNumber(metrics?.approved_specialists || 0)} {t('admin.approvedActive')}
          </span>
        </div>
      </div>

      {/* REQUIREMENT 3: Bookings & "Mark as Paid" Placeholder Action Desk */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="text-start">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
              {t('admin.settlementDeskTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('admin.settlementDeskSubtitle')}
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 self-start sm:self-auto transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.refresh')}</span>
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            {t('admin.noBookingsRecorded')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 font-semibold text-start">{t('admin.bookingId')}</th>
                  <th className="py-2.5 px-3 font-semibold text-start">{t('admin.scheduledDate')}</th>
                  <th className="py-2.5 px-3 font-semibold text-start">{t('admin.mode')}</th>
                  <th className="py-2.5 px-3 font-semibold text-start">{t('admin.amount')}</th>
                  <th className="py-2.5 px-3 font-semibold text-start">{t('admin.paymentStatus')}</th>
                  <th className="py-2.5 px-3 font-semibold text-end">{t('admin.adminAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-800 text-start">
                      {b.id.slice(0, 10)}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 text-start">
                      {formatDate(b.scheduled_start)}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-start">
                      {t(`serviceTypes.${b.session_type}` as any) || b.session_type}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 text-start" dir="ltr">
                      {formatCurrency(b.total_amount_cents, 'USD')}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-start">
                      {b.payment_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{t('paymentStatuses.paid')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{t('paymentStatuses.unpaid')}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-end">
                      {b.payment_status !== 'paid' ? (
                        <button
                          onClick={() => handleMarkAsPaid(b.id)}
                          disabled={updatingPaymentId === b.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs inline-flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{updatingPaymentId === b.id ? t('admin.markingPaid') : t('admin.markAsPaid')}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {t('admin.settled')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Specialist Licensure Approval Desk */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="text-start">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-amber-600 shrink-0" />
              {t('admin.specialistApprovalTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('admin.specialistApprovalSubtitle')}
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 self-start sm:self-auto">
            {formatNumber(pendingSpecialists.length)} {t('admin.pendingReview')}
          </span>
        </div>

        {pendingSpecialists.length > 0 ? (
          <div className="space-y-3">
            {pendingSpecialists.map((spec) => (
              <div
                key={spec.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 text-start">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{spec.title}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                      {t('admin.pendingVerification')}
                    </span>
                  </div>
                  <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>{t('admin.license')}:</strong> {spec.license_number} ({spec.license_state})</span>
                    <span><strong>{t('admin.experience')}:</strong> {spec.years_of_experience} {t('admin.yearsShort')}</span>
                    <span><strong>{t('admin.hourlyRateLabel')}:</strong> {formatCurrency(spec.hourly_rate_cents, 'USD')}{t('admin.hourlyUnit')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(spec.specialties || []).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveSpecialist(spec.id, 'rejected')}
                    disabled={updatingSpecId === spec.id}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                  >
                    {t('admin.reject')}
                  </button>
                  <button
                    onClick={() => handleApproveSpecialist(spec.id, 'approved')}
                    disabled={updatingSpecId === spec.id}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    {updatingSpecId === spec.id ? t('admin.approving') : t('admin.approveCredentials')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            <Check className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span className="font-semibold text-slate-800 block">{t('admin.allSpecialistsVerifiedTitle')}</span>
            <span>{t('admin.allSpecialistsVerifiedSubtitle')}</span>
          </div>
        )}
      </div>

      {/* Users Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="text-start">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600 shrink-0" />
              {t('admin.usersDirectoryTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('admin.usersDirectorySubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${userRoleFilter === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                {t('admin.filterAll')} ({formatNumber(users.length)})
              </button>
              <button
                onClick={() => setUserRoleFilter('client')}
                className={`px-2.5 py-1 rounded-md transition-all ${userRoleFilter === 'client' ? 'bg-white font-bold text-blue-700 shadow-2xs' : 'text-slate-600'}`}
              >
                {t('admin.filterClients')}
              </button>
              <button
                onClick={() => setUserRoleFilter('specialist')}
                className={`px-2.5 py-1 rounded-md transition-all ${userRoleFilter === 'specialist' ? 'bg-white font-bold text-teal-700 shadow-2xs' : 'text-slate-600'}`}
              >
                {t('admin.filterSpecialists')}
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('admin.searchUsersPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-8 pe-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-start"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-semibold text-start">{t('admin.colUser')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('admin.colRole')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('admin.colEmail')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('admin.colStatus')}</th>
                <th className="py-2.5 px-3 font-semibold text-start">{t('admin.colJoined')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    {t('admin.noUsersMatch')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-start">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                          alt={u.full_name}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-start">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'specialist' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t(`roles.${u.role}` as any) || u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] text-start">{u.email}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium text-start">
                      {t('common.active')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] text-start">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
