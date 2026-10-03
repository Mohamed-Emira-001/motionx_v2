import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  UserCheck, 
  Stethoscope, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  FileBadge, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  Clock, 
  Building 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ClientAllowedRole, SignUpData } from '../../types/auth';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';

interface SignUpViewProps {
  onNavigateToLogin: () => void;
}

const AVAILABLE_SPECIALTIES = [
  'Orthopedics & Joint Rehab',
  'Sports Injury & Recovery',
  'Spine, Neck & Lumbar Care',
  'Neurological Rehabilitation',
  'Post-Operative Physical Therapy',
  'Vestibular & Balance Training',
  'Pediatric Physical Therapy',
  'Geriatric & Mobility Conditioning',
];

export const SignUpView: React.FC<SignUpViewProps> = ({ onNavigateToLogin }) => {
  const { t } = useTranslation();
  const { signUp, isLoading, error } = useAuth();
  
  // ROLE CHOICE: Strictly constrained to ONLY 'client' or 'specialist'
  const [selectedRole, setSelectedRole] = useState<ClientAllowedRole>('client');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Client-specific Fields
  const [primaryCondition, setPrimaryCondition] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Specialist-specific Fields
  const [title, setTitle] = useState('Doctor of Physical Therapy (PT, DPT)');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('CA');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Orthopedics & Joint Rehab']);
  const [yearsExperience, setYearsExperience] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(120);
  const [clinicAddress, setClinicAddress] = useState('');
  const [bio, setBio] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      if (selectedSpecialties.length > 1) {
        setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
      }
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setValidationError(t('common.error'));
      return;
    }

    if (password.length < 6) {
      setValidationError(t('auth.passwordPlaceholder'));
      return;
    }

    if (!agreedToTerms) {
      setValidationError(t('auth.licenseNotice'));
      return;
    }

    if (selectedRole === 'specialist') {
      if (!licenseNumber.trim()) {
        setValidationError(t('auth.licenseNumberPlaceholder'));
        return;
      }
    }

    // Build payload according to role - NEVER ALLOW ADMIN
    let payload: SignUpData;
    if (selectedRole === 'client') {
      payload = {
        role: 'client',
        full_name: fullName,
        email,
        password,
        phone,
        primary_condition: primaryCondition,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
      };
    } else {
      payload = {
        role: 'specialist',
        full_name: fullName,
        email,
        password,
        phone,
        title,
        license_number: licenseNumber,
        license_state: licenseState,
        specialties: selectedSpecialties,
        years_of_experience: Number(yearsExperience) || 1,
        hourly_rate_cents: (Number(hourlyRate) || 120) * 100,
        clinic_address: clinicAddress,
        bio,
      };
    }

    const res = await signUp(payload);
    if (!res.success && res.error) {
      setValidationError(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 py-8">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl-flip" />
            <span>{t('auth.backToSignIn')}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t('common.stepDelivered')}
            </span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.signUpTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('auth.signUpSubtitle')}
          </p>
        </div>

        {/* ROLE SELECTOR CARDS - ONLY CLIENT OR SPECIALIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole('client')}
            className={`p-4 rounded-2xl border text-start transition-all relative ${
              selectedRole === 'client'
                ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2.5 rounded-xl ${selectedRole === 'client' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <UserCheck className="w-5 h-5 shrink-0" />
              </div>
              {selectedRole === 'client' && (
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="font-bold text-sm text-slate-900">{t('auth.clientCardTitle')}</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('auth.clientCardDesc')}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('specialist')}
            className={`p-4 rounded-2xl border text-start transition-all relative ${
              selectedRole === 'specialist'
                ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2.5 rounded-xl ${selectedRole === 'specialist' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <Stethoscope className="w-5 h-5 shrink-0" />
              </div>
              {selectedRole === 'specialist' && (
                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="font-bold text-sm text-slate-900">{t('auth.specialistCardTitle')}</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('auth.specialistCardDesc')}
            </p>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          {(validationError || error) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{t('common.error')}</span>
                <span>{validationError || error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Common Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 text-start">
                  {t('auth.fullName')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedRole === 'client' ? 'e.g. Jessica Miller' : 'e.g. Dr. Robert Chen, DPT'}
                    className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 text-start">
                  {t('auth.emailLabel')} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 text-start">
                  {t('auth.passwordLabel')} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 text-start">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                  />
                </div>
              </div>
            </div>

            {/* CLIENT-SPECIFIC ONBOARDING */}
            {selectedRole === 'client' && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('client.portalTitle')}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                    {t('auth.primaryCondition')}
                  </label>
                  <input
                    type="text"
                    value={primaryCondition}
                    onChange={(e) => setPrimaryCondition(e.target.value)}
                    placeholder={t('auth.primaryConditionPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                      {t('auth.emergencyContactName')}
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Michael Miller (Spouse)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                      {t('auth.emergencyContactPhone')}
                    </label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+1 (555) 987-6543"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPECIALIST-SPECIFIC ONBOARDING */}
            {selectedRole === 'specialist' && (
              <div className="pt-2 border-t border-slate-100 space-y-3.5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-start">
                    <span className="font-bold block">{t('awaitingApproval.pipelineTitle')}:</span>
                    <span>{t('auth.licenseNotice')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                      {t('auth.licenseNumber')} *
                    </label>
                    <div className="relative">
                      <FileBadge className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder={t('auth.licenseNumberPlaceholder')}
                        className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                      {t('auth.licenseState')} *
                    </label>
                    <select
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    >
                      <option value="CA">California (CA)</option>
                      <option value="NY">New York (NY)</option>
                      <option value="TX">Texas (TX)</option>
                      <option value="FL">Florida (FL)</option>
                      <option value="WA">Washington (WA)</option>
                      <option value="IL">Illinois (IL)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                      {t('auth.yearsExperience')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                      {t('auth.hourlyRate')}
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="400"
                      step="5"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-start">
                    {t('auth.specialtiesLabel')}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_SPECIALTIES.map((spec) => {
                      const isSelected = selectedSpecialties.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpecialty(spec)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-start">
                    {t('auth.clinicAddress')}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      placeholder={t('auth.clinicAddressPlaceholder')}
                      className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms & HIPAA */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 text-start">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  required
                />
                <span>
                  {t('auth.licenseNotice')}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.createAccountBtn')}</span>
                  <ArrowRight className="w-4 h-4 rtl-flip" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            {t('auth.signInTitle')}{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 ms-1"
            >
              {t('common.signIn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
