-- ==============================================================================
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

-- ==============================================================================
-- 3. CORE TABLES
-- ==============================================================================

-- 3.1 PROFILES TABLE (Linked to auth.users)
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

-- 3.2 SPECIALIST PROFILES TABLE (Credentials, Licensing, Geolocation, Specialties)
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

-- 3.3 SPECIALIST AVAILABILITY (Weekly recurring schedule)
create table if not exists public.specialist_availability (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sun, 6=Sat
  start_time time not null,
  end_time time not null check (end_time > start_time),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3.4 CLIENT PROFILES (Medical History, Emergency Contacts, Health Intake)
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

-- 3.5 SERVICE REQUESTS (Clients submit condition, location, preferred time)
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

-- 3.6 SPECIALIST MATCHES (Dispatching requests to nearby qualified specialists)
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

-- 3.7 BOOKINGS (Confirmed sessions, scheduling, provider-agnostic payment status)
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

-- 3.8 SESSION NOTES (Clinical SOAP notes, Protected Health Information / HIPAA)
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

-- 3.9 PROGRESS RECORDS (Tracking recovery, mobility score, pain scale over time)
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

-- 3.10 SUBSCRIPTIONS (Provider-agnostic recurring therapy plans)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  customer_reference_id text,
  subscription_reference_id text,
  tier subscription_tier not null,
  sessions_included_per_month integer not null default 4,
  sessions_used_this_month integer not null default 0,
  status subscription_status not null default 'active',
  current_period_start timestamptz not null,
  current_period_end timestamptz not null check (current_period_end > current_period_start),
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3.11 INVOICES (Billing ledger & notification records)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  booking_id uuid references public.bookings(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  client_id uuid not null references public.profiles(id) on delete cascade,
  specialist_id uuid references public.profiles(id) on delete set null,
  payment_reference_id text,
  amount_subtotal_cents integer not null,
  amount_tax_cents integer not null default 0,
  amount_total_cents integer not null,
  currency text not null default 'usd',
  status invoice_status not null default 'issued',
  pdf_url text,
  email_recipient text not null,
  email_delivery_status text not null default 'pending' check (email_delivery_status in ('pending', 'sent', 'delivered', 'failed')),
  email_sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3.12 SPECIALIST PAYOUTS (Earnings and platform split)
create table if not exists public.specialist_payouts (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  gross_amount_cents integer not null check (gross_amount_cents >= 0),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  net_payout_cents integer not null check (net_payout_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'processing', 'transferred', 'failed')),
  payout_reference_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. PERFORMANCE & GEOSPATIAL INDEXES
-- ==============================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_specialist_profiles_verification on public.specialist_profiles(verification_status);
create index if not exists idx_specialist_profiles_rating on public.specialist_profiles(rating desc);
create index if not exists idx_specialist_availability_spec_day on public.specialist_availability(specialist_id, day_of_week);
create index if not exists idx_service_requests_client on public.service_requests(client_id);
create index if not exists idx_service_requests_status on public.service_requests(status);
create index if not exists idx_specialist_matches_request on public.specialist_matches(request_id);
create index if not exists idx_specialist_matches_spec on public.specialist_matches(specialist_id, status);
create index if not exists idx_bookings_client on public.bookings(client_id);
create index if not exists idx_bookings_specialist on public.bookings(specialist_id);
create index if not exists idx_bookings_payment_status on public.bookings(payment_status);
create index if not exists idx_bookings_dates on public.bookings(scheduled_start, scheduled_end);
create index if not exists idx_session_notes_booking on public.session_notes(booking_id);
create index if not exists idx_session_notes_client on public.session_notes(client_id);
create index if not exists idx_progress_records_client on public.progress_records(client_id, log_date desc);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_booking on public.invoices(booking_id);
create index if not exists idx_specialist_payouts_spec on public.specialist_payouts(specialist_id, status);

-- ==============================================================================
-- 5. SECURITY DEFINER HELPER FUNCTIONS
-- ==============================================================================

-- 5.1 Helper: Check if current user is an Admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 5.2 Helper: Check if current user is a Specialist
create or replace function public.is_specialist()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'specialist'
  );
$$;

-- 5.3 Helper: Check if current user is an Approved Specialist
create or replace function public.is_approved_specialist()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.specialist_profiles sp
    join public.profiles p on p.id = sp.id
    where p.id = auth.uid()
      and p.role = 'specialist'
      and sp.verification_status = 'approved'
  );
$$;

-- 5.4 Helper: Get current user role
create or replace function public.get_auth_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'client'::user_role
  );
$$;

