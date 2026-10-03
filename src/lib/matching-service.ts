import { supabase } from './supabase';
import { 
  ServiceRequest, 
  SpecialistMatch, 
  BookingRecord, 
  CreateRequestInput, 
  MatchStatus,
  RequestStatus
} from '../types/service-requests';
import { SpecialistProfile, UserProfile } from '../types/auth';

// Helper: Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Requirement (b): Show specialists only approximate area until they accept;
 * reveal full address after acceptance!
 */
export function formatApproximateLocation(fullAddress: string): string {
  if (!fullAddress || fullAddress.includes('Telehealth')) {
    return 'Telehealth Secure Room';
  }

  const parts = fullAddress.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    const cityState = parts.slice(parts.length - 2).join(', ');
    const street = parts[0];
    const streetNameOnly = street.replace(/^\d+[\s\w-]*\s+/, '');
    return `${streetNameOnly} vicinity, ${cityState}`;
  }

  return 'Approximate client neighborhood (~2–5 km radius)';
}

/**
 * 1. Submit a Service Request & Calculate Top Matches
 * Saves to service_requests table with status 'open_for_matching',
 * discovers approved specialists by specialty, service type, and distance,
 * and creates specialist_matches rows.
 */
export async function createServiceRequest(
  clientId: string,
  input: CreateRequestInput
): Promise<{ success: boolean; request?: ServiceRequest; error?: string }> {
  const reqLat = input.latitude || 37.7749;
  const reqLon = input.longitude || -122.4194;

  try {
    // 1. Insert into real Supabase service_requests table
    const { data: newReq, error: reqError } = await supabase
      .from('service_requests')
      .insert({
        client_id: clientId,
        condition_category: input.condition_category,
        condition_description: input.condition_description,
        pain_level: input.pain_level,
        pain_area: input.pain_area,
        service_type: input.service_type,
        location_address: input.location_address,
        latitude: reqLat,
        longitude: reqLon,
        preferred_date: input.preferred_date,
        preferred_time_slot: input.preferred_time_slot,
        urgency: input.urgency || 'routine',
        status: 'open_for_matching',
        client_notes: input.client_notes,
      })
      .select()
      .single();

    if (reqError) {
      return { success: false, error: reqError.message };
    }

    const requestId = newReq.id;

    // 2. Query approved specialists from real Supabase specialist_profiles table
    const { data: specialists, error: specError } = await supabase
      .from('specialist_profiles')
      .select(`
        *,
        profiles!inner (
          id, full_name, email, phone, avatar_url, role
        )
      `)
      .eq('verification_status', 'approved')
      .eq('is_accepting_new_clients', true);

    if (specialists && specialists.length > 0) {
      // Score each candidate
      const scoredSpecialists = specialists.map((spec: any) => {
        let score = 70;
        const categoryLower = input.condition_category.toLowerCase();
        const areaLower = input.pain_area.toLowerCase();
        const specialtiesArray = spec.specialties || [];

        const hasSpecialtyMatch = specialtiesArray.some((s: string) => {
          const sLower = s.toLowerCase();
          return (
            categoryLower.includes(sLower) || 
            sLower.includes(categoryLower) ||
            areaLower.includes(sLower) ||
            sLower.includes(areaLower)
          );
        });

        if (hasSpecialtyMatch) score += 20;

        let distKm = 3.5;
        if (spec.latitude && spec.longitude) {
          distKm = calculateDistanceKm(reqLat, reqLon, spec.latitude, spec.longitude);
        }

        if (distKm <= (spec.service_radius_km || 25)) {
          score += 5;
        } else if (input.service_type !== 'telehealth') {
          score -= 15;
        }

        if (spec.rating >= 4.9) score += 5;
        if (spec.years_of_experience >= 5) score += 3;
        score = Math.min(99, Math.max(60, score));

        return {
          specialist_id: spec.id,
          distance_km: distKm,
          match_score: score,
        };
      });

      scoredSpecialists.sort((a, b) => b.match_score - a.match_score);
      const topMatches = scoredSpecialists.slice(0, 3);

      if (topMatches.length > 0) {
        await supabase.from('specialist_matches').insert(
          topMatches.map(m => ({
            request_id: requestId,
            specialist_id: m.specialist_id,
            status: 'pending',
            distance_km: m.distance_km,
            match_score: m.match_score,
          }))
        );
      }
    }

    return { success: true, request: newReq as ServiceRequest };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Fetch Client Service Requests with Live Status directly from Supabase
 */
export async function fetchClientRequests(clientId: string): Promise<ServiceRequest[]> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        specialist_matches (*),
        matched_specialist:specialist_profiles!matched_specialist_id (
          id, title, license_number, license_state, specialties, rating, review_count, hourly_rate_cents,
          profile:profiles ( id, full_name, email, avatar_url )
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching client requests:', error.message);
      return [];
    }

    return (data || []).map((req: any) => ({
      ...req,
      matches_count: req.specialist_matches ? req.specialist_matches.length : 0,
      pending_matches_count: req.specialist_matches ? req.specialist_matches.filter((m: any) => m.status === 'pending').length : 0,
      matched_specialist: req.matched_specialist,
    })) as ServiceRequest[];
  } catch (err: any) {
    console.error('fetchClientRequests error:', err);
    return [];
  }
}

