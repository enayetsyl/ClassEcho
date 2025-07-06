'use client'

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react'
import {jwtDecode} from 'jwt-decode'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface DecodedToken {
  name: string
  userId: string
  role?: string
  roles?: string[]
  exp?: number
  iat?: number
}

interface User {
  name: string
  userId: string
  roles: string[]
}

interface AuthContextType {
  token: string | null
  user: User | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

const queryClient = new QueryClient()

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState<boolean>(true)

 useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken) {
      setToken(storedToken)
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          console.error('Failed to parse stored user', err)
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken)
          const roles = decoded.roles ?? (decoded.role ? [decoded.role] : [])
          setUser({ userId: decoded.userId, roles, name: decoded.name })
        } catch (err) {
          console.error('Invalid token', err)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, userData: User) => {
  localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <QueryClientProvider client={queryClient}>
      
    <AuthContext.Provider
      value={{ token, user, loading, login, logout }}
      >
      {children}
    </AuthContext.Provider>
      </QueryClientProvider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
