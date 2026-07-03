/**
 * DefenseOS - React Router app with auth guards.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Events from './pages/Events'
import Incidents from './pages/Incidents'
import Metrics from './pages/Metrics'
import Users from './pages/Users'
import Audit from './pages/Audit'
import { Network, Processes } from './pages/NetworkProcesses'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-soc-bg flex items-center justify-center">
        <p className="text-soc-muted text-sm animate-pulse">Authenticating…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/"          element={<Dashboard />} />
                    <Route path="/alerts"    element={<Alerts />} />
                    <Route path="/events"    element={<Events />} />
                    <Route path="/incidents" element={<Incidents />} />
                    <Route path="/metrics"   element={<Metrics />} />
                    <Route path="/network"   element={<Network />} />
                    <Route path="/processes" element={<Processes />} />
                    <Route path="/users"     element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
                    <Route path="/audit"     element={<ProtectedRoute adminOnly><Audit /></ProtectedRoute>} />
                    <Route path="*"          element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
