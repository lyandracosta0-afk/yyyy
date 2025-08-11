import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get email from query params or request body
    const url = new URL(req.url)
    let email = url.searchParams.get('email')

    if (!email && req.method === 'POST') {
      const body = await req.json()
      email = body.email
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Checking subscription for email:', email)

    // Check subscription status in database
    const { data: subscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error', hasActiveSubscription: false }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if subscription is active and not expired
    let hasActiveSubscription = false
    
    if (subscription) {
      const isActive = subscription.subscription_status === 'active'
      const notExpired = !subscription.current_period_end || 
        new Date(subscription.current_period_end) > new Date()
      
      hasActiveSubscription = isActive && notExpired
    }

    console.log('Subscription check result:', {
      email,
      hasActiveSubscription,
      status: subscription?.subscription_status,
      expiresAt: subscription?.current_period_end
    })

    return new Response(
      JSON.stringify({
        email,
        hasActiveSubscription,
        subscription: subscription || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', hasActiveSubscription: false }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})