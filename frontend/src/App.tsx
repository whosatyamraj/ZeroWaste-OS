import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { PublicRoute, ProtectedRoute, RoleRoute } from '@/components/shared/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { UserRole } from '@/types';

// ─── Lazy-loaded Pages ──────────────────────────────────────────────
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const MarketplacePage = lazy(() => import('@/pages/MarketplacePage'));

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SustainabilityPage = lazy(() => import('@/pages/SustainabilityPage'));
const KitchenIntelPage = lazy(() => import('@/pages/KitchenIntelPage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const AIInsightsPage = lazy(() => import('@/pages/AIInsightsPage'));

const NGOPortalPage = lazy(() => import('@/pages/NGOPortalPage'));
const VolunteerPortalPage = lazy(() => import('@/pages/VolunteerPortalPage'));
const AdminPanelPage = lazy(() => import('@/pages/AdminPanelPage'));

const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// ─── Full-screen Loading Spinner ────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full border-[3px] border-transparent"
            style={{ borderTopColor: '#10b981', borderRightColor: 'rgba(16, 185, 129, 0.3)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <motion.p className="text-sm font-semibold text-foreground tracking-wide">ZeroWaste OS</motion.p>
          <motion.p className="text-xs text-muted-foreground" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
            Loading…
          </motion.p>
        </div>
      </div>
    </div>
  );
}

// ─── App Router ─────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ── Landing Page & Aliases ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Navigate to="/#features" replace />} />
        <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />

        {/* ── Public Auth Routes ── */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        {/* ── Protected Application Routes ── */}
        <Route element={<ProtectedRoute />}>
          
          {/* Marketplace can be accessed by anyone authenticated (or public if required, but for now protected) */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          
          {/* Dashboard Application Shell */}
          <Route element={<DashboardLayout />}>
            
            {/* General Dashboard (All roles) */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Food Business Owner Only */}
            <Route element={<RoleRoute roles={[UserRole.FoodBusinessOwner, UserRole.Admin]} />}>
              <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
              <Route path="/dashboard/sustainability" element={<SustainabilityPage />} />
              <Route path="/dashboard/kitchen" element={<KitchenIntelPage />} />
              <Route path="/dashboard/inventory" element={<InventoryPage />} />
              <Route path="/dashboard/ai-insights" element={<AIInsightsPage />} />
            </Route>

            {/* NGO Only */}
            <Route element={<RoleRoute roles={[UserRole.NGOPartner, UserRole.Admin]} />}>
              <Route path="/ngo" element={<NGOPortalPage />} />
            </Route>

            {/* Volunteer Only */}
            <Route element={<RoleRoute roles={[UserRole.Volunteer, UserRole.Admin]} />}>
              <Route path="/volunteer" element={<VolunteerPortalPage />} />
            </Route>

            {/* Admin Only */}
            <Route element={<RoleRoute roles={[UserRole.Admin]} />}>
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/admin/users" element={<AdminPanelPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
            </Route>
            
          </Route>
        </Route>

        {/* ── Catch-all 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
