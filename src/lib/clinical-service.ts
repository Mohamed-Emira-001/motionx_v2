import { supabase } from './supabase';
import { BookingRecord } from '../types/service-requests';
import { SessionNote, ProgressRecord, SpecialistEarningsSummary, AdminPlatformMetrics } from '../types/clinical';
import { UserProfile, SpecialistProfile, SpecialistVerificationStatus } from '../types/auth';

// -----------------------------------------------------------------------------
// CLIENT DASHBOARD API (Real Supabase Queries)
// -----------------------------------------------------------------------------

/**
 * Fetch Client Bookings (Upcoming & Past)
 */
export async function fetchClientBookings(clientId: string): Promise<BookingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        specialist:specialist_profiles!specialist_id (
          id, title, license_number, license_state, hourly_rate_cents, rating, review_count,
          profile:profiles ( id, full_name, email, avatar_url, phone )
        )
      `)
      .eq('client_id', clientId)
      .order('scheduled_start', { ascending: false });

    if (error) {
      console.warn('Error fetching client bookings:', error.message);
      return [];
    }

    return (data || []) as BookingRecord[];
  } catch (err: any) {
    console.error('fetchClientBookings error:', err);
    return [];
  }
}

/**
 * Fetch Client Visible SOAP Notes
 * Strictly filters by client_visible = true in compliance with HIPAA!
 */
export async function fetchClientVisibleNotes(clientId: string): Promise<SessionNote[]> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select(`
        *,
        specialist:specialist_profiles!specialist_id (
          id, title, license_number,
          profile:profiles ( id, full_name, email, avatar_url )
        )
      `)
      .eq('client_id', clientId)
      .eq('client_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching client visible SOAP notes:', error.message);
      return [];
    }

    return (data || []) as SessionNote[];
  } catch (err: any) {
    console.error('fetchClientVisibleNotes error:', err);
    return [];
  }
}

/**
 * Fetch Client Progress Records (Mobility and Pain trend)
 */
export async function fetchClientProgressRecords(clientId: string): Promise<ProgressRecord[]> {
  try {
    const { data, error } = await supabase
      .from('progress_records')
      .select('*')
      .eq('client_id', clientId)
      .order('log_date', { ascending: true });

    if (error) {
      console.warn('Error fetching progress records:', error.message);
      return [];
    }

    return (data || []) as ProgressRecord[];
  } catch (err: any) {
    console.error('fetchClientProgressRecords error:', err);
    return [];
  }
}

/**
 * Log New Progress Record (by Client or Therapist)
 */
export async function saveProgressRecord(record: Omit<ProgressRecord, 'id' | 'created_at'>): Promise<{ success: boolean; record?: ProgressRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('progress_records')
      .insert({
        client_id: record.client_id,
        specialist_id: record.specialist_id,
        booking_id: record.booking_id,
        log_date: record.log_date,
        mobility_score: record.mobility_score,
        pain_score: record.pain_score,
        functional_goal: record.functional_goal,
        compliance_percentage: record.compliance_percentage,
        notes: record.notes,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, record: data as ProgressRecord };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// SPECIALIST DASHBOARD API (Real Supabase Queries)
// -----------------------------------------------------------------------------

/**
 * Fetch Specialist Appointments / Schedule
 * Full destination address is revealed because booking has been confirmed!
 */
export async function fetchSpecialistSchedule(specialistId: string): Promise<BookingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id (
          id, full_name, email, phone, avatar_url
        )
      `)
      .eq('specialist_id', specialistId)
      .order('scheduled_start', { ascending: true });

    if (error) {
      console.warn('Error fetching specialist schedule:', error.message);
      return [];
    }

    return (data || []) as BookingRecord[];
  } catch (err: any) {
    console.error('fetchSpecialistSchedule error:', err);
    return [];
  }
}

/**
 * Fetch All Specialist SOAP Notes (Including internal & drafts)
 */
export async function fetchSpecialistSoapNotes(specialistId: string): Promise<SessionNote[]> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select(`
        *,
        client:profiles!client_id ( id, full_name, email )
      `)
      .eq('specialist_id', specialistId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching specialist SOAP notes:', error.message);
      return [];
    }

    return (data || []) as SessionNote[];
  } catch (err: any) {
    console.error('fetchSpecialistSoapNotes error:', err);
    return [];
  }
}

