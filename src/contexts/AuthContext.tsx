import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/login', { username, password })
      const userData = response.data
      
      // Generate a simple token (in production, this should come from the server)
      const newToken = btoa(`${username}:${Date.now()}`)
      
      setUser(userData)
      setToken(newToken)
      localStorage.setItem('token', newToken)
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      await axios.post('/api/register', { username, password })
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
