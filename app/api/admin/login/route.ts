import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyPassword, encodeSession, SUPER_ADMIN_PERMISSIONS, DEFAULT_PERMISSIONS, AdminUser, COOKIE_NAME } from '@/lib/auth'


// POST /api/admin/login
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
        return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .single()

    if (error || !user) {
        return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı.' }, { status: 401 })
    }

    if (!verifyPassword(password, user.password_hash)) {
        return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı.' }, { status: 401 })
    }

    const permissions = user.role === 'super_admin'
        ? SUPER_ADMIN_PERMISSIONS
        : { ...DEFAULT_PERMISSIONS, ...user.permissions }

    const adminUser: AdminUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions,
    }

    const sessionValue = encodeSession(adminUser)

    const response = NextResponse.json({ success: true, user: { username: adminUser.username, role: adminUser.role } })
    response.cookies.set(COOKIE_NAME, sessionValue, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
        sameSite: 'lax',
    })
    // Keep backward compat cookie for existing check calls (transition)
    response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 8,
        sameSite: 'lax',
    })
    return response
}
