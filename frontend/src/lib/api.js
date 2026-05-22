/**
 * DefenseOS - Axios API client
 * Automatically attaches the JWT access token from localStorage.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
}

// ── Events ───────────────────────────────────────────────────────────────────
export const eventsApi = {
  list: (params) => api.get('/events/', { params }),
  get: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events/', data),
}

// ── Alerts ───────────────────────────────────────────────────────────────────
export const alertsApi = {
  list: (params) => api.get('/alerts/', { params }),
  stats: () => api.get('/alerts/stats'),
  update: (id, data) => api.patch(`/alerts/${id}`, data),
}

// ── Incidents ─────────────────────────────────────────────────────────────────
export const incidentsApi = {
  list: (params) => api.get('/incidents/', { params }),
  get: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents/', data),
  update: (id, data) => api.patch(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
}

// ── Metrics ───────────────────────────────────────────────────────────────────
export const metricsApi = {
  system: () => api.get('/metrics/system'),
  processes: () => api.get('/metrics/processes'),
  ports: () => api.get('/metrics/ports'),
  connections: () => api.get('/metrics/connections'),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => api.get('/users/'),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
}