-- 5.5 Trigger: Automatically create public.profiles row on auth.users sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role user_role := 'client';
begin
  if new.raw_user_meta_data->>'role' in ('client', 'specialist', 'admin') then
    assigned_role := (new.raw_user_meta_data->>'role')::user_role;
  end if;

  insert into public.profiles (id, full_name, email, role, avatar_url, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    assigned_role,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone'
  );

  -- If specialist, pre-create empty specialist profile
  if assigned_role = 'specialist' then
    insert into public.specialist_profiles (
      id,
      title,
      license_number,
      license_state,
      verification_status
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'title', 'Licensed Physical Therapist'),
      coalesce(new.raw_user_meta_data->>'license_number', 'PENDING'),
      coalesce(new.raw_user_meta_data->>'license_state', 'CA'),
      'pending'
    );
  end if;

  -- If client, pre-create empty client intake profile
  if assigned_role = 'client' then
    insert into public.client_profiles (id)
    values (new.id);
  end if;

  return new;
end;
$$;

-- Attach trigger to auth.users (Supabase Auth)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5.6 Automated updated_at timestamp trigger
create or replace function public.trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.trigger_set_updated_at();
create trigger set_specialist_profiles_updated_at before update on public.specialist_profiles
  for each row execute function public.trigger_set_updated_at();
create trigger set_client_profiles_updated_at before update on public.client_profiles
  for each row execute function public.trigger_set_updated_at();
create trigger set_service_requests_updated_at before update on public.service_requests
  for each row execute function public.trigger_set_updated_at();
create trigger set_bookings_updated_at before update on public.bookings
  for each row execute function public.trigger_set_updated_at();
create trigger set_session_notes_updated_at before update on public.session_notes
  for each row execute function public.trigger_set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.trigger_set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices
  for each row execute function public.trigger_set_updated_at();

-- ==============================================================================
-- 5.7 ATOMIC FIRST-ACCEPT-WINS RPC FUNCTION (SECURED WITH auth.uid())
-- ==============================================================================
-- Uses auth.uid() directly for security (so a specialist can only accept for themselves).
-- Row lock on service_requests prevents race conditions.
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
  -- 1. Obtain caller identity directly from auth.uid()
  v_specialist_id := auth.uid();
  if v_specialist_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required to accept care requests');
  end if;

  -- 2. Acquire row-level exclusive lock on service_requests to prevent race conditions
  select * into v_req
  from public.service_requests
  where id = p_request_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Service request not found');
  end if;

  -- 3. Verify that request is still open for matching (First Accept Wins guard)
  if v_req.status <> 'open_for_matching' then
    return jsonb_build_object(
      'success', false, 
      'error', 'This request has already been claimed by another specialist or cancelled'
    );
  end if;

  -- 4. Verify that the match exists and belongs to this authenticated specialist
  if not exists (
    select 1 from public.specialist_matches
    where id = p_match_id and specialist_id = v_specialist_id and status = 'pending'
  ) then
    return jsonb_build_object('success', false, 'error', 'Pending match proposal not found or already processed');
  end if;

  -- 5. Get specialist rate and clinic info
  select * into v_spec from public.specialist_profiles where id = v_specialist_id;
  v_hourly_rate := coalesce(v_spec.hourly_rate_cents, 13500);

  -- 6. Calculate session start and end (1 hour duration)
  v_scheduled_start := (v_req.preferred_date || ' ' || 
    case 
      when v_req.preferred_time_slot ilike '%Morning%' then '09:00:00'
      when v_req.preferred_time_slot ilike '%Evening%' then '17:00:00'
      else '14:00:00'
    end)::timestamptz;
  v_scheduled_end := v_scheduled_start + interval '1 hour';

  -- 7. Atomically update request to matched
  update public.service_requests
  set status = 'matched',
      matched_specialist_id = v_specialist_id,
      updated_at = now()
  where id = p_request_id;

  -- 8. Atomically mark winning match as accepted
  update public.specialist_matches
  set status = 'accepted',
      responded_at = now()
  where id = p_match_id;

  -- 9. Atomically expire all other competing matches for this request
  update public.specialist_matches
  set status = 'expired'
  where request_id = p_request_id
    and id <> p_match_id
    and status = 'pending';

  -- 10. Create the confirmed booking (reveals full address upon booking creation)
  v_booking_id := gen_random_uuid();
  insert into public.bookings (
    id,
    request_id,
    client_id,
    specialist_id,
    session_type,
    scheduled_start,
    scheduled_end,
    location_address,
    telehealth_room_url,
    status,
    total_amount_cents,
    currency,
    payment_status
  ) values (
    v_booking_id,
    p_request_id,
    v_req.client_id,
    v_specialist_id,
    v_req.service_type,
    v_scheduled_start,
    v_scheduled_end,
    case 
      when v_req.service_type = 'in_person_clinic' then coalesce(v_spec.clinic_address, 'Specialist Clinic')
      when v_req.service_type = 'home_visit' then v_req.location_address
      else 'Encrypted Telehealth Room'
    end,
    case 
      when v_req.service_type = 'telehealth' then 'https://telehealth.motionx.health/room/' || substr(p_request_id::text, 1, 8)
      else null
    end,
    'confirmed',
    v_hourly_rate,
    'usd',
    'unpaid'
  );

  return jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'message', 'Match accepted successfully. Booking confirmed.'
  );
