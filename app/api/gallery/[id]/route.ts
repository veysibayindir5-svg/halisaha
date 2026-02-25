import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth.server'

// DELETE /api/gallery/[id] - Admin only: delete gallery item
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getCurrentAdmin()
    if (!admin || !admin.permissions.can_manage_gallery) {
        return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
