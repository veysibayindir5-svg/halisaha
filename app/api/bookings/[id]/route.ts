import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// PATCH /api/bookings/[id] - approve, cancel, archive
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await req.json()
    const { action } = body

    const supabase = createAdminClient()
    let updateData: Record<string, unknown> = {}

    if (action === 'approve') {
        updateData = { status: 'approved' }
    } else if (action === 'cancel') {
        updateData = { status: 'cancelled' }
    } else if (action === 'archive') {
        updateData = { is_archived: true }
    } else if (action === 'set_subscriber') {
        updateData = { is_subscriber: true, status: 'approved' }
    } else if (action === 'unset_subscriber') {
        updateData = { is_subscriber: false }
    } else {
        return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ booking: data })
}

// DELETE /api/bookings/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
