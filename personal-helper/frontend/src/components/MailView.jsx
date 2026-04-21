import { useState, useEffect } from 'react'
import { mailApi } from '../api/client'
import { format, parseISO } from 'date-fns'
import { Search, Mail, ChevronRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MailView() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [nextPageToken, setNextPageToken] = useState(null)

  const load = async (q = '', pageToken = null) => {
    setLoading(true)
    try {
      const data = await mailApi.getMessages({ query: q, max_results: 25, ...(pageToken ? { page_token: pageToken } : {}) })
      setMessages(data.messages || [])
      setNextPageToken(data.next_page_token || null)
    } catch {
      toast.error('Failed to load mail')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openMessage = async (msg) => {
    setSelected(msg)
    setDetailLoading(true)
    try {
      const full = await mailApi.getMessage(msg.id)
      setDetail(full)
    } catch {
      toast.error('Failed to load message')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    load(query)
  }

  if (selected) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <button onClick={() => { setSelected(null); setDetail(null) }} className="btn-ghost flex items-center gap-2 text-sm mb-4">
          <ArrowLeft size={15} /> Back
        </button>
        {detailLoading ? (
          <div className="card animate-pulse h-64" />
        ) : detail ? (
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-100 text-lg leading-tight">{detail.subject}</h2>
            <div className="text-sm text-slate-400 space-y-0.5">
              <p><span className="text-slate-500">From:</span> {detail.from}</p>
              <p><span className="text-slate-500">To:</span> {detail.to}</p>
              <p><span className="text-slate-500">Date:</span> {detail.date}</p>
            </div>
            <div className="border-t border-slate-700 pt-3 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {detail.body || detail.snippet || '(empty body)'}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Mail</h1>
        <span className="badge bg-slate-700 text-slate-400">Read-only</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search mail (e.g. subject:invoice)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-4">Search</button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-surface-hover" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">No messages found.</div>
      ) : (
        <div className="space-y-1">
          {messages.map((m) => {
            const isUnread = m.label_ids?.includes('UNREAD')
            return (
              <button
                key={m.id}
                onClick={() => openMessage(m)}
                className="w-full card text-left hover:bg-surface-hover transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                      {m.from?.replace(/<.*>/, '').trim() || 'Unknown sender'}
                    </p>
                    <span className="text-xs text-slate-500 flex-shrink-0">{m.date?.substring(0, 11)}</span>
                  </div>
                  <p className={`text-xs truncate ${isUnread ? 'text-slate-200' : 'text-slate-400'}`}>{m.subject}</p>
                  <p className="text-xs text-slate-500 truncate">{m.snippet}</p>
                </div>
                <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
