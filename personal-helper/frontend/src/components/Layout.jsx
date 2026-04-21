import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Calendar, DollarSign, MessageSquare,
  Mail, Settings, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/mail', icon: Mail, label: 'Mail' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col w-64 bg-surface-card border-r border-slate-700/50
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-sm">🔐</div>
            <span className="font-semibold text-slate-100 text-sm">Personal Helper</span>
          </div>
          <button className="lg:hidden btn-ghost p-1" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.picture
              ? <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
              : <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-xs">{user?.name?.[0]}</div>
            }
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-surface-card">
          <button className="btn-ghost p-1" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-semibold text-slate-100 text-sm">Personal Helper</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
