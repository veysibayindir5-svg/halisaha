'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Phone, MapPin, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({ customer_name: '', customer_phone: '', message: '' })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings || {}))
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('loading')
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setStatus('success')
                setFormData({ customer_name: '', customer_phone: '', message: '' })
            } else {
                setStatus('error')
            }
        } catch {
            setStatus('error')
        }
    }

    const contactInfo = [
        { icon: <Phone size={18} className="text-green-600" />, label: 'Telefon', value: settings.phone || '...' },
        { icon: <Mail size={18} className="text-green-600" />, label: 'E-posta', value: settings.email || '...' },
        { icon: <MapPin size={18} className="text-green-600" />, label: 'Adres', value: settings.address || '...' },
        { icon: <Clock size={18} className="text-green-600" />, label: 'Çalışma Saatleri', value: settings.hours || '...' },
    ]

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
                <h1 className="text-3xl font-black text-gray-800 mb-2">İletişim</h1>
                <p className="text-gray-500 mb-8">Sorularınız için bizimle iletişime geçebilirsiniz.</p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Info */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="font-bold text-gray-800 mb-4 text-lg">İletişim Bilgileri</h2>
                            {contactInfo.map(item => (
                                <div key={item.label} className="flex items-start gap-3 mb-3">
                                    <div className="mt-0.5">{item.icon}</div>
                                    <div>
                                        <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                                        <div className="text-sm text-gray-700 font-medium">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="font-bold text-gray-800 mb-4 text-lg">Mesaj Gönder</h2>

                        {status === 'success' ? (
                            <div className="py-10 text-center">
                                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                                <p className="text-green-800 font-bold text-lg">Mesajınız Alındı!</p>
                                <p className="text-green-600 text-sm mt-1">En kısa sürede size geri dönüş yapacağız.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-green-700 text-sm font-bold hover:underline"
                                >
                                    Yeni Mesaj Gönder
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Adınız"
                                        value={formData.customer_name}
                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="05xx xxx xx xx"
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                        placeholder="Mesajınızı yazın..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    <Send size={15} />
                                    {status === 'loading' ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                                </button>
                                {status === 'error' && <p className="text-red-500 text-xs text-center">Mesaj gönderilemedi, lütfen tekrar deneyin.</p>}
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
