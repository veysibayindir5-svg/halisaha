import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth.server'

// GET /api/settings - Public: Get site settings (contact info etc)
export async function GET() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const settings: Record<string, string> = {}
    data.forEach(s => { settings[s.key] = s.value })

    return NextResponse.json({ settings })
}

// PATCH /api/settings - Admin only: update settings
export async function PATCH(req: NextRequest) {
    const admin = await getCurrentAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
    }

    try {
        const body = await req.json() // Expecting { key: value } pairs
        const supabase = createAdminClient()

        const updates = Object.entries(body).map(([key, value]) => {
            return supabase
                .from('site_settings')
                .upsert({ key, value: String(value), updated_at: new Date().toISOString() })
        })

        const results = await Promise.all(updates)
        const errors = results.filter(r => r.error)

        if (errors.length > 0) {
            return NextResponse.json({ error: 'Bazı ayarlar güncellenemedi.' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })
    }
}
