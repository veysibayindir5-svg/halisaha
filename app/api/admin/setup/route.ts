import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashPassword, SUPER_ADMIN_PERMISSIONS } from '@/lib/auth'

// POST /api/admin/setup
// One-time endpoint to create the first super admin.
// Only works if no admin users exist yet.
export async function POST(req: NextRequest) {
    const supabase = createAdminClient()

    // Check if any admin users exist
    const { count } = await supabase
        .from('admin_users')
        .select('id', { count: 'exact', head: true })

    if ((count ?? 0) > 0) {
        return NextResponse.json({ error: 'Kurulum zaten tamamlanmış. Bu endpoint kullanılamaz.' }, { status: 403 })
    }

    const body = await req.json()
    const { username, password } = body

    if (!username || !password || password.length < 6) {
        return NextResponse.json({ error: 'Geçerli bir kullanıcı adı ve en az 6 karakterli şifre girin.' }, { status: 400 })
    }

    const password_hash = hashPassword(password)

    const { data, error } = await supabase
        .from('admin_users')
        .insert({
            username: username.trim().toLowerCase(),
            password_hash,
            role: 'super_admin',
            permissions: SUPER_ADMIN_PERMISSIONS,
        })
        .select('id, username, role')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
        success: true,
        message: `Süper admin "${data.username}" oluşturuldu. Bu endpoint artık kullanılamaz.`,
        user: { id: data.id, username: data.username, role: data.role }
    }, { status: 201 })
}
