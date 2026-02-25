// Server-only auth utilities — do NOT import this in Client Components
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminUser, decodeSession, COOKIE_NAME } from '@/lib/auth'

export async function getCurrentAdmin(): Promise<AdminUser | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get(COOKIE_NAME)
    if (!session?.value) return null
    return decodeSession(session.value)
}

export async function requireSuperAdmin(): Promise<AdminUser | null> {
    const admin = await getCurrentAdmin()
    if (!admin || admin.role !== 'super_admin') return null
    return admin
}

export async function getAdminUsers() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, role, permissions, created_at')
        .order('created_at', { ascending: true })
    if (error) return []
    return data
}
