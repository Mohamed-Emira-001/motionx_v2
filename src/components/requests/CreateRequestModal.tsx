import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Check, 
  Sparkles, 
  Video, 
  Home, 
  Building,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ServiceType, UrgencyLevel, CreateRequestInput } from '../../types/service-requests';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRequestInput) => Promise<boolean>;
  isSubmitting: boolean;
}

const ANATOMICAL_AREAS = [
  'Lower Back / Lumbar Spine',
  'Neck / Cervical Spine',
  'Right Knee (ACL / Meniscus)',
  'Left Knee',
  'Shoulder / Rotator Cuff',
  'Hip & Pelvis',
  'Ankle & Achilles Tendon',
  'Elbow / Forearm',
  'Post-Surgical Joint Replacement',
  'Full Body / Neurological Mobility'
];

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  // Form State
  const [painArea, setPainArea] = useState(ANATOMICAL_AREAS[0]);
  const [conditionDescription, setConditionDescription] = useState('');
  const [painLevel, setPainLevel] = useState<number>(6);
  const [serviceType, setServiceType] = useState<ServiceType>('in_person_clinic');
  const [locationAddress, setLocationAddress] = useState('450 Sutter St, San Francisco, CA');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (08:00 - 12:00)');
  const [urgency, setUrgency] = useState<UrgencyLevel>('routine');
  const [clientNotes, setClientNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPainColor = (lvl: number) => {
    if (lvl <= 3) return 'bg-emerald-500 text-white';
    if (lvl <= 6) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getPainLabel = (lvl: number) => {
    if (lvl <= 3) return t('requestModal.painMild');
    if (lvl <= 6) return t('requestModal.painModerate');
    if (lvl <= 9) return t('requestModal.painSevere');
    return t('requestModal.painWorst');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!conditionDescription.trim()) {
      setValidationError(t('common.error'));
      return;
    }

    if (serviceType !== 'telehealth' && !locationAddress.trim()) {
      setValidationError(t('common.error'));
      return;
    }

    const payload: CreateRequestInput = {
      condition_category: painArea,
      condition_description: conditionDescription,
      pain_level: painLevel,
      pain_area: painArea,
      service_type: serviceType,
      location_address: serviceType === 'telehealth' ? 'Encrypted Telehealth Consultation' : locationAddress,
      preferred_date: preferredDate,
      preferred_time_slot: preferredTimeSlot,
      urgency,
      client_notes: clientNotes,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute end-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              {t('common.active')}
            </span>
            <span className="text-slate-300 text-xs">• public.service_requests</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-start">
            {t('requestModal.title')}
          </h3>
          <p className="text-xs text-emerald-100/80 mt-0.5 text-start">
            {t('requestModal.subtitle')}
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-start">
                <span className="font-semibold block">{t('common.error')}</span>
                <span>{validationError}</span>
              </div>
            </div>
          )}

          {/* 1. Anatomical Area & Condition */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider text-start">
              1. {t('requestModal.areaLabel')}
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ANATOMICAL_AREAS.slice(0, 6).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setPainArea(area)}
                  className={`p-2.5 rounded-xl border text-start transition-all font-medium flex items-center justify-between ${
                    painArea === area
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{area}</span>
                  {painArea === area && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 text-start">
                {t('requestModal.descriptionLabel')} *
              </label>
              <textarea
                rows={2}
                value={conditionDescription}
                onChange={(e) => setConditionDescription(e.target.value)}
                placeholder={t('requestModal.descriptionPlaceholder')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                required
              />
            </div>
          </div>

          {/* 2. Visual Pain Scale (1-10) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span>2. {t('requestModal.painScaleLabel')}:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${getPainColor(painLevel)}`}>
                  {painLevel} / 10
                </span>
              </label>
              <span className="text-xs font-semibold text-slate-500">
                {getPainLabel(painLevel)}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* 3. Service Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider text-start">
              3. {t('requestModal.serviceTypeLabel')}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setServiceType('in_person_clinic')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  serviceType === 'in_person_clinic'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold ring-1 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{t('requestModal.inPersonClinic')}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">
                  {t('serviceTypes.in_person_clinic')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('home_visit')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  serviceType === 'home_visit'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-1 ring-teal-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{t('requestModal.homeVisit')}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">
                  {t('serviceTypes.home_visit')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('telehealth')}
                className={`p-3 rounded-xl border text-start transition-all ${
                  serviceType === 'telehealth'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('requestModal.telehealth')}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">
                  {t('serviceTypes.telehealth')}
                </p>
              </button>
            </div>
          </div>

          {/* 4. Location Address (if clinic or home) */}
          {serviceType !== 'telehealth' && (
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] font-semibold text-slate-700 text-start">
                {t('requestModal.addressLabel')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder={t('requestModal.addressPlaceholder')}
                  className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                  required
                />
              </div>
            </div>
          )}

          {/* 5. Date & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 text-start">
                {t('requestModal.dateLabel')}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 text-start">
                {t('requestModal.timeSlotLabel')}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <select
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                  className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-start"
                >
                  <option value="Morning (08:00 - 12:00)">{t('requestModal.morningSlot')}</option>
                  <option value="Afternoon (12:00 - 16:00)">{t('requestModal.afternoonSlot')}</option>
                  <option value="Evening (16:00 - 20:00)">{t('requestModal.eveningSlot')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('requestModal.submitBtn')}</span>
                  <ArrowRight className="w-4 h-4 rtl-flip" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
