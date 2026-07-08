import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function parseToken(token) {
  if (!token) return {}
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? null,
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null,
    }
  } catch {
    return {}
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const { userId, role } = parseToken(token)

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token, userId, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}