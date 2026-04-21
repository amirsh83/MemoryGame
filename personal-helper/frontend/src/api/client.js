import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE_URL, withCredentials: false })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh })
          localStorage.setItem('access_token', data.access_token)
          err.config.headers.Authorization = `Bearer ${data.access_token}`
          return api.request(err.config)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  getLoginUrl: () => api.get('/auth/google/login').then(r => r.data),
  getMe: () => api.get('/me').then(r => r.data),
  generateTelegramLink: () => api.post('/telegram/generate-link-token').then(r => r.data),
  unlinkTelegram: () => api.delete('/telegram/unlink').then(r => r.data),
}

export const calendarApi = {
  getEvents: (params) => api.get('/calendar/events', { params }).then(r => r.data),
  getEvent: (id) => api.get(`/calendar/events/${id}`).then(r => r.data),
  createEvent: (body) => api.post('/calendar/events', body).then(r => r.data),
  updateEvent: (id, body) => api.patch(`/calendar/events/${id}`, body).then(r => r.data),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`),
  getCalendars: () => api.get('/calendar/calendars').then(r => r.data),
}

export const mailApi = {
  getMessages: (params) => api.get('/mail/messages', { params }).then(r => r.data),
  getMessage: (id) => api.get(`/mail/messages/${id}`).then(r => r.data),
  getLabels: () => api.get('/mail/labels').then(r => r.data),
}

export const financeApi = {
  getExpenses: (params) => api.get('/finance/expenses', { params }).then(r => r.data),
  createExpense: (body) => api.post('/finance/expenses', body).then(r => r.data),
  updateExpense: (id, body) => api.patch(`/finance/expenses/${id}`, body).then(r => r.data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  getSummary: (params) => api.get('/finance/summary', { params }).then(r => r.data),
  uploadStatement: (formData) => api.post('/finance/statements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  getStatements: () => api.get('/finance/statements').then(r => r.data),
  deleteStatement: (id) => api.delete(`/finance/statements/${id}`),
}

export const aiApi = {
  chat: (messages, calendar_context) => api.post('/ai/chat', { messages, calendar_context }).then(r => r.data),
  weekSummary: () => api.get('/ai/week-summary').then(r => r.data),
  ask: (question) => api.post('/ai/ask', { question }).then(r => r.data),
}

export default api
