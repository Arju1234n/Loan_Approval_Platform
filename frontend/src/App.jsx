import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuth'
import AppShell from './features/shared/components/AppShell'
import LoginPage from './features/auth/pages/LoginPage'
import AdminLoginPage from './features/auth/pages/AdminLoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import HomePage from './features/home/pages/HomePage'
import ApplyPage from './features/loan/pages/ApplyPage'
import ResultPage from './features/loan/pages/ResultPage'
import HistoryPage from './features/loan/pages/HistoryPage'
import ProfilePage from './features/auth/pages/ProfilePage'
import AdminDashboard from './features/admin/pages/AdminDashboard'
import AnalyticsPage from './features/analytics/pages/AnalyticsPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><span className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Guest route — redirect logged-in users to the right dashboard
function GuestRoute({ children, adminPortal = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><span className="spinner" /></div>
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* ── User Auth Routes ── */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* ── Admin Auth Route (separate page) ── */}
      <Route path="/admin/login" element={<GuestRoute adminPortal><AdminLoginPage /></GuestRoute>} />

      {/* ── Authenticated Routes (with sidebar) ── */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/"           element={<HomePage />} />
        <Route path="/apply"      element={<ApplyPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/history"    element={<HistoryPage />} />
        <Route path="/profile"    element={<ProfilePage />} />

        {/* Admin-only routes */}
        <Route path="/admin"      element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/analytics"  element={<ProtectedRoute adminOnly><AnalyticsPage /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
