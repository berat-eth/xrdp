import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'

// Supabase project credentials
const supabaseUrl = SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client with React Native AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          category: string
          image: string | null
          stock: number
          brand: string | null
          rating: number
          review_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      cart: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cart']['Insert']>
      }
      orders: {
        Row: {
          id: number
          user_id: string
          total_amount: number
          status: string
          shipping_address: string
          payment_method: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number
          quantity: number
          price: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
    }
  }
}