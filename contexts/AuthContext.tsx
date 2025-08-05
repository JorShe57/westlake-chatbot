"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { auth, User as UserProfile, supabase } from '@/lib/supabase'
import { config } from '@/lib/config'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role?: 'admin' | 'user') => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  sendVerificationEmail: (email: string) => Promise<void>
  isAdmin: boolean
  isAuthenticated: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fallback authentication for when Supabase is not configured
const fallbackAuth = {
  users: [
    { email: 'admin@westlake.org', password: 'Admin123!', role: 'admin' },
    { email: 'user@westlake.org', password: 'User123!', role: 'user' },
    { email: config.admin.username, password: config.admin.password, role: 'admin' }
  ],
  
  signIn: async (email: string, password: string) => {
    const user = fallbackAuth.users.find(u => u.email === email && u.password === password)
    if (!user) {
      throw new Error('Invalid email or password')
    }
    return { user: { id: email, email }, profile: { id: email, email, role: user.role } }
  },
  
  signUp: async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    // Check if user already exists
    const existingUser = fallbackAuth.users.find(u => u.email === email)
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    // Add new user to the list
    fallbackAuth.users.push({ email, password, role })
    return { user: { id: email, email }, profile: { id: email, email, role } }
  },
  
  signOut: async () => {
    // No-op for fallback auth
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    // Check for existing session
    const checkUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          
          // Get user profile
          const profile = await auth.getUserProfile(currentUser.id)
          setUserProfile(profile)
          setIsAdmin(profile.role === 'admin')
        }
      } catch (error) {
        console.error('Error checking user session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user)
            
            try {
              const profile = await auth.getUserProfile(session.user.id)
              setUserProfile(profile)
              setIsAdmin(profile.role === 'admin')
            } catch (error) {
              console.error('Error getting user profile:', error)
            }
          } else {
            setUser(null)
            setUserProfile(null)
            setIsAdmin(false)
          }
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    
    try {
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Use Supabase authentication
        await auth.signIn(email, password)
      } else {
        // Use fallback authentication
        const result = await fallbackAuth.signIn(email, password)
        setUser(result.user as User)
        setUserProfile(result.profile)
        setIsAdmin(result.profile.role === 'admin')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    setError(null)
    setLoading(true)
    
    try {
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Use Supabase authentication
        await auth.signUp(email, password, role)
      } else {
        // Use fallback authentication
        const result = await fallbackAuth.signUp(email, password, role)
        setUser(result.user as User)
        setUserProfile(result.profile)
        setIsAdmin(result.profile.role === 'admin')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setError(null)
    
    try {
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await auth.signOut()
      } else {
        await fallbackAuth.signOut()
      }
      
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
    } catch (error: any) {
      const errorMessage = error.message || 'Sign out failed'
      setError(errorMessage)
      throw error
    }
  }
  
  const resetPassword = async (email: string) => {
    setError(null)
    setLoading(true)
    
    try {
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Use Supabase authentication
        await auth.resetPassword(email)
      } else {
        // For fallback, we'll just simulate success
        // In a real app, you'd need to implement a fallback mechanism
        console.log('Password reset requested for:', email)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  const updatePassword = async (newPassword: string) => {
    setError(null)
    setLoading(true)
    
    try {
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Use Supabase authentication
        await auth.updatePassword(newPassword)
      } else {
        // For fallback, we'll just simulate success
        console.log('Password updated')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Password update failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  const sendVerificationEmail = async (email: string) => {
    setError(null)
    setLoading(true)
    
    try {
      if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Use Supabase authentication
        await auth.sendVerificationEmail(email)
      } else {
        // For fallback, we'll just simulate success
        console.log('Verification email sent to:', email)
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification email'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    sendVerificationEmail,
    isAdmin,
    isAuthenticated,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
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