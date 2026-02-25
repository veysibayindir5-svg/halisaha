import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// GET /api/subscribers - list all active subscriptions grouped by subscriber_group_id
export async function GET() {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('bookings')
        .select('*, field:fields(*, facility:facilities(*))')
        .eq('is_subscriber', true)
        .not('subscriber_group_id', 'is', null)
        .order('booking_date', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Group by subscriber_group_id
    const groups: Record<string, {
        group_id: string
        customer_name: string
        customer_phone: string
        field_id: string
        field_name: string
        facility_name: string
        start_time: string
        end_time: string
        weekday: number // 0=Sun..6=Sat
        first_date: string
        total_bookings: number
        future_bookings: number
        status: 'active' | 'cancelled'
    }> = {}

    const today = new Date().toISOString().split('T')[0]

    for (const b of (data || [])) {
        const gid = b.subscriber_group_id
        if (!groups[gid]) {
            const date = new Date(b.booking_date)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const field = b.field as any
            groups[gid] = {
                group_id: gid,
                customer_name: b.customer_name,
                customer_phone: b.customer_phone,
                field_id: b.field_id,
                field_name: field?.name || '',
                facility_name: field?.facility?.name || '',
                start_time: b.start_time,
                end_time: b.end_time,
                weekday: date.getDay(),
                first_date: b.booking_date,
                total_bookings: 0,
                future_bookings: 0,
                status: 'active',
            }
        }
        groups[gid].total_bookings++
        if (b.booking_date >= today && b.status !== 'cancelled') {
            groups[gid].future_bookings++
        }
        if (b.status === 'cancelled') {
            // if all future are cancelled, mark as cancelled
        }
    }

    // Mark as cancelled if no future bookings
    for (const g of Object.values(groups)) {
        if (g.future_bookings === 0) g.status = 'cancelled'
    }

    return NextResponse.json({ subscriptions: Object.values(groups) })
}

// POST /api/subscribers - create a new recurring subscription (52 weeks)
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { field_id, start_date, start_time, end_time, customer_name, customer_phone, weeks = 52 } = body

    if (!field_id || !start_date || !start_time || !end_time || !customer_name || !customer_phone) {
        return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const group_id = randomUUID()

    // Generate dates for the next `weeks` occurrences of the same weekday
    const startDate = new Date(start_date)
    const records = []

    for (let i = 0; i < weeks; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i * 7)
        const dateStr = date.toISOString().split('T')[0]

        records.push({
            field_id,
            booking_date: dateStr,
            start_time,
            end_time,
            customer_name,
            customer_phone,
            status: 'approved',
            is_archived: false,
            is_subscriber: true,
            subscriber_group_id: group_id,
        })
    }

    // Insert all at once (ignore conflicts for existing slots)
    const { error } = await supabase
        .from('bookings')
        .insert(records)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ group_id, total: records.length }, { status: 201 })
}
