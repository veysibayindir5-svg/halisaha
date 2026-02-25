import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth.server'

// GET /api/contact - Super Admin only: List contact messages
export async function GET() {
    const admin = await getCurrentAdmin()
    if (!admin || admin.role !== 'super_admin') {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages: data })
}

// POST /api/contact - Public: Send message
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { customer_name, customer_phone, message } = body

        if (!customer_name || !customer_phone || !message) {
            return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('contact_messages')
            .insert({ customer_name, customer_phone, message })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true, message: data })
    } catch {
        return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })
    }
}
