# MotionX - On-Demand Physical Therapy & HealthTech Portal

**MotionX** is a full-stack, on-demand physical therapy platform connecting patients with licensed physical therapy specialists. The platform features intelligent geospatial dispatch, atomic matching with race condition guards, HIPAA-compliant clinical SOAP documentation, real-time recovery analytics, and a provider-agnostic payment architecture.

---

## 🚀 Key Features & Capabilities

### 1. Role-Based Access Control (RBAC) & Protected Portals
- **Client / Patient Portal (`/client`)**: Submit service requests, track matching status in real time, view upcoming and past sessions, review HIPAA-filtered SOAP documentation (`client_visible = true`), and monitor pain/mobility recovery trends.
- **PT Specialist Portal (`/specialist`)**: View incoming dispatch requests in real-time, inspect approximate patient vicinity prior to acceptance, accept matches atomically, access full service addresses upon confirmation, manage schedule calendars, write/edit clinical SOAP charts, and track session payouts.
- **Admin Portal (`/admin`)**: Monitor platform metrics (active users, total bookings, gross volume, active requests), review and approve/reject specialist medical licensure, and manage booking payment statuses with a provider-agnostic "Mark as Paid" action.

### 2. Atomic First-Accept-Wins Dispatch (`accept_specialist_match`)
- Prevents double-booking race conditions when multiple specialists receive a match proposal.
- Executes as a PostgreSQL stored procedure (`SECURITY DEFINER`) directly querying `auth.uid()` for authenticated specialist validation.
- Employs `SELECT FOR UPDATE` row-level locking on `service_requests` to guarantee only the first accepting specialist claims the appointment.
- Approximate client neighborhood is shown prior to acceptance; full address and patient intake are unveiled only upon booking confirmation.

### 3. Provider-Agnostic Payment Layer
- Decoupled from specific payment vendors.
- Every booking maintains a direct `payment_status` state (`unpaid`, `authorized`, `paid`, `refunded`, `failed`) and optional `payment_reference_id`.
- Built-in administrative "Mark as Paid" console action allows operators to settle bookings on demand.

### 4. Supabase Backend & HIPAA Data Security
- 100% real Supabase integration (`@supabase/supabase-js`).
- 12 PostgreSQL relational tables with 24 Row Level Security (RLS) policies enforcing clinical data privacy.
- License board approval gate: newly registered physical therapists are held in `pending` status with an awaiting approval screen until administrator review.

---

## ⚙️ Environment Variables

Configure the following variables in your `.env` file (see `.env.example` for details):

```bash
# Supabase Database & Authentication
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Transactional Email & Notifications (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="MotionX Billing <billing@motionx.health>"
```

---

## 📦 Database Schema Setup

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Copy the complete migration script located at `/supabase/schema.sql` (or export it directly from the in-app **Database & RLS** explorer).
4. Run the script to generate all 12 tables, custom enums, automated timestamps, the atomic `accept_specialist_match` function, and all 24 RLS policies.
