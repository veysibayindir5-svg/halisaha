import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/facilities
export async function GET() {
    const supabase = createServerClient()
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ facilities: data })
}

// POST /api/facilities (admin)
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { name, address, phone } = body

    if (!name) return NextResponse.json({ error: 'Tesis adı zorunludur.' }, { status: 400 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('facilities')
        .insert({ name, address, phone })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ facility: data }, { status: 201 })
}
