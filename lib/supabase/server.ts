import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-side admin client (uses service role key - never exposed to browser)
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error('MISSING_SUPABASE_CONFIG: URL or Service Role Key is undefined.')
    }

    return createSupabaseClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}

// Regular server client with anon key
export function createServerClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('MISSING_SUPABASE_CONFIG: URL or Anon Key is undefined.')
    }

    return createSupabaseClient(url, key)
}