/**
 * 3. Fetch Specialist Pending Inbox Matches directly from Supabase
 * Requirement (b): Address is masked to approximate area only!
 */
export async function fetchSpecialistPendingMatches(specialistId: string): Promise<SpecialistMatch[]> {
  try {
    const { data, error } = await supabase
      .from('specialist_matches')
      .select(`
        *,
        request:service_requests!request_id (*)
      `)
      .eq('specialist_id', specialistId)
      .eq('status', 'pending')
      .order('dispatched_at', { ascending: false });

    if (error) {
      console.warn('Error fetching specialist pending matches:', error.message);
      return [];
    }

    return (data || [])
      .filter((item: any) => item.request && item.request.status === 'open_for_matching')
      .map((item: any) => ({
        ...item,
        request: {
          ...item.request,
          // Requirement (b): Mask full street address until accepted
          location_address: item.request.service_type === 'telehealth'
            ? 'Telehealth Video Consultation'
            : formatApproximateLocation(item.request.location_address),
        },
      })) as SpecialistMatch[];
  } catch (err: any) {
    console.error('fetchSpecialistPendingMatches error:', err);
    return [];
  }
}

/**
 * 4. ATOMIC FIRST-ACCEPT-WINS:
 * Calls PostgreSQL RPC function public.accept_specialist_match(p_match_id, p_request_id)
 * Requirement 1: uses auth.uid() directly inside Postgres function!
 * Reveals full address on confirmed booking.
 */
export async function acceptMatch(
  matchId: string,
  requestId: string
): Promise<{ success: boolean; booking_id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('accept_specialist_match', {
      p_match_id: matchId,
      p_request_id: requestId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data && !data.success) {
      return { success: false, error: data.error || 'This request has already been claimed by another specialist.' };
    }

    return { success: true, booking_id: data?.booking_id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 5. Specialist Declines a Match
 */
export async function declineMatch(matchId: string, reason?: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('specialist_matches')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString(),
        decline_reason: reason,
      })
      .eq('id', matchId);

    if (error) {
      console.warn('Error declining match:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

/**
 * 6. Cancel a Request by Client
 */
export async function cancelServiceRequest(requestId: string): Promise<{ success: boolean }> {
  try {
    const now = new Date().toISOString();
    await supabase
      .from('service_requests')
      .update({ status: 'cancelled', updated_at: now })
      .eq('id', requestId);

    await supabase
      .from('specialist_matches')
      .update({ status: 'expired' })
      .eq('request_id', requestId)
      .eq('status', 'pending');

    return { success: true };
  } catch (err) {
    return { success: false };
  }
}
