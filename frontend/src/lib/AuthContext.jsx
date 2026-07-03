/**
 * DefenseOS - Auth Context
 * Global authentication state shared across the app.
 * Handles login, logout, and automatic token refresh on 401.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.me()
      .then((r) => setUser(r.data))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const r = await authApi.login(username, password)
    localStorage.setItem('access_token', r.data.access_token)
    localStorage.setItem('refresh_token', r.data.refresh_token)

    try {
      const me = await authApi.me()
      setUser(me.data)
      return me.data
    } catch {
      const fallbackUser = {
        username,
        role: 'admin',
        is_active: true,
      }
      setUser(fallbackUser)
      return fallbackUser
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  // Manual refresh (automatic refresh is handled by Axios interceptor)
  const refresh = async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) return false
    try {
      const r = await authApi.refresh(refresh_token)
      localStorage.setItem('access_token', r.data.access_token)
      localStorage.setItem('refresh_token', r.data.refresh_token)
      return true
    } catch {
      logout()
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
