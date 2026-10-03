import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';

interface LoginViewProps {
  onNavigateToSignUp: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onNavigateToSignUp, 
  onOpenForgotPassword 
}) => {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError(t('common.error'));
      return;
    }

    const res = await login(email, password);
    if (!res.success && res.error) {
      setFormError(res.error);
    }
  };

  const handleFillCredentials = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('TestPassword123!');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top Bar with Language Switcher */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('common.hipaaCompliant')}</span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-2">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('auth.signInTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('auth.signInSubtitle')}
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          {(formError || error) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{t('common.error')}</span>
                <span>{formError || error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-start">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full ps-9 pe-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-start"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider text-start">
                  {t('auth.passwordLabel')}
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full ps-9 pe-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-start"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 absolute end-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('auth.rememberMe')}</span>
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
                  <span>{t('auth.signInBtn')}</span>
                  <ArrowRight className="w-4 h-4 rtl-flip" />
                </>
              )}
            </button>
          </form>

          {/* Quick autofill helper */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block text-start">
              {t('auth.quickAutofill')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleFillCredentials('client@motionx.health')}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200"
              >
                client@motionx.health
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('specialist@motionx.health')}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200"
              >
                specialist@motionx.health
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin@motionx.health')}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200"
              >
                admin@motionx.health
              </button>
            </div>
          </div>

          {/* Sign up prompt */}
          <div className="text-center pt-2 text-xs text-slate-500">
            {t('auth.noAccount')}{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 ms-1"
            >
              {t('auth.signUpLink')}
            </button>
          </div>
        </div>

        {/* Security footnote */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t('auth.authFootnote')}</span>
        </div>
      </div>
    </div>
  );
};
