export interface Database {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          email: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          user_id?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string | null
          stock: number | null
          active: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number
          category?: string | null
          stock?: number | null
          active?: boolean
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string | null
          stock?: number | null
          active?: boolean
          created_at?: string
          user_id?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          status: string
          total: number
          delivery_date: string | null
          notes: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          customer_id: string
          status?: string
          total?: number
          delivery_date?: string | null
          notes?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          customer_id?: string
          status?: string
          total?: number
          delivery_date?: string | null
          notes?: string | null
          created_at?: string
          user_id?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          price?: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
    }
  }
}