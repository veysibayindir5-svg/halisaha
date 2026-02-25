'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/AdminNav'
import { MessageCircle, RefreshCw, User, Phone, Calendar, Clock } from 'lucide-react'

interface Message {
    id: string
    customer_name: string
    customer_phone: string
    message: string
    status: 'new' | 'read' | 'replied'
    created_at: string
}

export default function AdminContactPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [settings, setSettings] = useState<Record<string, string>>({
        phone: '',
        email: '',
        address: '',
        hours: ''
    })
    const [loading, setLoading] = useState(true)
    const [settingsLoading, setSettingsLoading] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        fetchData()
        fetchSettings()
    }, [])

    async function fetchSettings() {
        const res = await fetch('/api/settings')
        const data = await res.json()
        if (data.settings) setSettings(data.settings)
    }

    async function fetchData() {
        setLoading(true)
        try {
            const res = await fetch('/api/contact')
            const data = await res.json()
            setMessages(data.messages || [])
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdateSettings(e: React.FormEvent) {
        e.preventDefault()
        setSettingsLoading(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                setShowSettings(false)
                alert('Ayarlar güncellendi.')
            }
        } finally {
            setSettingsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <MessageCircle size={24} className="text-green-600" /> İletişim Mesajları
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">{messages.length} mesaj mevcut</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition ${showSettings ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <User size={15} /> Bilgileri Düzenle
                        </button>
                        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm transition">
                            <RefreshCw size={15} /> Yenile
                        </button>
                    </div>
                </div>

                {showSettings && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            İletişim Bilgilerini Güncelle
                        </h2>
                        <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Telefon</label>
                                <input
                                    value={settings.phone}
                                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">E-posta</label>
                                <input
                                    value={settings.email}
                                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Adres</label>
                                <input
                                    value={settings.address}
                                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Çalışma Saatleri</label>
                                <input
                                    value={settings.hours}
                                    onChange={e => setSettings({ ...settings, hours: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={settingsLoading}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {settingsLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <RefreshCw size={32} className="animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Yükleniyor...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
                        <MessageCircle size={48} className="text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">Henüz mesaj alınmadı.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                            {msg.customer_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{msg.customer_name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                <span className="flex items-center gap-1"><Phone size={12} /> {msg.customer_phone}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(msg.created_at).toLocaleDateString('tr-TR')}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {msg.status === 'new' && (
                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-wider">Yeni Mesaj</span>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed italic border border-gray-100">
                                    "{msg.message}"
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <a
                                        href={`tel:${msg.customer_phone}`}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
                                    >
                                        Müşteriyi Ara
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
