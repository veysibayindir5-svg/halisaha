import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth'
import { getCurrentAdmin } from '@/lib/auth.server'

// PATCH /api/admin/users/[id] — update permissions or password (super admin only)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const me = await getCurrentAdmin()
    if (!me || me.role !== 'super_admin') {
        return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}

    if (body.permissions) updateData.permissions = body.permissions
    if (body.password) {
        if (body.password.length < 6) {
            return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı.' }, { status: 400 })
        }
        updateData.password_hash = hashPassword(body.password)
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'Güncellenecek alan yok.' }, { status: 400 })
    }

    // Prevent modifying super_admin accounts
    const { data: target } = await supabase.from('admin_users').select('role').eq('id', id).single()
    if (target?.role === 'super_admin' && me.id !== id) {
        return NextResponse.json({ error: 'Başka bir süper admini düzenleyemezsiniz.' }, { status: 403 })
    }

    const { data, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select('id, username, role, permissions')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ user: data })
}

// DELETE /api/admin/users/[id] — delete admin user (super admin only)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const me = await getCurrentAdmin()
    if (!me || me.role !== 'super_admin') {
        return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (me.id === id) {
        return NextResponse.json({ error: 'Kendinizi silemezsiniz.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Prevent deleting other super admins
    const { data: target } = await supabase.from('admin_users').select('role').eq('id', id).single()
    if (target?.role === 'super_admin') {
        return NextResponse.json({ error: 'Süper admin hesabı silinemez.' }, { status: 403 })
    }

    const { error } = await supabase.from('admin_users').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}

