import { supabase } from '../lib/supabase'

export interface SubscriptionCheckResult {
  email: string
  hasActiveSubscription: boolean
  subscription: any | null
}

export const checkUserSubscription = async (email: string): Promise<SubscriptionCheckResult> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription?email=${encodeURIComponent(email)}`,
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

    return await response.json()
  } catch (error) {
    console.error('Error checking subscription:', error)
    return {
      email,
      hasActiveSubscription: false,
      subscription: null
    }
  }
}

export const formatSubscriptionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Ativa',
    'inactive': 'Inativa',
    'canceled': 'Cancelada',
    'past_due': 'Em Atraso',
    'trialing': 'Período de Teste'
  }
  
  return statusMap[status] || status
}

export const isSubscriptionActive = (subscription: any): boolean => {
  if (!subscription) return false
  
  const isActive = subscription.subscription_status === 'active'
  const notExpired = !subscription.current_period_end || 
    new Date(subscription.current_period_end) > new Date()
  
  return isActive && notExpired
}