// Stripe utilities for client-side operations

export const redirectToCheckout = () => {
  const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL
  
  if (!checkoutUrl) {
    console.error('VITE_STRIPE_CHECKOUT_URL not configured')
    return
  }

  window.location.href = checkoutUrl
}

export const formatPrice = (amount: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100) // Stripe amounts are in cents
}

export const validateStripeConfig = (): boolean => {
  const requiredVars = [
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_STRIPE_CHECKOUT_URL'
  ]

  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    console.error('Missing Stripe configuration:', missing)
    return false
  }

  return true
}