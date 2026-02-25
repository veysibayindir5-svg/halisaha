'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { RefreshCw } from 'lucide-react'

interface GalleryItem {
    id: string
    emoji: string
    label: string
}

export default function GalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/gallery')
            .then(res => res.json())
            .then(data => {
                setItems(data.items || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
                <h1 className="text-3xl font-black text-gray-800 mb-2">Galeri</h1>
                <p className="text-gray-500 mb-8">Tesisimizden görüntüler</p>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
                        <p>Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {items.map((img) => (
                            <div
                                key={img.id}
                                className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl border border-green-200 aspect-video flex flex-col items-center justify-center hover:shadow-lg transition-all group cursor-pointer"
                            >
                                <span className="text-6xl mb-3 group-hover:scale-110 transition-transform">{img.emoji || '🖼️'}</span>
                                <span className="text-sm font-medium text-gray-600">{img.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <p className="text-green-800 text-sm font-medium">
                        📸 Daha fazla fotoğraf için bizi sosyal medyada takip edin!
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
