import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

const STORAGE_KEY = 'motionx_lang';

// Retrieve saved language or default to English
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || 'en' : 'en';

export const syncDocumentDirection = (lng: string) => {
  if (typeof document !== 'undefined') {
    const isAr = lng === 'ar';
    document.documentElement.lang = lng;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    if (isAr) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

// Apply document attributes initially
syncDocumentDirection(savedLanguage);

// Listen to language changes to update document dir and localStorage
i18n.on('languageChanged', (lng) => {
  syncDocumentDirection(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
