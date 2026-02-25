import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth.server'

// GET /api/gallery - Public access to gallery items
export async function GET() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
}

// POST /api/gallery - Admin only: Add new gallery item
export async function POST(req: NextRequest) {
    const admin = await getCurrentAdmin()
    if (!admin || !admin.permissions.can_manage_gallery) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { emoji, label, image_url } = body

        if (!label) {
            return NextResponse.json({ error: 'Lütfen bir başlık girin.' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('gallery')
            .insert({ emoji, label, image_url })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ item: data })
    } catch {
        return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })
    }
}
