'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Calendar, Building2, Goal, LogOut, Star, ShieldCheck, Users, Image, MessageCircle } from 'lucide-react'
import type { AdminUser } from '@/lib/auth'

export default function AdminNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [admin, setAdmin] = useState<AdminUser | null>(null)

    useEffect(() => {
        fetch('/api/admin/check')
            .then(r => r.json())
            .then(d => { if (d.authenticated) setAdmin(d.user) })
    }, [])

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin')
    }

    const p = admin?.permissions

    const links = [
        { href: '/admin/bookings', label: 'Rezervasyonlar', icon: <Calendar size={18} />, show: true },
        { href: '/admin/subscribers', label: 'Aboneler', icon: <Star size={18} fill="#eab308" color="#ca8a04" />, show: p?.can_manage_subscribers ?? true },
        { href: '/admin/facilities', label: 'Tesisler', icon: <Building2 size={18} />, show: p?.can_view_facilities ?? true },
        { href: '/admin/fields', label: 'Sahalar', icon: <Goal size={18} />, show: p?.can_view_fields ?? true },
        { href: '/admin/gallery', label: 'Galeri', icon: <Image size={18} />, show: p?.can_manage_gallery ?? true },
        { href: '/admin/contact', label: 'Mesajlar', icon: <MessageCircle size={18} />, show: admin?.role === 'super_admin' || p?.can_view_messages },
        { href: '/admin/users', label: 'Kullanıcılar', icon: <Users size={18} />, show: admin?.role === 'super_admin' },
    ]

    return (
        <aside className="w-60 bg-gray-900 min-h-screen flex flex-col fixed left-0 top-0 z-30">
            <div className="p-5 border-b border-gray-700">
                <div className="text-white font-bold text-lg">⚽ Admin Panel</div>
                <div className="text-gray-400 text-xs mt-0.5">Halısaha Rezervasyon</div>
            </div>

            {/* Logged-in user info */}
            {admin && (
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${admin.role === 'super_admin' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                        {admin.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{admin.username}</div>
                        <div className="flex items-center gap-1 text-xs">
                            {admin.role === 'super_admin'
                                ? <><ShieldCheck size={10} className="text-green-400" /><span className="text-green-400">Süper Admin</span></>
                                : <span className="text-gray-400">Admin</span>
                            }
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 p-3 space-y-1">
                {links.filter(l => l.show).map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                            ? 'bg-green-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="p-3 border-t border-gray-700 space-y-1">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                    <LayoutDashboard size={18} /> Siteye Git
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-white hover:bg-red-900/50 transition"
                >
                    <LogOut size={18} /> Çıkış Yap
                </button>
            </div>
        </aside>
    )
}
