import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscription: any | null
  loading: boolean
  error: string | null
}

export const useSubscription = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    subscription: null,
    loading: true,
    error: null
  })

  const checkSubscription = async () => {
    if (!user?.email) {
      setStatus({
        hasActiveSubscription: false,
        subscription: null,
        loading: false,
        error: null
      })
      return
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription?email=${encodeURIComponent(user.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to check subscription')
      }

      const result = await response.json()
      
      setStatus({
        hasActiveSubscription: result.hasActiveSubscription,
        subscription: result.subscription,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error checking subscription:', error)
      setStatus({
        hasActiveSubscription: false,
        subscription: null,
        loading: false,
        error: 'Erro ao verificar assinatura'
      })
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [user?.email])

  return {
    ...status,
    refetch: checkSubscription
  }
}