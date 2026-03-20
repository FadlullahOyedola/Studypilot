import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for backend API routes (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Get user profile from auth token
export async function getUserFromToken(token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single()
    return profile
}