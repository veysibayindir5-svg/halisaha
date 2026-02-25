import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/bookings?field_id=...&start=...&end=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const field_id = searchParams.get('field_id')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const include_all = searchParams.get('include_all') === 'true'

    // Use admin client to bypass RLS — pending bookings must be visible for timetable
    const supabase = createAdminClient()
    let query = supabase.from('bookings').select('*')

    if (include_all) {
        // Admin: show everything
    } else {
        // Timetable: exclude cancelled and archived
        query = query.neq('status', 'cancelled').eq('is_archived', false)
    }

    if (field_id) query = query.eq('field_id', field_id)
    if (start) query = query.gte('booking_date', start)
    if (end) query = query.lte('booking_date', end)

    const { data, error } = await query.order('booking_date').order('start_time')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bookings: data })
}

// POST /api/bookings
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { field_id, booking_date, start_time, end_time, customer_name, customer_phone } = body

    if (!field_id || !booking_date || !start_time || !end_time || !customer_name || !customer_phone) {
        return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Conflict check: only approved bookings block time
    const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('field_id', field_id)
        .eq('booking_date', booking_date)
        .eq('start_time', start_time)
        .eq('status', 'approved')
        .single()

    if (existing) {
        return NextResponse.json(
            { error: 'Bu saat dilimi zaten dolu. Lütfen başka bir saat seçin.' },
            { status: 409 }
        )
    }

    // Check for duplicate pending booking
    const { data: pendingExisting } = await supabase
        .from('bookings')
        .select('id')
        .eq('field_id', field_id)
        .eq('booking_date', booking_date)
        .eq('start_time', start_time)
        .eq('status', 'pending')
        .single()

    if (pendingExisting) {
        return NextResponse.json(
            { error: 'Bu saat için zaten bir rezervasyon talebi bekliyor.' },
            { status: 409 }
        )
    }

    const { data, error } = await supabase
        .from('bookings')
        .insert({
            field_id,
            booking_date,
            start_time,
            end_time,
            customer_name,
            customer_phone,
            status: 'pending',
            is_archived: false,
        })
        .select()
        .single()

    if (error) {
        // Unique constraint violation — slot already taken
        if (error.code === '23505' || error.message?.includes('unique')) {
            return NextResponse.json(
                { error: 'Bu saat dilimi zaten dolu. Lütfen başka bir saat seçin.' },
                { status: 409 }
            )
        }
        return NextResponse.json({ error: 'Rezervasyon oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 })
    }
    return NextResponse.json({ booking: data }, { status: 201 })
}
