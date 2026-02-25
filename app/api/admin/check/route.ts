import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth.server'

// GET /api/admin/check - verifies admin session and returns user info + permissions
export async function GET() {
    const admin = await getCurrentAdmin()
    if (!admin) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    return NextResponse.json({
        authenticated: true,
        user: {
            id: admin.id,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions,
        }
    })
}
