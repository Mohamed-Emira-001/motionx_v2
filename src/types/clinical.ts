import { UserProfile, SpecialistProfile } from './auth';
import { BookingRecord } from './service-requests';

export interface SessionNote {
  id: string;
  booking_id: string;
  client_id: string;
  specialist_id: string;
  subjective_notes: string; // Patient symptoms & subjective report
  objective_metrics: string; // ROM, manual muscle testing, goniometer
  assessment_diagnosis: string; // Clinical impression & treatment response
  plan_and_home_exercises: string; // Home exercise program (HEP) & frequency
  pain_level_pre?: number;
  pain_level_post?: number;
  client_visible: boolean; // HIPAA: Only visible to client when true
  is_locked: boolean;
  created_at: string;
  updated_at: string;

  // Joined
  booking?: BookingRecord;
  specialist?: SpecialistProfile & { profile?: UserProfile };
  client?: UserProfile;
}

export interface ProgressRecord {
  id: string;
  client_id: string;
  specialist_id?: string;
  booking_id?: string;
  log_date: string;
  mobility_score: number; // 0 - 100
  pain_score: number; // 0 - 10
  functional_goal: string;
  compliance_percentage: number;
  notes?: string;
  created_at: string;
}

export interface SpecialistEarningsSummary {
  specialist_id: string;
  gross_earnings_cents: number;
  platform_fee_cents: number;
  net_payout_cents: number;
  completed_sessions_count: number;
  pending_payout_cents: number;
  recent_payouts: Array<{
    id: string;
    booking_id: string;
    gross_cents: number;
    fee_cents: number;
    net_cents: number;
    session_date: string;
    client_name: string;
    status: 'transferred' | 'pending';
  }>;
}

export interface AdminPlatformMetrics {
  total_users: number;
  total_clients: number;
  total_specialists: number;
  approved_specialists: number;
  pending_specialists: number;
  total_bookings: number;
  completed_bookings: number;
  gross_gmv_cents: number;
  platform_revenue_cents: number;
  specialist_payouts_cents: number;
  active_service_requests: number;
}
