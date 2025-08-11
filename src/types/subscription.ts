export interface UserSubscription {
  id: string
  user_id: string
  email: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionCheckResponse {
  email: string
  hasActiveSubscription: boolean
  subscription: UserSubscription | null
}

export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}