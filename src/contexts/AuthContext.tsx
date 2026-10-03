import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  UserRole, 
  UserProfile, 
  SpecialistProfile, 
  ClientProfile, 
  SignUpData, 
  SpecialistVerificationStatus 
} from '../types/auth';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  specialistProfile: SpecialistProfile | null;
  clientProfile: ClientProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [specialistProfile, setSpecialistProfile] = useState<SpecialistProfile | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (prof && !profError) {
        setProfile(prof as UserProfile);

        if (prof.role === 'specialist') {
          const { data: spec } = await supabase
            .from('specialist_profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (spec) setSpecialistProfile(spec as SpecialistProfile);
        } else if (prof.role === 'client') {
          const { data: cl } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (cl) setClientProfile(cl as ClientProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching Supabase profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  // Real Supabase Session initialization
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session && session.user && !sessionError && mounted) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          await fetchProfile(session.user.id);
        }
      } catch (err: any) {
        console.warn('Supabase auth session error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen to real Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSpecialistProfile(null);
        setClientProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real Supabase Sign In
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (sbError) {
        setIsLoading(false);
        setError(sbError.message);
        return { success: false, error: sbError.message };
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        await fetchProfile(data.user.id);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Sign in failed. Please verify your credentials.' };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Unable to connect to Supabase. Check your configuration.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Real Supabase Sign Up - strictly enforces client or specialist only!
  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    // CRITICAL SECURITY ENFORCEMENT: Never allow 'admin' from client side
    if ((data.role as string) === 'admin') {
      const err = 'Security violation: Admin registration is prohibited from client interface.';
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }

    if (data.role !== 'client' && data.role !== 'specialist') {
      const err = 'Invalid role specified. Only "client" or "specialist" registrations are allowed.';
      setError(err);
      setIsLoading(false);
      return { success: false, error: err };
    }

    try {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
            phone: data.phone,
            ...(data.role === 'specialist' ? {
              title: data.title,
              license_number: data.license_number,
              license_state: data.license_state,
            } : {}),
          },
        },
      });

      if (sbError) {
        setIsLoading(false);
        setError(sbError.message);
        return { success: false, error: sbError.message };
      }

      if (sbData.user) {
        setUser({ id: sbData.user.id, email: sbData.user.email || data.email });

        // If client, save intake info to client_profiles table
        if (data.role === 'client') {
          try {
            await supabase.from('client_profiles').upsert({
              id: sbData.user.id,
              emergency_contact_name: data.emergency_contact_name,
              emergency_contact_phone: data.emergency_contact_phone,
              medical_history_summary: data.primary_condition ? `Primary complaint: ${data.primary_condition}` : null,
              has_physician_referral: false,
              intake_completed: true,
            });
          } catch (e) { /* ignore */ }
        }

        // If specialist, save detailed license info to specialist_profiles table
        if (data.role === 'specialist') {
          try {
            await supabase.from('specialist_profiles').upsert({
              id: sbData.user.id,
              title: data.title || 'Licensed Physical Therapist',
              bio: data.bio || '',
              license_number: data.license_number,
              license_state: data.license_state,
              specialties: data.specialties.length > 0 ? data.specialties : ['Orthopedics'],
              verification_status: 'pending', // ALWAYS PENDING ON REGISTRATION!
              years_of_experience: data.years_of_experience || 1,
              hourly_rate_cents: data.hourly_rate_cents || 12500,
              service_radius_km: 25.0,
              clinic_address: data.clinic_address,
              is_accepting_new_clients: true,
            });
          } catch (e) { /* ignore */ }
        }

        await fetchProfile(sbData.user.id);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Registration incomplete. Please try again.' };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Unable to connect to Supabase. Check your configuration.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Real Supabase Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetErr) {
        setIsLoading(false);
        return { success: false, error: resetErr.message };
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Real Supabase Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) { /* ignore */ }
    setUser(null);
    setProfile(null);
    setSpecialistProfile(null);
    setClientProfile(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        specialistProfile,
        clientProfile,
        role: profile?.role || null,
        isLoading,
        error,
        login,
        signUp,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
