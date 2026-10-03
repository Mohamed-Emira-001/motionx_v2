export type UserRole = 'client' | 'specialist' | 'admin';

export type SpecialistVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SpecialistProfile {
  id: string;
  title: string;
  bio?: string;
  license_number: string;
  license_state: string;
  specialties: string[];
  verification_status: SpecialistVerificationStatus;
  verification_notes?: string;
  years_of_experience: number;
  hourly_rate_cents: number;
  service_radius_km: number;
  clinic_address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  review_count: number;
  is_accepting_new_clients: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history_summary?: string;
  allergies_or_contraindications?: string;
  has_physician_referral: boolean;
  intake_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Strictly allow ONLY 'client' or 'specialist' during client-side registration
export type ClientAllowedRole = 'client' | 'specialist';

export interface ClientSignUpData {
  role: 'client';
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  primary_condition?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface SpecialistSignUpData {
  role: 'specialist';
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  title: string;
  license_number: string;
  license_state: string;
  specialties: string[];
  years_of_experience: number;
  hourly_rate_cents: number;
  clinic_address?: string;
  bio?: string;
}

export type SignUpData = ClientSignUpData | SpecialistSignUpData;
