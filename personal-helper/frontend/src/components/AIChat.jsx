import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../api/client'
import { Send, Sparkles, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const QUICK_PROMPTS = [
  'How am I doing financially this month?',
  'Where can I cut expenses?',
  'Give me a budget plan for next month',
  'What are my biggest spending habits?',
  'How can I save $500 next month?',
  'Summarize my week',
]

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your personal AI assistant powered by Claude. I know your spending, calendar, and can help with any financial question. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const { reply } = await aiApi.chat(newMessages)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      toast.error('AI error: ' + (e.response?.data?.detail || e.message))
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared. How can I help you?" }])
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          <h1 className="font-semibold text-slate-100">AI Assistant</h1>
          <span className="badge bg-purple-500/20 text-purple-400">Claude</span>
        </div>
        <button onClick={clearChat} className="btn-ghost text-xs flex items-center gap-1.5">
          <RefreshCw size={13} /> Clear
        </button>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 md:px-6 py-3">
          <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)}
                className="text-xs bg-surface-hover hover:bg-surface-card border border-slate-700 text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-purple-400" />
            </div>
            <div className="bg-surface-card rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-4 border-t border-slate-700/50">
        <div className="flex items-end gap-3 bg-surface-card border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/30 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your finances, week, or life..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none max-h-32"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">AI has access to your spending data and calendar for context.</p>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles size={14} className="text-purple-400" />
      </div>
      <div className="bg-surface-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  )
}
