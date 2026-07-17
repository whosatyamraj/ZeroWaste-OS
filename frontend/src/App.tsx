import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

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
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Spinning ring + logo */}
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full border-[3px] border-transparent"
            style={{
              borderTopColor: '#10b981',
              borderRightColor: 'rgba(16, 185, 129, 0.3)',
            }}
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

        {/* Text */}
        <div className="text-center space-y-1.5">
          <motion.p
            className="text-sm font-semibold text-foreground tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            ZeroWaste OS
          </motion.p>
          <motion.p
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Loading…
          </motion.p>
        </div>
      </div>
    </div>
  );
}

// ─── 404 Page ───────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-500/8 via-cyan-500/5 to-transparent blur-3xl" />
      </div>
      <motion.div
        className="relative text-center space-y-6 max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
          <span className="text-4xl font-black gradient-text">404</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
          >
            <Leaf className="w-4 h-4" />
            Back to Home
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-surface-1 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── App Router ─────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />

        {/* Redirect aliases — scroll to section anchors on the landing page */}
        <Route path="/features" element={<Navigate to="/#features" replace />} />
        <Route path="/pricing" element={<Navigate to="/#pricing" replace />} />

        {/* ── Protected Dashboard Routes ─────────────────────────
             Each page component renders <DashboardLayout> internally,
             so we do NOT wrap them again here.
        ── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/dashboard/sustainability" element={<ProtectedRoute><SustainabilityPage /></ProtectedRoute>} />
        <Route path="/dashboard/kitchen" element={<ProtectedRoute><KitchenIntelPage /></ProtectedRoute>} />
        <Route path="/dashboard/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/dashboard/ai-insights" element={<ProtectedRoute><AIInsightsPage /></ProtectedRoute>} />

        {/* ── Community / Portal Routes ── */}
        <Route path="/ngo" element={<ProtectedRoute><NGOPortalPage /></ProtectedRoute>} />
        <Route path="/volunteer" element={<ProtectedRoute><VolunteerPortalPage /></ProtectedRoute>} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

        {/* ── User Routes ── */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* ── Catch-all 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
