import React, { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

interface StripeCheckoutProps {
  className?: string
  children?: React.ReactNode
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  className = '', 
  children 
}) => {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      // Redirect to Stripe Checkout
      window.location.href = import.meta.env.VITE_STRIPE_CHECKOUT_URL
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecionando...</span>
        </>
      ) : (
        children || (
          <>
            <CreditCard className="h-4 w-4" />
            <span>Assinar Agora</span>
          </>
        )
      )}
    </button>
  )
}