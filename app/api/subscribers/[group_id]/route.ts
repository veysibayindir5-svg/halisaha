import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// DELETE /api/subscribers/[group_id] - cancel all future bookings in this subscription group
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ group_id: string }> }
) {
    const { group_id } = await params
    const supabase = createAdminClient()

    const today = new Date().toISOString().split('T')[0]

    // Cancel all future (>= today) bookings in this group
    const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('subscriber_group_id', group_id)
        .gte('booking_date', today)
        .neq('status', 'cancelled')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
