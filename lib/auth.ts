import { createHash, randomBytes, pbkdf2Sync } from 'crypto'

export interface AdminUser {
    id: string
    username: string
    role: 'super_admin' | 'admin'
    permissions: AdminPermissions
}

export interface AdminPermissions {
    can_view_facilities: boolean
    can_manage_facilities: boolean
    can_view_fields: boolean
    can_manage_fields: boolean
    can_approve_bookings: boolean
    can_cancel_bookings: boolean
    can_delete_bookings: boolean
    can_archive_bookings: boolean
    can_manage_subscribers: boolean
    can_manage_gallery: boolean
    can_view_messages: boolean
}

export const DEFAULT_PERMISSIONS: AdminPermissions = {
    can_view_facilities: true,
    can_manage_facilities: false,
    can_view_fields: true,
    can_manage_fields: false,
    can_approve_bookings: true,
    can_cancel_bookings: true,
    can_delete_bookings: false,
    can_archive_bookings: true,
    can_manage_subscribers: false,
    can_manage_gallery: true,
    can_view_messages: false,
}

export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
    can_view_facilities: true,
    can_manage_facilities: true,
    can_view_fields: true,
    can_manage_fields: true,
    can_approve_bookings: true,
    can_cancel_bookings: true,
    can_delete_bookings: true,
    can_archive_bookings: true,
    can_manage_subscribers: true,
    can_manage_gallery: true,
    can_view_messages: true,
}

export const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
    can_view_facilities: 'Tesisleri Görüntüle',
    can_manage_facilities: 'Tesis Ekle/Düzenle/Sil',
    can_view_fields: 'Sahaları Görüntüle',
    can_manage_fields: 'Saha Ekle/Düzenle/Sil',
    can_approve_bookings: 'Rezervasyon Onayla',
    can_cancel_bookings: 'Rezervasyon İptal Et',
    can_delete_bookings: 'Rezervasyon Sil',
    can_archive_bookings: 'Rezervasyon Arşivle',
    can_manage_subscribers: 'Aboneleri Yönet',
    can_manage_gallery: 'Galeriyi Yönet',
    can_view_messages: 'İletişim Mesajlarını Gör',
}

// ─── Password hashing (server-side only, but safe to import on client) ────────

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex')
    const hash = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':')
    const attempt = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
    return attempt === hash
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

export const COOKIE_NAME = 'admin_session'
const SECRET = process.env.ADMIN_SECRET || 'halisaha-secret-key-2025'

function sign(data: string): string {
    const sig = createHash('sha256').update(data + SECRET).digest('hex').slice(0, 16)
    return `${data}.${sig}`
}

function verify(value: string): string | null {
    const lastDot = value.lastIndexOf('.')
    if (lastDot === -1) return null
    const data = value.slice(0, lastDot)
    const sig = value.slice(lastDot + 1)
    const expected = createHash('sha256').update(data + SECRET).digest('hex').slice(0, 16)
    return sig === expected ? data : null
}

export function encodeSession(user: AdminUser): string {
    const payload = Buffer.from(JSON.stringify(user)).toString('base64')
    return sign(payload)
}

export function decodeSession(value: string): AdminUser | null {
    const payload = verify(value)
    if (!payload) return null
    try {
        return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as AdminUser
    } catch {
        return null
    }
}
