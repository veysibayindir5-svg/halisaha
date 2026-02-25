import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashPassword, DEFAULT_PERMISSIONS } from '@/lib/auth'
import { getCurrentAdmin } from '@/lib/auth.server'

// GET /api/admin/users — list all admin users (super admin only)
export async function GET() {
    const me = await getCurrentAdmin()
    if (!me || me.role !== 'super_admin') {
        return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, role, permissions, created_at')
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ users: data })
}

// POST /api/admin/users — create new admin user (super admin only)
export async function POST(req: NextRequest) {
    const me = await getCurrentAdmin()
    if (!me || me.role !== 'super_admin') {
        return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
    }

    const body = await req.json()
    const { username, password, permissions } = body

    if (!username || !password) {
        return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli.' }, { status: 400 })
    }
    if (password.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const password_hash = hashPassword(password)

    const { data, error } = await supabase
        .from('admin_users')
        .insert({
            username: username.trim().toLowerCase(),
            password_hash,
            role: 'admin',
            permissions: permissions ?? DEFAULT_PERMISSIONS,
        })
        .select('id, username, role, permissions, created_at')
        .single()

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data }, { status: 201 })
}
