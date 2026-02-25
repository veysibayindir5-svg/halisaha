'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/AdminNav'
import { Image as ImageIcon, Plus, Trash2, RefreshCw } from 'lucide-react'

interface GalleryItem {
    id: string
    emoji: string
    label: string
    image_url: string | null
}

export default function AdminGalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newLabel, setNewLabel] = useState('')
    const [newEmoji, setNewEmoji] = useState('⚽')
    const [addLoading, setAddLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            const res = await fetch('/api/gallery')
            const data = await res.json()
            setItems(data.items || [])
        } finally {
            setLoading(false)
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        setAddLoading(true)
        try {
            const res = await fetch('/api/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newLabel, emoji: newEmoji })
            })
            if (res.ok) {
                setNewLabel('')
                setNewEmoji('⚽')
                setShowAddModal(false)
                fetchData()
            }
        } finally {
            setAddLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return
        const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
        if (res.ok) fetchData()
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ImageIcon size={24} className="text-green-600" /> Galeri Yönetimi
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">{items.length} görsel mevcut</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition shadow-md"
                        >
                            <Plus size={15} /> Yeni Ekle
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <RefreshCw size={32} className="animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                                <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-b border-gray-100">
                                    <span className="text-5xl">{item.emoji || '🖼️'}</span>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <span className="font-medium text-gray-700 truncate mr-2">{item.label}</span>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
                        <div className="px-6 py-4 bg-green-700 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-white">Yeni Görsel Ekle</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-white hover:opacity-70 text-xl font-bold">×</button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji / Simge</label>
                                <input
                                    required
                                    value={newEmoji}
                                    onChange={e => setNewEmoji(e.target.value)}
                                    placeholder="Emoji girin (örn: ⚽)"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                <input
                                    required
                                    value={newLabel}
                                    onChange={e => setNewLabel(e.target.value)}
                                    placeholder="Görsel başlığı"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addLoading}
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
                                >
                                    {addLoading ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
