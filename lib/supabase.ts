import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations that need elevated privileges
// Falls back to regular client if service key is not available
export const supabaseAdmin = supabaseServiceKey
    ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : supabase
