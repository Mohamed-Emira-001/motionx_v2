import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { AwaitingApprovalScreen } from '../auth/AwaitingApprovalScreen';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole: UserRole;
  onNavigateToLogin: () => void;
  onNavigateToRole: (role: UserRole) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  onNavigateToLogin,
  onNavigateToRole,
  children,
}) => {
  const { user, profile, specialistProfile, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Validating authorization &amp; role credentials...</span>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">Authentication Required</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested route requires a verified session. Please sign in to your MotionX account.
        </p>
        <button
          onClick={onNavigateToLogin}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>Go to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Specialist pending verification -> ALWAYS SHOW AWAITING APPROVAL SCREEN!
  if (role === 'specialist' && specialistProfile?.verification_status === 'pending') {
    return <AwaitingApprovalScreen />;
  }

  // Role mismatch -> Redirect to user's assigned role route
  if (role !== requiredRole) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Unauthorized Role Access</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your account role is <strong className="text-slate-800 uppercase font-mono">{role}</strong>. You do not have permissions to access the <strong className="text-slate-800 uppercase font-mono">{requiredRole}</strong> portal.
          </p>
        </div>
        <button
          onClick={() => onNavigateToRole(role!)}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>Return to Your {role?.toUpperCase()} Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