end;
$$;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.specialist_profiles enable row level security;
alter table public.specialist_availability enable row level security;
alter table public.client_profiles enable row level security;
alter table public.service_requests enable row level security;
alter table public.specialist_matches enable row level security;
alter table public.bookings enable row level security;
alter table public.session_notes enable row level security;
alter table public.progress_records enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.specialist_payouts enable row level security;

-- Profiles Policies
create policy "profiles_select_policy" on public.profiles for select using (auth.uid() = id or public.is_admin() or role = 'specialist');
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (public.is_admin() or (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid())));

-- Specialist Profiles Policies
create policy "specialist_profiles_select" on public.specialist_profiles for select using (verification_status = 'approved' or auth.uid() = id or public.is_admin());
create policy "specialist_profiles_update" on public.specialist_profiles for update using (auth.uid() = id or public.is_admin()) with check (public.is_admin() or (auth.uid() = id and verification_status = (select sp.verification_status from public.specialist_profiles sp where sp.id = auth.uid())));

-- Specialist Availability Policies
create policy "availability_select_all" on public.specialist_availability for select using (true);
create policy "availability_manage_own" on public.specialist_availability for all using (auth.uid() = specialist_id or public.is_admin()) with check (auth.uid() = specialist_id or public.is_admin());

-- Client Profiles Policies (HIPAA Private)
create policy "client_profiles_select" on public.client_profiles for select using (auth.uid() = id or public.is_admin() or exists (select 1 from public.bookings b where b.client_id = client_profiles.id and b.specialist_id = auth.uid() and b.status in ('confirmed', 'in_progress', 'completed')) or exists (select 1 from public.specialist_matches sm join public.service_requests sr on sr.id = sm.request_id where sr.client_id = client_profiles.id and sm.specialist_id = auth.uid() and sm.status in ('pending', 'accepted')));
create policy "client_profiles_update_own" on public.client_profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

-- Service Requests Policies
create policy "service_requests_select" on public.service_requests for select using (auth.uid() = client_id or public.is_admin() or (public.is_approved_specialist() and (status = 'open_for_matching' or exists (select 1 from public.specialist_matches sm where sm.request_id = service_requests.id and sm.specialist_id = auth.uid()))));
create policy "service_requests_insert_client" on public.service_requests for insert with check (auth.uid() = client_id or public.is_admin());
create policy "service_requests_update" on public.service_requests for update using (auth.uid() = client_id or public.is_admin() or auth.uid() = matched_specialist_id);

-- Specialist Matches Policies
create policy "specialist_matches_select" on public.specialist_matches for select using (specialist_id = auth.uid() or public.is_admin() or exists (select 1 from public.service_requests sr where sr.id = specialist_matches.request_id and sr.client_id = auth.uid()));
create policy "specialist_matches_update_specialist" on public.specialist_matches for update using (specialist_id = auth.uid() or public.is_admin()) with check (specialist_id = auth.uid() or public.is_admin());

-- Bookings Policies
create policy "bookings_select_parties" on public.bookings for select using (client_id = auth.uid() or specialist_id = auth.uid() or public.is_admin());
create policy "bookings_insert_authorized" on public.bookings for insert with check (client_id = auth.uid() or public.is_admin());
create policy "bookings_update_parties" on public.bookings for update using (client_id = auth.uid() or specialist_id = auth.uid() or public.is_admin());

-- Session Notes Policies (HIPAA Private: client can only read where client_visible is true)
create policy "session_notes_select" on public.session_notes for select using (specialist_id = auth.uid() or public.is_admin() or (client_id = auth.uid() and client_visible = true));
create policy "session_notes_insert_specialist" on public.session_notes for insert with check ((specialist_id = auth.uid() and public.is_specialist()) or public.is_admin());
create policy "session_notes_update_specialist" on public.session_notes for update using ((specialist_id = auth.uid() and is_locked = false) or public.is_admin());

-- Progress Records Policies
create policy "progress_records_select" on public.progress_records for select using (client_id = auth.uid() or specialist_id = auth.uid() or public.is_admin() or exists (select 1 from public.bookings b where b.client_id = progress_records.client_id and b.specialist_id = auth.uid()));
create policy "progress_records_insert" on public.progress_records for insert with check (client_id = auth.uid() or specialist_id = auth.uid() or public.is_admin());

-- Subscriptions Policies
create policy "subscriptions_select" on public.subscriptions for select using (client_id = auth.uid() or public.is_admin());

-- Invoices Policies
create policy "invoices_select" on public.invoices for select using (client_id = auth.uid() or specialist_id = auth.uid() or public.is_admin());

-- Specialist Payouts Policies
create policy "specialist_payouts_select" on public.specialist_payouts for select using (specialist_id = auth.uid() or public.is_admin());
