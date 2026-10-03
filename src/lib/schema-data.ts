export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignTable?: string;
  description: string;
  badge?: string;
}

export interface TableDef {
  id: string;
  name: string;
  category: 'core' | 'matching' | 'clinical' | 'billing';
  description: string;
  hipaaCompliant?: boolean;
  columns: ColumnDef[];
  rlsPolicies: {
    name: string;
    action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
    rolesAllowed: ('client' | 'specialist' | 'admin' | 'public')[];
    rule: string;
  }[];
}

export const SCHEMA_TABLES: TableDef[] = [
  {
    id: 'profiles',
    name: 'public.profiles',
    category: 'core',
    description: 'Central user identity linked directly to Supabase auth.users with user role definitions.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: true, foreignTable: 'auth.users(id)', description: 'Primary key referencing auth.users' },
      { name: 'role', type: 'user_role (client, specialist, admin)', nullable: false, description: 'Role flag determining system access and navigation' },
      { name: 'full_name', type: 'text', nullable: false, description: 'Legal name of the user' },
      { name: 'email', type: 'text', nullable: false, description: 'User email address synced with auth account' },
      { name: 'phone', type: 'text', nullable: true, description: 'Primary contact phone for SMS alerts' },
      { name: 'avatar_url', type: 'text', nullable: true, description: 'Cloud storage URL for profile photo' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Timestamp when account was created' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, description: 'Auto-updated modification timestamp' },
    ],
    rlsPolicies: [
      { name: 'profiles_select_policy', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'auth.uid() = id OR is_admin() OR role = "specialist"' },
      { name: 'profiles_update_own', action: 'UPDATE', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'auth.uid() = id OR is_admin() (role change restricted to admin)' },
    ],
  },
  {
    id: 'specialist_profiles',
    name: 'public.specialist_profiles',
    category: 'core',
    description: 'Physical therapy licenses, credentials, clinical specialties, geolocation, and admin verification status.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: true, foreignTable: 'profiles(id)', description: 'Foreign key to public.profiles' },
      { name: 'title', type: 'text', nullable: false, description: 'e.g. Doctor of Physical Therapy (DPT), OCS' },
      { name: 'bio', type: 'text', nullable: true, description: 'Clinical background & therapeutic philosophy' },
      { name: 'license_number', type: 'text', nullable: false, description: 'State PT Board license identifier' },
      { name: 'license_state', type: 'text', nullable: false, description: 'Jurisdiction state code (e.g., CA, NY)' },
      { name: 'specialties', type: 'text[]', nullable: false, description: 'Array of specialties (Orthopedics, Sports Rehab, Neurological, etc.)' },
      { name: 'verification_status', type: 'specialist_verification', nullable: false, description: 'Admin status: pending, approved, or rejected' },
      { name: 'years_of_experience', type: 'integer', nullable: false, description: 'Number of active clinical practice years' },
      { name: 'hourly_rate_cents', type: 'integer', nullable: false, description: 'Rate in cents (e.g. 12500 = $125.00/session)' },
      { name: 'service_radius_km', type: 'numeric', nullable: false, description: 'Maximum mobile travel radius for home visits' },
      { name: 'clinic_address', type: 'text', nullable: true, description: 'Physical clinic location for in-person appointments' },
      { name: 'latitude / longitude', type: 'double precision', nullable: true, description: 'Coordinates for spatial matching' },
      { name: 'rating', type: 'numeric(3, 2)', nullable: false, description: 'Average client satisfaction score (1.00 - 5.00)' },
      { name: 'review_count', type: 'integer', nullable: false, description: 'Count of completed client reviews' },
      { name: 'is_accepting_new_clients', type: 'boolean', nullable: false, description: 'Toggles intake availability' },
    ],
    rlsPolicies: [
      { name: 'specialist_profiles_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin', 'public'], rule: 'verification_status = "approved" OR auth.uid() = id OR is_admin()' },
      { name: 'specialist_profiles_update', action: 'UPDATE', rolesAllowed: ['specialist', 'admin'], rule: 'auth.uid() = id (excluding verification_status) OR is_admin()' },
    ],
  },
  {
    id: 'specialist_availability',
    name: 'public.specialist_availability',
    category: 'core',
    description: 'Weekly recurring working shifts and appointment slots for physical therapists.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Unique availability slot ID' },
      { name: 'specialist_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Reference to specialist' },
      { name: 'day_of_week', type: 'integer (0-6)', nullable: false, description: '0 = Sunday, 1 = Monday ... 6 = Saturday' },
      { name: 'start_time', type: 'time', nullable: false, description: 'Shift start time (e.g. 08:00:00)' },
      { name: 'end_time', type: 'time', nullable: false, description: 'Shift end time (e.g. 17:00:00)' },
      { name: 'is_active', type: 'boolean', nullable: false, description: 'Enables or suspends slot recurrence' },
    ],
    rlsPolicies: [
      { name: 'availability_select_all', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'true (open for client scheduling)' },
      { name: 'availability_manage_own', action: 'ALL', rolesAllowed: ['specialist', 'admin'], rule: 'auth.uid() = specialist_id OR is_admin()' },
    ],
  },
  {
    id: 'client_profiles',
    name: 'public.client_profiles',
    category: 'clinical',
    description: 'Client health history, contraindications, emergency contacts, and intake questionnaire status.',
    hipaaCompliant: true,
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, isForeign: true, foreignTable: 'profiles(id)', description: 'Primary key referencing client profile' },
      { name: 'date_of_birth', type: 'date', nullable: true, description: 'Client birthdate for clinical age assessment' },
      { name: 'emergency_contact_name', type: 'text', nullable: true, description: 'Emergency contact individual' },
      { name: 'emergency_contact_phone', type: 'text', nullable: true, description: 'Emergency contact telephone' },
      { name: 'medical_history_summary', type: 'text', nullable: true, description: 'Pre-existing musculoskeletal or neurological conditions' },
      { name: 'allergies_or_contraindications', type: 'text', nullable: true, description: 'Latex allergies, cardiac implants, surgical pins' },
      { name: 'has_physician_referral', type: 'boolean', nullable: false, description: 'Indicates if physician Rx is on file' },
      { name: 'intake_completed', type: 'boolean', nullable: false, description: 'Flag confirming mandatory health questionnaire completed' },
    ],
    rlsPolicies: [
      { name: 'client_profiles_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'auth.uid() = id OR is_admin() OR treating_specialist_with_active_booking' },
      { name: 'client_profiles_update_own', action: 'UPDATE', rolesAllowed: ['client', 'admin'], rule: 'auth.uid() = id OR is_admin()' },
    ],
  },
  {
    id: 'service_requests',
    name: 'public.service_requests',
    category: 'matching',
    description: 'On-demand physical therapy requests submitted by clients with condition, location, and preferred time.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Request unique identifier' },
      { name: 'client_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Requesting client' },
      { name: 'condition_category', type: 'text', nullable: false, description: 'e.g. Spine / Lower Back, Post-Op Knee, Sports Injury' },
      { name: 'condition_description', type: 'text', nullable: false, description: 'Detailed symptoms, onset, and functional impairment' },
      { name: 'pain_level', type: 'integer (1-10)', nullable: false, description: 'Self-reported visual analogue pain scale' },
      { name: 'pain_area', type: 'text', nullable: false, description: 'Anatomical area (e.g. Lumbar, Cervical, Right ACL)' },
      { name: 'service_type', type: 'service_type', nullable: false, description: 'in_person_clinic, home_visit, or telehealth' },
      { name: 'location_address', type: 'text', nullable: false, description: 'Patient address or desired clinic vicinity' },
      { name: 'latitude / longitude', type: 'double precision', nullable: true, description: 'Geocoded coordinates for matching engine' },
      { name: 'preferred_date', type: 'date', nullable: false, description: 'Requested appointment calendar date' },
      { name: 'preferred_time_slot', type: 'text', nullable: false, description: 'Morning (08-12), Afternoon (12-16), Evening (16-20)' },
      { name: 'urgency', type: 'text', nullable: false, description: 'routine, within_48h, or urgent' },
      { name: 'status', type: 'request_status', nullable: false, description: 'open_for_matching, matching, matched, completed, cancelled' },
      { name: 'matched_specialist_id', type: 'uuid', nullable: true, isForeign: true, foreignTable: 'profiles(id)', description: 'Assigned PT specialist' },
    ],
    rlsPolicies: [
      { name: 'service_requests_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'auth.uid() = client_id OR is_admin() OR (is_approved_specialist() AND open_for_matching)' },
      { name: 'service_requests_insert_client', action: 'INSERT', rolesAllowed: ['client', 'admin'], rule: 'auth.uid() = client_id OR is_admin()' },
      { name: 'service_requests_update', action: 'UPDATE', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'auth.uid() = client_id OR is_admin() OR auth.uid() = matched_specialist_id' },
    ],
  },
  {
    id: 'specialist_matches',
    name: 'public.specialist_matches',
    category: 'matching',
    description: 'Intelligent dispatch records for routing service requests to specialists to accept or decline.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Match proposal ID' },
      { name: 'request_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'service_requests(id)', description: 'Target service request' },
      { name: 'specialist_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Dispatched physical therapist' },
      { name: 'status', type: 'match_response_status', nullable: false, description: 'pending, accepted, declined, expired' },
      { name: 'distance_km', type: 'numeric', nullable: true, description: 'Calculated travel distance between client and therapist' },
      { name: 'match_score', type: 'numeric(5, 2)', nullable: false, description: 'AI/Algorithmic compatibility score (0-100%)' },
      { name: 'dispatched_at', type: 'timestamptz', nullable: false, description: 'Timestamp when specialist was notified' },
      { name: 'responded_at', type: 'timestamptz', nullable: true, description: 'Timestamp of acceptance or decline' },
      { name: 'decline_reason', type: 'text', nullable: true, description: 'Optional feedback on decline reason' },
    ],
    rlsPolicies: [
      { name: 'specialist_matches_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'specialist_id = auth.uid() OR is_admin() OR is_request_owner' },
      { name: 'specialist_matches_update_specialist', action: 'UPDATE', rolesAllowed: ['specialist', 'admin'], rule: 'specialist_id = auth.uid() OR is_admin()' },
    ],
  },
  {
    id: 'bookings',
    name: 'public.bookings',
    category: 'matching',
    description: 'Confirmed physical therapy appointments, scheduled times, meeting links, and booking payment status.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Booking unique reference' },
      { name: 'request_id', type: 'uuid', nullable: true, isForeign: true, foreignTable: 'service_requests(id)', description: 'Originating service request' },
      { name: 'client_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Client receiving therapy' },
      { name: 'specialist_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Physical therapist delivering care' },
      { name: 'session_type', type: 'service_type', nullable: false, description: 'in_person_clinic, home_visit, or telehealth' },
      { name: 'scheduled_start', type: 'timestamptz', nullable: false, description: 'Session start date and time' },
      { name: 'scheduled_end', type: 'timestamptz', nullable: false, description: 'Session end date and time' },
      { name: 'location_address', type: 'text', nullable: false, description: 'Clinic location or client residence address' },
      { name: 'telehealth_room_url', type: 'text', nullable: true, description: 'Encrypted WebRTC / video conference link' },
      { name: 'status', type: 'booking_status', nullable: false, description: 'confirmed, in_progress, completed, cancelled, no_show' },
      { name: 'total_amount_cents', type: 'integer', nullable: false, description: 'Total price in cents' },
      { name: 'payment_status', type: 'payment_status', nullable: false, description: 'unpaid, authorized, paid, refunded, failed' },
      { name: 'payment_reference_id', type: 'text', nullable: true, description: 'Payment provider transaction reference' },
    ],
    rlsPolicies: [
      { name: 'bookings_select_parties', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'client_id = auth.uid() OR specialist_id = auth.uid() OR is_admin()' },
      { name: 'bookings_insert_authorized', action: 'INSERT', rolesAllowed: ['client', 'admin'], rule: 'client_id = auth.uid() OR is_admin()' },
      { name: 'bookings_update_parties', action: 'UPDATE', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'client_id = auth.uid() OR specialist_id = auth.uid() OR is_admin()' },
    ],
  },
  {
    id: 'session_notes',
    name: 'public.session_notes',
    category: 'clinical',
    description: 'Clinical SOAP notes (Subjective, Objective, Assessment, Plan), pain levels, and home exercise prescription.',
    hipaaCompliant: true,
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Clinical note identifier' },
      { name: 'booking_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'bookings(id)', description: 'Associated appointment' },
      { name: 'client_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Patient receiving therapy' },
      { name: 'specialist_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Authoring physical therapist' },
      { name: 'subjective_notes', type: 'text', nullable: false, description: 'Patient symptoms, functional difficulties, pain report' },
      { name: 'objective_metrics', type: 'text', nullable: false, description: 'Goniometer ROM, manual muscle test (MMT), palpation' },
      { name: 'assessment_diagnosis', type: 'text', nullable: false, description: 'Therapist clinical impression and recovery trajectory' },
      { name: 'plan_and_home_exercises', type: 'text', nullable: false, description: 'Home exercise program (HEP) and next visit goals' },
      { name: 'pain_level_pre / post', type: 'integer (0-10)', nullable: true, description: 'Pain level recorded before and after session' },
      { name: 'client_visible', type: 'boolean', nullable: false, description: 'Toggles client portal visibility (default: true)' },
      { name: 'is_locked', type: 'boolean', nullable: false, description: 'Locks chart after electronic clinical sign-off' },
    ],
    rlsPolicies: [
      { name: 'session_notes_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'specialist_id = auth.uid() OR is_admin() OR (client_id = auth.uid() AND client_visible = true)' },
      { name: 'session_notes_insert_specialist', action: 'INSERT', rolesAllowed: ['specialist', 'admin'], rule: 'specialist_id = auth.uid() AND is_specialist() OR is_admin()' },
      { name: 'session_notes_update_specialist', action: 'UPDATE', rolesAllowed: ['specialist', 'admin'], rule: '(specialist_id = auth.uid() AND is_locked = false) OR is_admin()' },
    ],
  },
  {
    id: 'progress_records',
    name: 'public.progress_records',
    category: 'clinical',
    description: 'Patient recovery tracking: mobility score (0-100), pain score (0-10), goal compliance, and milestone metrics.',
    hipaaCompliant: true,
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Record ID' },
      { name: 'client_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Patient profile' },
      { name: 'specialist_id', type: 'uuid', nullable: true, isForeign: true, foreignTable: 'profiles(id)', description: 'Evaluating specialist' },
      { name: 'log_date', type: 'date', nullable: false, description: 'Date of measurement' },
      { name: 'mobility_score', type: 'integer (0-100)', nullable: false, description: 'Standardized functional mobility index' },
      { name: 'pain_score', type: 'integer (0-10)', nullable: false, description: 'VAS pain severity' },
      { name: 'functional_goal', type: 'text', nullable: false, description: 'e.g. Walking 2 miles without lumbar ache' },
      { name: 'compliance_percentage', type: 'integer (0-100)', nullable: false, description: 'Adherence to prescribed home exercise program' },
      { name: 'notes', type: 'text', nullable: true, description: 'Patient or therapist observational notes' },
    ],
    rlsPolicies: [
      { name: 'progress_records_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'client_id = auth.uid() OR specialist_id = auth.uid() OR is_admin() OR treating_specialist' },
      { name: 'progress_records_insert', action: 'INSERT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'client_id = auth.uid() OR specialist_id = auth.uid() OR is_admin()' },
    ],
  },
  {
    id: 'subscriptions',
    name: 'public.subscriptions',
    category: 'billing',
    description: 'Recurring care memberships (Starter, Pro Rehab, Elite Recovery) with session allowances.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Subscription ID' },
      { name: 'client_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Subscribing client' },
      { name: 'customer_reference_id', type: 'text', nullable: false, description: 'Payment customer identifier' },
      { name: 'subscription_reference_id', type: 'text', nullable: false, description: 'Payment subscription identifier' },
      { name: 'tier', type: 'subscription_tier', nullable: false, description: 'starter_care, pro_rehab, elite_recovery' },
      { name: 'sessions_included_per_month', type: 'integer', nullable: false, description: 'Monthly allowance (e.g. 2, 4, 8)' },
      { name: 'sessions_used_this_month', type: 'integer', nullable: false, description: 'Sessions utilized in current billing cycle' },
      { name: 'status', type: 'subscription_status', nullable: false, description: 'active, past_due, canceled, trialing' },
      { name: 'current_period_start / end', type: 'timestamptz', nullable: false, description: 'Billing cycle timestamps' },
      { name: 'cancel_at_period_end', type: 'boolean', nullable: false, description: 'Pending cancellation state' },
    ],
    rlsPolicies: [
      { name: 'subscriptions_select', action: 'SELECT', rolesAllowed: ['client', 'admin'], rule: 'client_id = auth.uid() OR is_admin()' },
    ],
  },
  {
    id: 'invoices',
    name: 'public.invoices',
    category: 'billing',
    description: 'Itemized invoices synced with payment records, auto-generated PDF receipts, and Resend email transmission status.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Invoice ID' },
      { name: 'invoice_number', type: 'text', nullable: false, description: 'Unique human-readable code (e.g. INV-2026-0042)' },
      { name: 'booking_id', type: 'uuid', nullable: true, isForeign: true, foreignTable: 'bookings(id)', description: 'Associated physical therapy session' },
      { name: 'subscription_id', type: 'uuid', nullable: true, isForeign: true, foreignTable: 'subscriptions(id)', description: 'Associated membership tier' },
      { name: 'client_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Billed client' },
      { name: 'specialist_id', type: 'uuid', nullable: true, isForeign: true, foreignTable: 'profiles(id)', description: 'Earning specialist' },
      { name: 'amount_total_cents', type: 'integer', nullable: false, description: 'Final charge amount in cents' },
      { name: 'status', type: 'invoice_status', nullable: false, description: 'draft, issued, paid, void' },
      { name: 'pdf_url', type: 'text', nullable: true, description: 'Cloud storage URL for downloadable PDF invoice' },
      { name: 'email_recipient', type: 'text', nullable: false, description: 'Client email for Resend dispatch' },
      { name: 'resend_email_id', type: 'text', nullable: true, description: 'Resend API message delivery identifier' },
      { name: 'email_delivery_status', type: 'text', nullable: false, description: 'pending, sent, delivered, failed' },
      { name: 'paid_at', type: 'timestamptz', nullable: true, description: 'Payment completion timestamp' },
    ],
    rlsPolicies: [
      { name: 'invoices_select', action: 'SELECT', rolesAllowed: ['client', 'specialist', 'admin'], rule: 'client_id = auth.uid() OR specialist_id = auth.uid() OR is_admin()' },
    ],
  },
  {
    id: 'specialist_payouts',
    name: 'public.specialist_payouts',
    category: 'billing',
    description: 'Therapist earnings ledger, platform commission deductions, and payout transfers.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimary: true, description: 'Payout record ID' },
      { name: 'specialist_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'profiles(id)', description: 'Recipient physical therapist' },
      { name: 'booking_id', type: 'uuid', nullable: false, isForeign: true, foreignTable: 'bookings(id)', description: 'Completed therapy booking' },
      { name: 'gross_amount_cents', type: 'integer', nullable: false, description: 'Client fee (e.g. $150.00)' },
      { name: 'platform_fee_cents', type: 'integer', nullable: false, description: 'Platform fee 15% (e.g. $22.50)' },
      { name: 'net_payout_cents', type: 'integer', nullable: false, description: 'Net earnings transferred to therapist ($127.50)' },
      { name: 'status', type: 'text', nullable: false, description: 'pending, processing, transferred, failed' },
      { name: 'payout_reference_id', type: 'text', nullable: true, description: 'Payout transfer reference' },
    ],
    rlsPolicies: [
      { name: 'specialist_payouts_select', action: 'SELECT', rolesAllowed: ['specialist', 'admin'], rule: 'specialist_id = auth.uid() OR is_admin()' },
    ],
  },
];

export const STEP_ROADMAP = [
  { step: 1, title: 'Supabase SQL Schema & RLS', desc: '12 relational tables, enums, triggers, indexes, and comprehensive RLS policies.', status: 'completed' },
  { step: 2, title: 'Auth & Role-Based Routing', desc: 'Client, Specialist & Admin authentication, signup flow, and route protection.', status: 'completed' },
  { step: 3, title: 'Request & Matching Flow', desc: 'On-demand client requests, geolocation & specialty dispatch, atomic accept logic.', status: 'completed' },
  { step: 4, title: 'Role Dashboards & Agnostic Payments', desc: 'Client progress & notes, Specialist schedule & earnings, Admin approval & mark-as-paid desk.', status: 'completed' },
  { step: 5, title: 'Automated Invoicing & Gateways', desc: 'Custom payment provider integration, automated PDF invoice generation & Resend email delivery.', status: 'pending' },
];
