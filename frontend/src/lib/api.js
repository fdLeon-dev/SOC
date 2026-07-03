/**
 * DefenseOS - Axios API client
 * Automatically attaches the JWT access token from localStorage.
 * Handles token refresh on 401 (Access Token Expired).
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Track if we're already refreshing to avoid race conditions
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401: try refresh, re-attempt, or logout
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token refresh in progress, queue this request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh_token = localStorage.getItem('refresh_token')
        if (!refresh_token) throw new Error('No refresh token')

        const res = await axios.post('/api/v1/auth/refresh', { refresh_token })
        const { access_token, refresh_token: new_refresh } = res.data

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', new_refresh)

        isRefreshing = false
        onRefreshed(access_token)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (_err) {
        isRefreshing = false
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(_err)
      }
    }

    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  refresh: (refresh_token) =>
    api.post('/auth/refresh', { refresh_token }),
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
  delete: (id) => api.delete(`/users/${id}`),
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export const auditApi = {
  getLogs: (query = '') => api.get(`/audit/logs${query ? `?${query}` : ''}`),
}
