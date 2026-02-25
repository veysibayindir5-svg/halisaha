import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/admin/logout
export async function POST() {
    const response = NextResponse.json({ success: true })
    const cookieStore = await cookies()
    cookieStore.getAll().forEach(c => {
        response.cookies.delete(c.name)
    })
    response.cookies.delete('admin_session')
    response.cookies.delete('admin_auth')
    return response
}
