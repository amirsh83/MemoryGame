import { useState, useEffect, useCallback } from 'react'
import { financeApi } from '../api/client'
import { format, parseISO } from 'date-fns'
import { Plus, Upload, Trash2, X, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CATEGORIES = ['food','transport','shopping','utilities','entertainment','health','travel','education','subscriptions','income','savings','other']
const CATEGORY_EMOJI = { food:'🍔', transport:'🚗', shopping:'🛍️', utilities:'💡', entertainment:'🎬', health:'🏥', travel:'✈️', education:'📚', subscriptions:'📱', income:'💵', savings:'🏦', other:'📌' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316','#a78bfa','#34d399','#94a3b8']

export default function FinanceView() {
  const [tab, setTab] = useState('overview')
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [statements, setStatements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')

  const now = new Date()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterCategory ? { category: filterCategory } : {}
      const [exp, sum, stmts] = await Promise.all([
        financeApi.getExpenses({ ...params, limit: 100 }),
        financeApi.getSummary({ year: now.getFullYear(), month: now.getMonth() + 1 }),
        financeApi.getStatements(),
      ])
      setExpenses(exp.expenses || [])
      setSummary(sum)
      setStatements(stmts.statements || [])
    } catch {
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }, [filterCategory])

  useEffect(() => { load() }, [load])

  const deleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await financeApi.deleteExpense(id)
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const deleteStatement = async (id) => {
    if (!confirm('Delete this statement and its imported expenses?')) return
    try {
      await financeApi.deleteStatement(id)
      toast.success('Statement deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const chartData = summary
    ? Object.entries(summary.by_category || {})
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ name: `${CATEGORY_EMOJI[k] || ''} ${k}`, value: v }))
    : []

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-slate-100">Finance</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 btn-ghost border border-slate-600 text-sm">
            <Upload size={15} /> Upload Statement
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Total spent</p>
            <p className="text-2xl font-bold text-red-400">${summary.total_spent.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{format(now, 'MMMM yyyy')}</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-slate-100">{summary.transaction_count}</p>
            <p className="text-xs text-slate-500">this month</p>
          </div>
          <div className="card col-span-2 md:col-span-1">
            <p className="text-xs text-slate-400 mb-1">Top spend</p>
            <p className="text-lg font-bold text-amber-400">{topCat(summary.by_category)}</p>
            <p className="text-xs text-slate-500">{topCatAmount(summary.by_category)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-hover rounded-xl p-1">
        {['overview','expenses','statements'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-colors ${tab === t ? 'bg-surface-card text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-3">Spending breakdown</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
                <Tooltip
                  formatter={(v) => [`$${v.toFixed(2)}`, 'Amount']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">No data for this month yet.</p>
          )}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="input text-sm w-auto flex-1 max-w-[180px]">
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
            </select>
          </div>
          {loading ? (
            [...Array(5)].map((_, i) => <div key={i} className="card h-14 animate-pulse bg-surface-hover" />)
          ) : expenses.length === 0 ? (
            <div className="card text-center py-8 text-slate-500">
              No expenses yet. <button onClick={() => setShowAddModal(true)} className="text-primary-400 hover:underline">Add one?</button>
            </div>
          ) : expenses.map((e) => (
            <div key={e.id} className="card flex items-center justify-between gap-3">
              <div className="w-9 h-9 bg-surface-hover rounded-lg flex items-center justify-center text-base flex-shrink-0">
                {CATEGORY_EMOJI[e.category] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{e.description}</p>
                <p className="text-xs text-slate-500">{e.date ? format(parseISO(e.date), 'MMM d, yyyy') : ''} · {e.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100">${e.amount.toFixed(2)}</span>
                <button onClick={() => deleteExpense(e.id)} className="btn-ghost p-1.5 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'statements' && (
        <div className="space-y-3">
          {statements.length === 0 ? (
            <div className="card text-center py-8 text-slate-500">
              No statements uploaded. <button onClick={() => setShowUploadModal(true)} className="text-primary-400 hover:underline">Upload one?</button>
            </div>
          ) : statements.map((s) => (
            <div key={s.id} className="card flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{s.filename}</p>
                <p className="text-xs text-slate-500">{s.statement_type} · {s.institution || 'Unknown bank'} · {s.uploaded_at ? format(parseISO(s.uploaded_at), 'MMM d, yyyy') : ''}</p>
                <span className={`badge mt-1 ${s.parsed === 'yes' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {s.parsed === 'yes' ? '✓ Parsed' : '⏳ Not parsed'}
                </span>
              </div>
              <button onClick={() => deleteStatement(s.id)} className="btn-ghost p-1.5 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); load() }} />}
      {showUploadModal && <UploadStatementModal onClose={() => setShowUploadModal(false)} onSaved={() => { setShowUploadModal(false); load() }} />}
    </div>
  )
}

function AddExpenseModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ amount: '', description: '', category: 'other', merchant: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '', currency: 'USD' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.amount || !form.description) return toast.error('Amount and description required')
    setSaving(true)
    try {
      await financeApi.createExpense({ ...form, amount: parseFloat(form.amount) })
      toast.success('Expense added')
      onSaved()
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface-card rounded-2xl p-5 w-full max-w-md border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-100">Add Expense</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Amount *</label>
            <input className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Currency</label>
            <input className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
          </div>
        </div>
        <input className="input" placeholder="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
        </select>
        <input className="input" placeholder="Merchant (optional)" value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} />
        <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <textarea className="input resize-none" rows={2} placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 btn-ghost border border-slate-600">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function UploadStatementModal({ onClose, onSaved }) {
  const [file, setFile] = useState(null)
  const [type, setType] = useState('credit_card')
  const [institution, setInstitution] = useState('')
  const [uploading, setUploading] = useState(false)

  const upload = async () => {
    if (!file) return toast.error('Select a file')
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('statement_type', type)
    fd.append('institution', institution)
    try {
      const result = await financeApi.uploadStatement(fd)
      toast.success(`Imported ${result.expenses_created} transactions`)
      onSaved()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card rounded-2xl p-5 w-full max-w-md border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-100">Upload Statement</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <p className="text-xs text-slate-400">Supported: PDF, CSV, XLS, XLSX. Max 20MB.</p>
        <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center">
          <input type="file" accept=".pdf,.csv,.xls,.xlsx" className="hidden" id="stmt-file" onChange={e => setFile(e.target.files[0])} />
          <label htmlFor="stmt-file" className="cursor-pointer">
            <Upload size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-400">{file ? file.name : 'Click to select file'}</p>
          </label>
        </div>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="credit_card">Credit Card</option>
          <option value="bank">Bank Account</option>
          <option value="investment">Investment</option>
        </select>
        <input className="input" placeholder="Institution (e.g. Chase, Wells Fargo)" value={institution} onChange={e => setInstitution(e.target.value)} />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 btn-ghost border border-slate-600">Cancel</button>
          <button onClick={upload} disabled={uploading || !file} className="flex-1 btn-primary">{uploading ? 'Uploading...' : 'Upload & Parse'}</button>
        </div>
      </div>
    </div>
  )
}

function topCat(byCategory) {
  if (!byCategory) return '—'
  const e = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  if (!e) return '—'
  return `${CATEGORY_EMOJI[e[0]] || ''} ${e[0]}`
}

function topCatAmount(byCategory) {
  if (!byCategory) return ''
  const e = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  return e ? `$${e[1].toFixed(2)} this month` : ''
}
