import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'button' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'pill',
  className = '' 
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const setLanguage = (lang: 'en' | 'ar') => {
    if (currentLang !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs ${className}`}
        title={currentLang === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span>{currentLang === 'en' ? 'عربي' : 'EN'}</span>
      </button>
    );
  }

  return (
    <div 
      className={`inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold select-none ${className}`}
      dir="ltr"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
          currentLang === 'en'
            ? 'bg-white text-emerald-800 font-bold shadow-2xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <span>EN</span>
      </button>

      <span className="text-slate-300 font-normal px-0.5">|</span>

      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
          currentLang === 'ar'
            ? 'bg-white text-emerald-800 font-bold shadow-2xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <span>عربي</span>
      </button>
    </div>
  );
};
