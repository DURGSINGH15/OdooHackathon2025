// contexts/auth-context.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  username: string
  name?: string
  image?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      // Convert NextAuth session to our User type
      setUser({
        id: session.user.email || '', // You might want to use a proper ID
        email: session.user.email || '',
        username: session.user.name || session.user.email?.split('@')[0] || '',
        name: session.user.name || '',
        image: session.user.image || undefined,
      })
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [session, status])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Your existing login logic for email/password
    // This would typically make an API call to your backend
    try {
      // Replace with your actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const signup = async (email: string, username: string, password: string): Promise<boolean> => {
    // Your existing signup logic
    try {
      // Replace with your actual signup API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return true
      }
      return false
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    // You might also want to call signOut from next-auth if needed
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      loading: loading || status === 'loading'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}