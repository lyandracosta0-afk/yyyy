import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserSubscription {
  id: string
  user_id: string
  email: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  hasActiveSubscription: boolean
  subscription: UserSubscription | null
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUpWithEmailPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  checkSubscription: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)

  const checkSubscription = async () => {
    if (!user?.id) {
      setHasActiveSubscription(false)
      setSubscription(null)
      return
    }

    try {
      // Use the edge function to check subscription
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription?email=${encodeURIComponent(user.email!)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        setHasActiveSubscription(false)
        setSubscription(null)
        return
      }

      const result = await response.json()
      setHasActiveSubscription(result.hasActiveSubscription)
      setSubscription(result.subscription)

      console.log('Subscription check result:', result)
    } catch (error) {
      console.error('Error checking subscription:', error)
      setHasActiveSubscription(false)
      setSubscription(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Clear subscription data when user signs out
        if (event === 'SIGNED_OUT') {
          setHasActiveSubscription(false)
          setSubscription(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      checkSubscription()
    } else {
      setHasActiveSubscription(false)
      setSubscription(null)
    }
  }, [user])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      return { error }
    } catch (error) {
      return { error: { message: 'Erro ao fazer login com Google. Tente novamente.' } as AuthError }
    }
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error }
    } catch (error) {
      return { error: { message: 'Erro ao fazer login. Tente novamente.' } }
    }
  }

  const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      return { error }
    } catch (error) {
      return { error: { message: 'Erro ao criar conta. Tente novamente.' } }
    }
  }

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setHasActiveSubscription(false)
    setSubscription(null)
  }

  const value = {
    user,
    loading,
    hasActiveSubscription,
    subscription,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    checkSubscription,
    sendPasswordReset
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}