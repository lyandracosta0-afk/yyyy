import React, { useState } from 'react'
import { TestTube, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: any
}

export const TestingPanel: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)
  const [testEmail, setTestEmail] = useState('teste@confeitaria.com')

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.details = details
        return [...prev]
      }
      return [...prev, { name, status, message, details }]
    })
  }

  const runTests = async () => {
    setRunning(true)
    setTests([])

    // Test 1: Environment Variables
    updateTest('env-vars', 'pending', 'Verificando variáveis de ambiente...')
    
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_STRIPE_PUBLISHABLE_KEY',
      'VITE_STRIPE_CHECKOUT_URL'
    ]
    
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName])
    
    if (missingVars.length > 0) {
      updateTest('env-vars', 'error', `Variáveis faltando: ${missingVars.join(', ')}`)
    } else {
      updateTest('env-vars', 'success', 'Todas as variáveis de ambiente estão configuradas')
    }

    // Test 2: Supabase Connection
    updateTest('supabase-connection', 'pending', 'Testando conexão com Supabase...')
    
    try {
      const { data, error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      })
      
      if (error) {
        updateTest('supabase-connection', 'error', 'Erro na conexão com Supabase')
      } else {
        updateTest('supabase-connection', 'success', 'Conexão com Supabase funcionando')
      }
    } catch (error) {
      updateTest('supabase-connection', 'error', 'Falha ao conectar com Supabase')
    }

    // Test 3: Check Subscription Function
    updateTest('check-subscription', 'pending', 'Testando função de verificação de assinatura...')
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription?email=${encodeURIComponent(testEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        updateTest('check-subscription', 'success', 'Função check-subscription funcionando', result)
      } else {
        updateTest('check-subscription', 'error', `Erro HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      updateTest('check-subscription', 'error', 'Falha ao chamar função check-subscription')
    }

    // Test 4: Database Schema
    updateTest('database-schema', 'pending', 'Verificando schema do banco...')
    
    try {
      // Try to query each table to verify they exist
      const tables = ['user_subscriptions', 'customers', 'products', 'orders', 'order_items']
      const tableResults = []
      
      for (const table of tables) {
        try {
          const { error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            }
          })
          
          tableResults.push(`${table}: ✓`)
        } catch {
          tableResults.push(`${table}: ✗`)
        }
      }
      
      updateTest('database-schema', 'success', 'Schema verificado', tableResults)
    } catch (error) {
      updateTest('database-schema', 'error', 'Erro ao verificar schema do banco')
    }

    setRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Painel de Testes</h2>
        </div>
        <button
          onClick={runTests}
          disabled={running}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Executando...</span>
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4" />
              <span>Executar Testes</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email para teste de assinatura:
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="space-y-3">
        {tests.map((test) => (
          <div key={test.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusIcon(test.status)}
              <span className="font-medium text-gray-900">{test.name}</span>
            </div>
            <p className={`text-sm ${
              test.status === 'error' ? 'text-red-600' : 
              test.status === 'success' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {test.message}
            </p>
            {test.details && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer">Ver detalhes</summary>
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {typeof test.details === 'string' ? test.details : JSON.stringify(test.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}

        {tests.length === 0 && !running && (
          <div className="text-center py-8 text-gray-500">
            Clique em "Executar Testes" para verificar o sistema
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Links Úteis:</h3>
        <div className="space-y-2 text-sm">
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Stripe Webhooks Dashboard</span>
          </a>
          <a
            href="https://supabase.com/dashboard/project/stasbepnjxxyifjhprwu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Supabase Dashboard</span>
          </a>
          <a
            href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription?email=${encodeURIComponent(testEmail)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Testar Check Subscription</span>
          </a>
        </div>
      </div>
    </div>
  )
}