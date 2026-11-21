import { createContext, useContext, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const KEY = 'portal_token'
const read = () => { try { return sessionStorage.getItem(KEY) } catch { return null } }
const write = (t) => { try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY) } catch { /* ignore */ } }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(read)

  const login = async (username, password) => {
    try {
      const data = await api('/login', { method: 'POST', body: { username, password } })
      write(data.token)
      setToken(data.token)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  const logout = () => { write(null); setToken(null) }

  return (
    <AuthContext.Provider value={{ token, isAdmin: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
