'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/schedule', label: 'Saatler' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/contact', label: 'İletişim' },
]

export default function Header() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header className="bg-green-700 text-white shadow-lg">
            {/* Top bar */}
            <div className="bg-green-900 py-1.5 px-4">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4 text-sm text-green-200">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>Kilis Merkez</span>
                    </span>
                </div>
            </div>

            {/* Main nav */}
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-black text-lg">⚽</span>
                    </div>
                    <div>
                        <div className="font-bold text-xl leading-tight">Halısaha Rezervasyon</div>
                        <div className="text-green-300 text-xs">Online Rezervasyon Sistemi</div>
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                ? 'bg-white text-green-700'
                                : 'text-white hover:bg-green-600'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                </nav>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-green-600 transition"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-green-600 bg-green-800 px-4 py-3 flex flex-col gap-1">
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                ? 'bg-white text-green-700'
                                : 'text-white hover:bg-green-700'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                </div>
            )}
        </header>
    )
}
