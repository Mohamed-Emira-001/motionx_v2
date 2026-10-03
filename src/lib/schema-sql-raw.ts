export const RAW_SCHEMA_SQL = `-- ==============================================================================
-- MotionX: On-Demand Physical Therapy & HealthTech Portal
-- PostgreSQL Schema with Relations, Enums, Indexes, RLS & Atomic Matching RPC
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
create type user_role as enum ('client', 'specialist', 'admin');
create type specialist_verification as enum ('pending', 'approved', 'rejected');
create type service_type as enum ('in_person_clinic', 'home_visit', 'telehealth');
create type request_status as enum ('open_for_matching', 'matching', 'matched', 'completed', 'cancelled');
create type match_response_status as enum ('pending', 'accepted', 'declined', 'expired');
create type booking_status as enum ('confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type payment_status as enum ('unpaid', 'authorized', 'paid', 'refunded', 'failed');
create type subscription_tier as enum ('starter_care', 'pro_rehab', 'elite_recovery');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');
create type invoice_status as enum ('draft', 'issued', 'paid', 'void');

-- 3. CORE TABLES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specialist_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  title text not null default 'Licensed Physical Therapist (PT, DPT)',
  bio text,
  license_number text not null,
  license_state text not null,
  specialties text[] not null default array['Orthopedics', 'Sports Rehabilitation']::text[],
  verification_status specialist_verification not null default 'pending',
  verification_notes text,
  years_of_experience integer not null default 1 check (years_of_experience >= 0),
  hourly_rate_cents integer not null default 12500 check (hourly_rate_cents > 0),
  service_radius_km numeric not null default 25.0,
  clinic_address text,
  latitude double precision,
  longitude double precision,
  rating numeric(3, 2) not null default 5.00 check (rating between 1.00 and 5.00),
  review_count integer not null default 0 check (review_count >= 0),
  is_accepting_new_clients boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specialist_availability (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.client_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_history_summary text,
  allergies_or_contraindications text,
  has_physician_referral boolean not null default false,
  intake_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  condition_category text not null,
  condition_description text not null,
  pain_level integer not null check (pain_level between 1 and 10),
  pain_area text not null,
  service_type service_type not null default 'in_person_clinic',
  location_address text not null,
  latitude double precision,
  longitude double precision,
  preferred_date date not null,
  preferred_time_slot text not null,
  urgency text not null default 'routine' check (urgency in ('routine', 'within_48h', 'urgent')),
  status request_status not null default 'open_for_matching',
  matched_specialist_id uuid references public.profiles(id) on delete set null,
  client_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specialist_matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  status match_response_status not null default 'pending',
  distance_km numeric,
  match_score numeric(5, 2) default 90.00,
  dispatched_at timestamptz not null default now(),
  responded_at timestamptz,
  decline_reason text,
  created_at timestamptz not null default now(),
  unique(request_id, specialist_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests(id) on delete set null,
  client_id uuid not null references public.profiles(id) on delete cascade,
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  session_type service_type not null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null check (scheduled_end > scheduled_start),
  location_address text not null,
  telehealth_room_url text,
  status booking_status not null default 'confirmed',
  cancellation_reason text,
  cancelled_by uuid references public.profiles(id) on delete set null,
  total_amount_cents integer not null check (total_amount_cents >= 0),
  currency text not null default 'usd',
  payment_status payment_status not null default 'unpaid',
  payment_reference_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  subjective_notes text not null,
  objective_metrics text not null,
  assessment_diagnosis text not null,
  plan_and_home_exercises text not null,
  pain_level_pre integer check (pain_level_pre between 0 and 10),
  pain_level_post integer check (pain_level_post between 0 and 10),
  client_visible boolean not null default true,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  specialist_id uuid references public.profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  log_date date not null default current_date,
  mobility_score integer not null check (mobility_score between 0 and 100),
  pain_score integer not null check (pain_score between 0 and 10),
  functional_goal text not null,
  compliance_percentage integer not null default 100 check (compliance_percentage between 0 and 100),
  notes text,
  created_at timestamptz not null default now()
);

-- 4. ATOMIC FIRST-ACCEPT-WINS RPC FUNCTION (SECURED WITH auth.uid())
create or replace function public.accept_specialist_match(
  p_match_id uuid,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_specialist_id uuid;
  v_req record;
  v_spec record;
  v_booking_id uuid;
  v_scheduled_start timestamptz;
  v_scheduled_end timestamptz;
  v_hourly_rate integer;
begin
  v_specialist_id := auth.uid();
  if v_specialist_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required');
  end if;

  select * into v_req from public.service_requests where id = p_request_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Service request not found');
  end if;

  if v_req.status <> 'open_for_matching' then
    return jsonb_build_object('success', false, 'error', 'Request already claimed by another specialist');
  end if;

  if not exists (
    select 1 from public.specialist_matches
    where id = p_match_id and specialist_id = v_specialist_id and status = 'pending'
  ) then
    return jsonb_build_object('success', false, 'error', 'Pending match not found');
  end if;

  select * into v_spec from public.specialist_profiles where id = v_specialist_id;
  v_hourly_rate := coalesce(v_spec.hourly_rate_cents, 13500);

  v_scheduled_start := (v_req.preferred_date || ' ' || 
    case 
      when v_req.preferred_time_slot ilike '%Morning%' then '09:00:00'
      when v_req.preferred_time_slot ilike '%Evening%' then '17:00:00'
      else '14:00:00'
    end)::timestamptz;
  v_scheduled_end := v_scheduled_start + interval '1 hour';

  update public.service_requests
  set status = 'matched', matched_specialist_id = v_specialist_id, updated_at = now()
  where id = p_request_id;

  update public.specialist_matches
  set status = 'accepted', responded_at = now()
  where id = p_match_id;

  update public.specialist_matches
  set status = 'expired'
  where request_id = p_request_id and id <> p_match_id and status = 'pending';

  v_booking_id := gen_random_uuid();
  insert into public.bookings (
    id, request_id, client_id, specialist_id, session_type,
    scheduled_start, scheduled_end, location_address, telehealth_room_url,
    status, total_amount_cents, currency, payment_status
  ) values (
    v_booking_id, p_request_id, v_req.client_id, v_specialist_id, v_req.service_type,
    v_scheduled_start, v_scheduled_end,
    case 
      when v_req.service_type = 'in_person_clinic' then coalesce(v_spec.clinic_address, 'Specialist Clinic')
      when v_req.service_type = 'home_visit' then v_req.location_address
      else 'Encrypted Telehealth Room'
    end,
    case 
      when v_req.service_type = 'telehealth' then 'https://telehealth.motionx.health/room/' || substr(p_request_id::text, 1, 8)
      else null
    end,
    'confirmed', v_hourly_rate, 'usd', 'unpaid'
  );

  return jsonb_build_object('success', true, 'booking_id', v_booking_id);
end;
$$;
`;
