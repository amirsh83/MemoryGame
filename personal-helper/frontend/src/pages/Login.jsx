import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { auth_url } = await authApi.getLoginUrl()
      window.location.href = auth_url
    } catch {
      toast.error('Could not connect to server')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Personal Helper</h1>
          <p className="text-slate-400 mt-2 text-sm">Your private finance & life assistant</p>
        </div>

        <div className="card space-y-4">
          <div className="space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2"><span>📅</span> Google Calendar read & write</p>
            <p className="flex items-center gap-2"><span>📧</span> Gmail read-only</p>
            <p className="flex items-center gap-2"><span>💰</span> Financial tracking & analysis</p>
            <p className="flex items-center gap-2"><span>🤖</span> AI assistant (Claude)</p>
            <p className="flex items-center gap-2"><span>✈️</span> Telegram bot</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            <GoogleIcon />
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Your data is stored locally and never shared.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
