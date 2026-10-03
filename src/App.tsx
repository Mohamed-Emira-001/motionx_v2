import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PortalNavbar } from './components/navigation/PortalNavbar';
import { RoadmapHeader } from './components/RoadmapHeader';
import { LoginView } from './components/auth/LoginView';
import { SignUpView } from './components/auth/SignUpView';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { ClientPortalView } from './components/routes/ClientPortalView';
import { SpecialistPortalView } from './components/routes/SpecialistPortalView';
import { AdminPortalView } from './components/routes/AdminPortalView';

// Step 1 Architecture Components
import { SchemaViewer } from './components/SchemaViewer';
import { RlsPolicyMatrix } from './components/RlsPolicyMatrix';
import { ErdVisualizer } from './components/ErdVisualizer';
import { SqlExporter } from './components/SqlExporter';
import { EnvironmentStatus } from './components/EnvironmentStatus';
import { RAW_SCHEMA_SQL } from './lib/schema-sql-raw';

import { 
  Database, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Key, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard
} from 'lucide-react';
import { UserRole } from './types/auth';

type AppView = 'client' | 'specialist' | 'admin' | 'login' | 'signup' | 'schema';

function AppContent() {
  const { role } = useAuth();
  
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return 'client';
  });

  const [schemaSubTab, setSchemaSubTab] = useState<'tables' | 'rls' | 'erd' | 'sql' | 'env'>('tables');
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Sync view when user role is resolved
  React.useEffect(() => {
    if (role && (currentView === 'login' || currentView === 'signup')) {
      setCurrentView(role);
    }
  }, [role]);

  const handleRoleRedirect = (targetRole: UserRole) => {
    setCurrentView(targetRole);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Roadmap Step Header */}
      <RoadmapHeader />

      {/* Main Portal Navigation */}
      <PortalNavbar 
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Step 4 Milestone Callout Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-indigo-900/60 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Provider-Agnostic Core
                </span>
                <span className="text-xs text-slate-300">Client, Specialist &amp; Admin Dashboards Live</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Comprehensive HealthTech Portals &amp; Clinical Documentation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Atomic Postgres RPC <strong className="text-emerald-300 font-mono">accept_specialist_match</strong> prevents double-acceptance race conditions using <strong className="text-emerald-300 font-mono">auth.uid()</strong>. Specialists see approximate vicinity until accepting, with full destination address revealed upon booking confirmation. Client portal displays scheduled sessions, HIPAA-filtered SOAP notes (<strong className="text-blue-300 font-mono">client_visible = true</strong>), and mobility/pain recovery charts.
              </p>
            </div>

            {/* Provider-Agnostic Payment Architecture Box */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shrink-0 max-w-sm w-full">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" /> Provider-Agnostic Payments
              </div>
              <h3 className="font-semibold text-white text-xs sm:text-sm">Modular Payment Architecture</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Bookings track <strong className="text-emerald-300 font-mono">payment_status</strong> natively in Supabase. Admins can utilize the <strong>"Mark as Paid"</strong> action to settle bookings on demand.
              </p>
            </div>
          </div>
        </div>

        {/* View Routing */}
        {currentView === 'login' && (
          <LoginView
            onNavigateToSignUp={() => setCurrentView('signup')}
            onOpenForgotPassword={() => setIsResetPasswordOpen(true)}
          />
        )}

        {currentView === 'signup' && (
          <SignUpView
            onNavigateToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'client' && (
          <ProtectedRoute
            requiredRole="client"
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRole={handleRoleRedirect}
          >
            <ClientPortalView onNavigateToStep1={() => setCurrentView('schema')} />
          </ProtectedRoute>
        )}

        {currentView === 'specialist' && (
          <ProtectedRoute
            requiredRole="specialist"
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRole={handleRoleRedirect}
          >
            <SpecialistPortalView onNavigateToStep1={() => setCurrentView('schema')} />
          </ProtectedRoute>
        )}

        {currentView === 'admin' && (
          <ProtectedRoute
            requiredRole="admin"
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRole={handleRoleRedirect}
          >
            <AdminPortalView onNavigateToStep1={() => setCurrentView('schema')} />
          </ProtectedRoute>
        )}

        {/* Step 1 Schema & RLS Architecture View */}
        {currentView === 'schema' && (
          <div className="space-y-6">
            <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
              <button
                onClick={() => setSchemaSubTab('tables')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  schemaSubTab === 'tables'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>12 PostgreSQL Tables</span>
              </button>

              <button
                onClick={() => setSchemaSubTab('rls')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  schemaSubTab === 'rls'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>24 RLS Policies (HIPAA Private)</span>
              </button>

              <button
                onClick={() => setSchemaSubTab('erd')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  schemaSubTab === 'erd'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Entity Relationship Map</span>
              </button>

              <button
                onClick={() => setSchemaSubTab('sql')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  schemaSubTab === 'sql'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Code2 className="w-4 h-4 text-purple-600" />
                <span>Full SQL Script (/supabase/schema.sql)</span>
              </button>

              <button
                onClick={() => setSchemaSubTab('env')}
                className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  schemaSubTab === 'env'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Key className="w-4 h-4 text-amber-600" />
                <span>Environment Keys</span>
              </button>
            </div>

            <div className="pt-2">
              {schemaSubTab === 'tables' && <SchemaViewer />}
              {schemaSubTab === 'rls' && <RlsPolicyMatrix />}
              {schemaSubTab === 'erd' && <ErdVisualizer />}
              {schemaSubTab === 'sql' && <SqlExporter sqlContent={RAW_SCHEMA_SQL} />}
              {schemaSubTab === 'env' && <EnvironmentStatus />}
            </div>
          </div>
        )}

      </main>

      {/* Password Reset Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">MotionX Platform</span>
            <span>•</span>
            <span>Step 4: Role Dashboards Active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Awaiting user confirmation to proceed with Step 5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