/**
 * Write / Edit SOAP Note directly to Supabase
 */
export async function saveSoapNote(note: Partial<SessionNote> & { booking_id: string; client_id: string; specialist_id: string }): Promise<{ success: boolean; note?: SessionNote; error?: string }> {
  const now = new Date().toISOString();

  try {
    if (note.id) {
      const { data, error } = await supabase
        .from('session_notes')
        .update({
          subjective_notes: note.subjective_notes,
          objective_metrics: note.objective_metrics,
          assessment_diagnosis: note.assessment_diagnosis,
          plan_and_home_exercises: note.plan_and_home_exercises,
          pain_level_pre: note.pain_level_pre,
          pain_level_post: note.pain_level_post,
          client_visible: note.client_visible,
          is_locked: note.is_locked,
          updated_at: now,
        })
        .eq('id', note.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, note: data as SessionNote };
    } else {
      const { data, error } = await supabase
        .from('session_notes')
        .insert({
          booking_id: note.booking_id,
          client_id: note.client_id,
          specialist_id: note.specialist_id,
          subjective_notes: note.subjective_notes || '',
          objective_metrics: note.objective_metrics || '',
          assessment_diagnosis: note.assessment_diagnosis || '',
          plan_and_home_exercises: note.plan_and_home_exercises || '',
          pain_level_pre: note.pain_level_pre,
          pain_level_post: note.pain_level_post,
          client_visible: note.client_visible ?? true,
          is_locked: note.is_locked ?? false,
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, note: data as SessionNote };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Specialist Earnings Summary (Provider-Agnostic)
 */
export async function fetchSpecialistEarningsSummary(specialistId: string): Promise<SpecialistEarningsSummary> {
  try {
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id ( full_name )
      `)
      .eq('specialist_id', specialistId);

    const validBookings = bookings || [];
    const completedCount = validBookings.filter(b => b.status === 'completed' || b.payment_status === 'paid').length;
    
    // Sum gross from real bookings
    const grossTotal = validBookings.reduce((sum, b) => sum + (b.total_amount_cents || 12500), 0);
    const platformFeeTotal = Math.round(grossTotal * 0.15); // 15% platform split
    const netTotal = grossTotal - platformFeeTotal;

    const recentPayouts = validBookings.map((b: any) => {
      const gross = b.total_amount_cents || 12500;
      const fee = Math.round(gross * 0.15);
      const isPaid = b.payment_status === 'paid';
      return {
        id: `payout-${b.id}`,
        booking_id: b.id,
        gross_cents: gross,
        fee_cents: fee,
        net_cents: gross - fee,
        session_date: b.scheduled_start ? b.scheduled_start.split('T')[0] : new Date().toISOString().split('T')[0],
        client_name: b.client?.full_name || 'Patient',
        status: (isPaid ? 'transferred' : 'pending') as 'transferred' | 'pending',
      };
    });

    return {
      specialist_id: specialistId,
      gross_earnings_cents: grossTotal,
      platform_fee_cents: platformFeeTotal,
      net_payout_cents: netTotal,
      completed_sessions_count: completedCount,
      pending_payout_cents: recentPayouts.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.net_cents, 0),
      recent_payouts: recentPayouts,
    };
  } catch (err) {
    return {
      specialist_id: specialistId,
      gross_earnings_cents: 0,
      platform_fee_cents: 0,
      net_payout_cents: 0,
      completed_sessions_count: 0,
      pending_payout_cents: 0,
      recent_payouts: [],
    };
  }
}

// -----------------------------------------------------------------------------
// ADMIN DASHBOARD API (Real Supabase Queries & Actions)
// -----------------------------------------------------------------------------

/**
 * Requirement 3: Admin "Mark as Paid" action
 * Provider-agnostic payment settlement placeholder
 */
export async function updateBookingPaymentStatus(
  bookingId: string, 
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin action to verify / approve / reject specialist license
 */
export async function updateSpecialistVerificationStatus(
  specialistId: string,
  status: SpecialistVerificationStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('specialist_profiles')
      .update({
        verification_status: status,
        verification_notes: notes || `Admin review updated on ${new Date().toLocaleDateString()}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', specialistId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch All Bookings for Admin Overview
 */
export async function fetchAllBookings(): Promise<BookingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id ( id, full_name, email ),
        specialist:specialist_profiles!specialist_id (
          id, title, license_number,
          profile:profiles ( id, full_name, email )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching all bookings:', error.message);
      return [];
    }

    return (data || []) as BookingRecord[];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch Admin Platform Metrics from real Supabase
 */
export async function fetchAdminPlatformMetrics(): Promise<AdminPlatformMetrics> {
  try {
    const [profilesRes, specialistsRes, bookingsRes, requestsRes] = await Promise.all([
      supabase.from('profiles').select('id, role', { count: 'exact' }),
      supabase.from('specialist_profiles').select('id, verification_status'),
      supabase.from('bookings').select('id, total_amount_cents, payment_status, status'),
      supabase.from('service_requests').select('id, status'),
    ]);

    const totalUsers = profilesRes.count || profilesRes.data?.length || 0;
    const clientsCount = (profilesRes.data || []).filter((p: any) => p.role === 'client').length;
    
    const specs = specialistsRes.data || [];
    const totalSpecialists = specs.length;
    const approvedSpecs = specs.filter((s: any) => s.verification_status === 'approved').length;
    const pendingSpecs = specs.filter((s: any) => s.verification_status === 'pending').length;

    const bookings = bookingsRes.data || [];
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b: any) => b.status === 'completed' || b.payment_status === 'paid').length;

    const grossGMV = bookings.reduce((sum: number, b: any) => sum + (b.total_amount_cents || 12500), 0);
    const platformRevenue = Math.round(grossGMV * 0.15);
    const specialistPayouts = grossGMV - platformRevenue;

    const reqs = requestsRes.data || [];
    const activeRequests = reqs.filter((r: any) => r.status === 'open_for_matching').length;

    return {
      total_users: totalUsers,
      total_clients: clientsCount,
      total_specialists: totalSpecialists,
      approved_specialists: approvedSpecs,
      pending_specialists: pendingSpecs,
      total_bookings: totalBookings,
      completed_bookings: completedBookings,
      gross_gmv_cents: grossGMV,
      platform_revenue_cents: platformRevenue,
      specialist_payouts_cents: specialistPayouts,
      active_service_requests: activeRequests,
    };
  } catch (err) {
    return {
      total_users: 0,
      total_clients: 0,
      total_specialists: 0,
      approved_specialists: 0,
      pending_specialists: 0,
      total_bookings: 0,
      completed_bookings: 0,
      gross_gmv_cents: 0,
      platform_revenue_cents: 0,
      specialist_payouts_cents: 0,
      active_service_requests: 0,
    };
  }
}

/**
 * Fetch All Platform Users directly from Supabase
 */
export async function fetchAllPlatformUsers(): Promise<Array<UserProfile & { status?: string }>> {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        specialist:specialist_profiles ( verification_status )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching all platform users:', error.message);
      return [];
    }

    return (profiles || []).map((p: any) => {
      let status = 'Active';
      if (p.role === 'specialist') {
        status = p.specialist?.verification_status === 'approved' ? 'Approved & Licensed' : 'Pending Verification';
      } else if (p.role === 'client') {
        status = 'Active Client';
      } else if (p.role === 'admin') {
        status = 'Administrator';
      }
      return {
        ...p,
        status,
      };
    }) as Array<UserProfile & { status?: string }>;
  } catch (err) {
    return [];
  }
}

/**
 * Fetch All Pending Specialists for Admin Approval Desk
 */
export async function fetchPendingSpecialists(): Promise<SpecialistProfile[]> {
  try {
    const { data, error } = await supabase
      .from('specialist_profiles')
      .select(`
        *,
        profile:profiles ( id, full_name, email, phone, avatar_url )
      `)
      .eq('verification_status', 'pending');

    if (error) return [];
    return (data || []) as SpecialistProfile[];
  } catch (err) {
    return [];
  }
}
