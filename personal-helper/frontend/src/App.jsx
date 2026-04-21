import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import FinanceView from './components/FinanceView'
import AIChat from './components/AIChat'
import MailView from './components/MailView'
import Settings from './components/Settings'
import LoginPage from './pages/Login'

function AuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const access = params.get('access_token')
    const refresh = params.get('refresh_token')
    if (access && refresh) {
      login(access, refresh)
      window.location.replace('/')
    }
  }, [])

  return <div className="flex items-center justify-center h-screen text-slate-400">Signing in...</div>
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="finance" element={<FinanceView />} />
          <Route path="chat" element={<AIChat />} />
          <Route path="mail" element={<MailView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
