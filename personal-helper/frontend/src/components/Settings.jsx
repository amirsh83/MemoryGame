import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'
import { Shield, Link, Unlink, Copy, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, logout, refetchUser } = useAuth()
  const [telegramLink, setTelegramLink] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateTelegramLink = async () => {
    setLoading(true)
    try {
      const data = await authApi.generateTelegramLink()
      setTelegramLink(data.link_url)
      toast.success('Link generated!')
    } catch {
      toast.error('Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  const unlinkTelegram = async () => {
    if (!confirm('Unlink your Telegram account?')) return
    try {
      await authApi.unlinkTelegram()
      await refetchUser()
      setTelegramLink(null)
      toast.success('Telegram unlinked')
    } catch {
      toast.error('Failed to unlink')
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-100">Settings</h1>

      {/* Profile */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <span>👤</span> Profile
        </h2>
        <div className="flex items-center gap-4">
          {user?.picture
            ? <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full ring-2 ring-primary-500/30" />
            : <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-xl">{user?.name?.[0]}</div>
          }
          <div>
            <p className="font-semibold text-slate-100">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <Shield size={16} className="text-green-400" /> Privacy & Security
        </h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p className="flex items-center gap-2">✓ Authentication via Google OAuth2 — no passwords stored</p>
          <p className="flex items-center gap-2">✓ Google tokens encrypted at rest with Fernet symmetric encryption</p>
          <p className="flex items-center gap-2">✓ Financial data stored locally in your own database</p>
          <p className="flex items-center gap-2">✓ Gmail access is read-only</p>
          <p className="flex items-center gap-2">✓ AI conversations are not persisted server-side</p>
          <p className="flex items-center gap-2">✓ Telegram webhook verified with secret token</p>
          <p className="flex items-center gap-2">✓ JWT sessions expire after 60 minutes</p>
        </div>
      </div>

      {/* Telegram */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <span>✈️</span> Telegram Bot
        </h2>
        {user?.telegram_linked ? (
          <div className="space-y-2">
            <p className="text-sm text-green-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Telegram is linked
            </p>
            <p className="text-xs text-slate-400">Your Telegram account is connected. You can use the bot to manage finances, check your calendar, and chat with the AI.</p>
            <button onClick={unlinkTelegram} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
              <Unlink size={14} /> Unlink Telegram
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Link your Telegram to use the bot for expense tracking, calendar, and AI chat — right from Telegram.</p>
            <button onClick={generateTelegramLink} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
              <Link size={14} /> {loading ? 'Generating...' : 'Generate Link'}
            </button>
            {telegramLink && (
              <div className="bg-surface-hover rounded-xl p-3 space-y-2">
                <p className="text-xs text-slate-400">Click the link below or copy and open in Telegram:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-primary-400 flex-1 truncate">{telegramLink}</code>
                  <button onClick={() => copy(telegramLink)} className="btn-ghost p-1.5"><Copy size={13} /></button>
                  <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="btn-ghost p-1.5"><ExternalLink size={13} /></a>
                </div>
                <p className="text-xs text-amber-400">⚠️ This link expires after one use.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Google Permissions */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-200 flex items-center gap-2">
          <span>🔑</span> Google Permissions
        </h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>✓ <strong className="text-slate-300">Google Calendar</strong> — Read, write, and delete events</p>
          <p>✓ <strong className="text-slate-300">Gmail</strong> — Read messages only (cannot send)</p>
          <p>✓ <strong className="text-slate-300">Profile</strong> — Name, email, and profile picture</p>
        </div>
        <p className="text-xs text-slate-500">To revoke access, visit <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">myaccount.google.com/permissions</a></p>
      </div>

      {/* Danger zone */}
      <div className="card border-red-900/50 space-y-2">
        <h2 className="font-semibold text-red-400">Sign Out</h2>
        <p className="text-sm text-slate-400">Sign out from this device. Your data remains stored.</p>
        <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-4 py-2 rounded-xl transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
