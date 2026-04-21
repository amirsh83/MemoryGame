import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { financeApi, calendarApi, aiApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { TrendingDown, TrendingUp, Calendar, MessageSquare, DollarSign, Sparkles } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16']

const CATEGORY_EMOJI = {
  food: '🍔', transport: '🚗', shopping: '🛍️', utilities: '💡',
  entertainment: '🎬', health: '🏥', travel: '✈️', education: '📚',
  subscriptions: '📱', income: '💵', savings: '🏦', other: '📌',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [events, setEvents] = useState([])
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date()
        const [sum, evts] = await Promise.all([
          financeApi.getSummary({ year: now.getFullYear(), month: now.getMonth() + 1 }),
          calendarApi.getEvents({ max_results: 5 }).catch(() => ({ events: [] })),
        ])
        setSummary(sum)
        setEvents(evts.events || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const loadAiSummary = async () => {
    setAiLoading(true)
    try {
      const { summary: s } = await aiApi.weekSummary()
      setAiSummary(s)
    } catch (e) {
      setAiSummary('Could not generate summary. Check your AI configuration.')
    } finally {
      setAiLoading(false)
    }
  }

  const pieData = summary
    ? Object.entries(summary.by_category || {})
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: k, value: v }))
    : []

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Good {greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
      </div>

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-surface-hover" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            icon={<DollarSign size={18} className="text-red-400" />}
            label="Spent this month"
            value={`$${(summary?.total_spent || 0).toFixed(2)}`}
            sub={`${summary?.transaction_count || 0} transactions`}
          />
          <StatCard
            icon={<TrendingDown size={18} className="text-amber-400" />}
            label="Top category"
            value={topCategory(summary?.by_category)}
            sub="biggest spend"
          />
          <StatCard
            icon={<Calendar size={18} className="text-blue-400" />}
            label="Upcoming events"
            value={events.length}
            sub="this week"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Spending pie chart */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-3">Spending by category</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`$${v.toFixed(2)}`, '']}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {pieData.slice(0, 8).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{CATEGORY_EMOJI[d.name] || ''} {d.name}</span>
                    <span className="ml-auto text-slate-300">${d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
              No spending data yet. <button onClick={() => navigate('/finance')} className="ml-1 text-primary-400 hover:underline">Add expenses →</button>
            </div>
          )}
        </div>

        {/* Upcoming events */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-200">Upcoming events</h2>
            <button onClick={() => navigate('/calendar')} className="text-xs text-primary-400 hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-slate-500 text-sm">No upcoming events.</p>
            ) : events.map((e) => {
              const start = e.start?.dateTime || e.start?.date || ''
              const dateStr = start ? format(new Date(start), 'MMM d, h:mm a') : ''
              return (
                <div key={e.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
                  <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={14} className="text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{e.summary || '(no title)'}</p>
                    <p className="text-xs text-slate-500">{dateStr}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <h2 className="font-semibold text-slate-200">AI Weekly Briefing</h2>
          </div>
          <button
            onClick={loadAiSummary}
            disabled={aiLoading}
            className="btn-primary text-xs px-3 py-1.5"
          >
            {aiLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {aiSummary ? (
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{aiSummary}</div>
        ) : (
          <p className="text-slate-500 text-sm">Click "Generate" to get your personalized weekly briefing from Claude.</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}

function topCategory(byCategory) {
  if (!byCategory) return '—'
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  if (!entries.length) return '—'
  const [cat] = entries[0]
  return (CATEGORY_EMOJI[cat] || '') + ' ' + cat
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
