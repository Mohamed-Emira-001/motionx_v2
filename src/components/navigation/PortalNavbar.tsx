import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  UserCheck, 
  Stethoscope, 
  Database,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { LanguageSwitcher } from './LanguageSwitcher';

interface PortalNavbarProps {
  currentView: 'client' | 'specialist' | 'admin' | 'login' | 'signup' | 'schema';
  onNavigate: (view: 'client' | 'specialist' | 'admin' | 'login' | 'signup' | 'schema') => void;
}

export const PortalNavbar: React.FC<PortalNavbarProps> = ({ currentView, onNavigate }) => {
  const { t } = useTranslation();
  const { user, profile, specialistProfile, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (userRole?: UserRole | null) => {
    switch (userRole) {
      case 'client':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">{t('roles.client')}</span>;
      case 'specialist':
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            specialistProfile?.verification_status === 'pending'
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-teal-100 text-teal-800 border-teal-200'
          }`}>
            {specialistProfile?.verification_status === 'pending' ? t('roles.specialistPending') : t('roles.specialist')}
          </span>
        );
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">{t('roles.admin')}</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(role ? (role as any) : 'login')}
              className="flex items-center gap-2.5 text-start focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                  {t('common.appName')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" /> {t('common.appTagline')}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onNavigate('client')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'client'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{t('nav.clientPortal')}</span>
            </button>

            <button
              onClick={() => onNavigate('specialist')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'specialist'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{t('nav.specialistPortal')}</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{t('nav.adminPortal')}</span>
            </button>

            <button
              onClick={() => onNavigate('schema')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'schema'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('nav.database')}</span>
            </button>
          </div>

          {/* Right Section: Language Switcher & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Language Switcher (EN | عربي) */}
            <LanguageSwitcher />

            {/* User Profile / Auth State Controls (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pe-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs"
                  >
                    <img
                      src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={profile?.full_name || 'User'}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="text-start">
                      <span className="font-bold text-slate-800 block text-xs line-clamp-1">
                        {profile?.full_name || user.email}
                      </span>
                      <div className="flex items-center gap-1">
                        {getRoleBadge(role)}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ms-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-2 z-50 animate-in fade-in duration-150">
                      <div className="p-2 border-b border-slate-100">
                        <span className="text-[11px] text-slate-400 block font-medium">{t('nav.loggedViaSupabase')}</span>
                        <span className="text-xs font-bold text-slate-900 block truncate">{user.email}</span>
                        <div className="mt-1">{getRoleBadge(role)}</div>
                      </div>

                      <div className="p-1">
                        <button
                          onClick={async () => {
                            setDropdownOpen(false);
                            await logout();
                            onNavigate('login');
                          }}
                          className="w-full text-start px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 rtl-flip" />
                          <span>{t('common.logOut')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    {t('common.signIn')}
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {t('common.signUp')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => { onNavigate('client'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg border text-start ${currentView === 'client' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-slate-200'}`}
            >
              {t('nav.clientPortal')}
            </button>
            <button
              onClick={() => { onNavigate('specialist'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg border text-start ${currentView === 'specialist' ? 'bg-teal-50 border-teal-300 text-teal-800' : 'border-slate-200'}`}
            >
              {t('nav.specialistPortal')}
            </button>
            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg border text-start ${currentView === 'admin' ? 'bg-purple-50 border-purple-300 text-purple-800' : 'border-slate-200'}`}
            >
              {t('nav.adminPortal')}
            </button>
            <button
              onClick={() => { onNavigate('schema'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg border text-start ${currentView === 'schema' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'border-slate-200'}`}
            >
              {t('nav.database')}
            </button>
          </div>

          {user ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{profile?.full_name || user.email}</span>
                {getRoleBadge(role)}
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                  onNavigate('login');
                }}
                className="w-full py-2 bg-rose-50 text-rose-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 rtl-flip" />
                <span>{t('common.logOut')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-800"
              >
                {t('common.signIn')}
              </button>
              <button
                onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg"
              >
                {t('common.signUp')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
