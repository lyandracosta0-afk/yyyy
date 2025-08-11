import React from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'

export const SubscriptionStatus: React.FC = () => {
  const { hasActiveSubscription, subscription, loading, error, refetch } = useSubscription()

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
          <span className="text-blue-700">Verificando status da assinatura...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={refetch}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!hasActiveSubscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="text-yellow-700">Assinatura inativa ou expirada</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">Assinatura ativa</span>
        </div>
        {subscription?.current_period_end && (
          <span className="text-sm text-green-600">
            Válida até {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  )
}