import { useState, useEffect, useCallback } from 'react'
import { calendarApi } from '../api/client'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const timeMin = startOfMonth(currentMonth).toISOString()
      const timeMax = endOfMonth(currentMonth).toISOString()
      const data = await calendarApi.getEvents({ time_min: timeMin, time_max: timeMax, max_results: 200 })
      setEvents(data.events || [])
    } catch {
      toast.error('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => { loadEvents() }, [loadEvents])

  const getEventsForDay = (day) =>
    events.filter((e) => {
      const start = e.start?.dateTime || e.start?.date
      if (!start) return false
      return isSameDay(parseISO(start), day)
    })

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event?')) return
    try {
      await calendarApi.deleteEvent(eventId)
      toast.success('Event deleted')
      setSelected(null)
      loadEvents()
    } catch {
      toast.error('Failed to delete event')
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Calendar</h1>
        <button onClick={() => { setEditEvent(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Event
        </button>
      </div>

      {/* Month header */}
      <div className="card flex items-center justify-between">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-ghost p-2">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-semibold text-slate-100">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-ghost p-2">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Grid */}
      <CalendarGrid
        month={currentMonth}
        events={events}
        getEventsForDay={getEventsForDay}
        onSelectDay={setSelected}
        selectedDay={selected}
      />

      {/* Selected day events */}
      {selected && (
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">{format(selected, 'EEEE, MMMM d')}</h3>
            <button onClick={() => setSelected(null)} className="btn-ghost p-1"><X size={16} /></button>
          </div>
          {getEventsForDay(selected).length === 0 ? (
            <p className="text-slate-500 text-sm">No events. <button onClick={() => { setEditEvent(null); setShowModal(true) }} className="text-primary-400 hover:underline">Add one?</button></p>
          ) : getEventsForDay(selected).map((e) => {
            const start = e.start?.dateTime
            const end = e.end?.dateTime
            return (
              <div key={e.id} className="flex items-start justify-between p-3 bg-surface-hover rounded-xl">
                <div>
                  <p className="font-medium text-slate-200 text-sm">{e.summary || '(no title)'}</p>
                  {start && <p className="text-xs text-slate-400">{format(parseISO(start), 'h:mm a')} — {end ? format(parseISO(end), 'h:mm a') : ''}</p>}
                  {e.location && <p className="text-xs text-slate-500 mt-0.5">📍 {e.location}</p>}
                  {e.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{e.description}</p>}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => { setEditEvent(e); setShowModal(true) }} className="btn-ghost p-1.5"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(e.id)} className="btn-ghost p-1.5 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <EventModal
          event={editEvent}
          defaultDate={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadEvents() }}
        />
      )}
    </div>
  )
}

function CalendarGrid({ month, getEventsForDay, onSelectDay, selectedDay }) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const startDow = start.getDay()
  const days = []

  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
    days.push(new Date(d))
  }
  while (days.length % 7 !== 0) days.push(null)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()

  return (
    <div className="card">
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const evts = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          return (
            <button
              key={i}
              onClick={() => onSelectDay(day)}
              className={`
                relative flex flex-col items-center justify-start p-1 rounded-lg min-h-[40px] md:min-h-[60px] transition-colors
                ${isSelected ? 'bg-primary-600/30 ring-1 ring-primary-500' : 'hover:bg-surface-hover'}
                ${isToday ? 'ring-1 ring-primary-500' : ''}
              `}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-primary-400' : 'text-slate-300'}`}>
                {format(day, 'd')}
              </span>
              {evts.length > 0 && (
                <span className="mt-0.5 text-xs bg-primary-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {evts.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EventModal({ event, defaultDate, onClose, onSaved }) {
  const defaultStart = defaultDate
    ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const [form, setForm] = useState({
    summary: event?.summary || '',
    description: event?.description || '',
    location: event?.location || '',
    start: event?.start?.dateTime ? format(parseISO(event.start.dateTime), "yyyy-MM-dd'T'HH:mm") : defaultStart,
    end: event?.end?.dateTime ? format(parseISO(event.end.dateTime), "yyyy-MM-dd'T'HH:mm") : defaultStart,
    timezone: event?.start?.timeZone || 'UTC',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.summary.trim()) return toast.error('Title required')
    setSaving(true)
    try {
      const body = {
        summary: form.summary,
        description: form.description,
        location: form.location,
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
        timezone: form.timezone,
      }
      if (event?.id) {
        await calendarApi.updateEvent(event.id, body)
        toast.success('Event updated')
      } else {
        await calendarApi.createEvent(body)
        toast.success('Event created')
      }
      onSaved()
    } catch {
      toast.error('Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card rounded-2xl p-5 w-full max-w-md border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-100">{event ? 'Edit Event' : 'New Event'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><X size={16} /></button>
        </div>
        <input className="input" placeholder="Title *" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Start</label>
            <input type="datetime-local" className="input text-sm" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">End</label>
            <input type="datetime-local" className="input text-sm" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
        </div>
        <input className="input" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        <textarea className="input resize-none" rows={3} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 btn-ghost border border-slate-600">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
