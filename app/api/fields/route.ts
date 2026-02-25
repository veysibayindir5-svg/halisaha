import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/fields?facility_id=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const facility_id = searchParams.get('facility_id')

    const supabase = createServerClient()
    let query = supabase.from('fields').select('*, facility:facilities(*)').order('name')
    if (facility_id) query = query.eq('facility_id', facility_id)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ fields: data })
}

// POST /api/fields (admin)
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { facility_id, name, type } = body

    if (!facility_id || !name) {
        return NextResponse.json({ error: 'Tesis ve saha adı zorunludur.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('fields')
        .insert({ facility_id, name, type })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ field: data }, { status: 201 })
}
