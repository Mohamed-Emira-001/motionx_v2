import { SpecialistProfile, UserProfile } from './auth';

export type ServiceType = 'in_person_clinic' | 'home_visit' | 'telehealth';
export type RequestStatus = 'open_for_matching' | 'matching' | 'matched' | 'completed' | 'cancelled';
export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type UrgencyLevel = 'routine' | 'within_48h' | 'urgent';

export interface ServiceRequest {
  id: string;
  client_id: string;
  condition_category: string;
  condition_description: string;
  pain_level: number; // 1 - 10
  pain_area: string; // Anatomical area
  service_type: ServiceType;
  location_address: string;
  latitude?: number;
  longitude?: number;
  preferred_date: string; // YYYY-MM-DD
  preferred_time_slot: string; // e.g. 'Morning (08:00 - 12:00)'
  urgency: UrgencyLevel;
  status: RequestStatus;
  matched_specialist_id?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;

  // Joined / computed fields
  client?: UserProfile;
  matched_specialist?: SpecialistProfile & { profile?: UserProfile };
  matches_count?: number;
  pending_matches_count?: number;
}

export interface SpecialistMatch {
  id: string;
  request_id: string;
  specialist_id: string;
  status: MatchStatus;
  distance_km: number;
  match_score: number; // 0 - 100
  dispatched_at: string;
  responded_at?: string;
  decline_reason?: string;
  created_at: string;

  // Joined fields
  request?: ServiceRequest;
  specialist?: SpecialistProfile & { profile?: UserProfile };
}

export interface BookingRecord {
  id: string;
  request_id?: string;
  client_id: string;
  specialist_id: string;
  session_type: ServiceType;
  scheduled_start: string;
  scheduled_end: string;
  location_address: string;
  telehealth_room_url?: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  total_amount_cents: number;
  currency: string;
  payment_status: 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';
  payment_reference_id?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  client?: UserProfile;
  specialist?: SpecialistProfile & { profile?: UserProfile };
}

export interface CreateRequestInput {
  condition_category: string;
  condition_description: string;
  pain_level: number;
  pain_area: string;
  service_type: ServiceType;
  location_address: string;
  latitude?: number;
  longitude?: number;
  preferred_date: string;
  preferred_time_slot: string;
  urgency?: UrgencyLevel;
  client_notes?: string;
}
