'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, Loader2, Lock } from 'lucide-react'

export default function AdminSetupPage() {
    const [username, setUsername] = useState('admin')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/admin/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            })

            let data: any
            try {
                data = await res.json()
            } catch (e) {
                setError(`Sunucu hatası (JSON ayrıştırma başarısız). Durum: ${res.status}`)
                return
            }

            if (!res.ok) {
                setError(data.error || `İşlem başarısız: ${res.status}`)
                return
            }

            setDone(true)
            setTimeout(() => router.push('/admin'), 2500)
        } catch (err: any) {
            console.error('Setup error:', err)
            setError(`Bağlantı veya İstek Hatası: ${err.message || 'Bilinmiyor'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <h1 className="text-white text-xl font-bold">İlk Kurulum</h1>
                    <p className="text-green-200 text-sm mt-1">Süper admin hesabı oluştur</p>
                </div>

                {done ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-3">✅</div>
                        <p className="font-bold text-gray-800 text-lg">Hesap oluşturuldu!</p>
                        <p className="text-gray-500 text-sm mt-1">Giriş sayfasına yönlendiriliyorsunuz...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800 flex items-start gap-2">
                            <Lock size={14} className="mt-0.5 flex-shrink-0" />
                            Bu sayfa yalnızca bir kez çalışır. Tabloda kullanıcı oluşturulunca otomatik kapanır.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                            <input
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 6 karakter"
                                    className="w-full pr-10 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Oluşturuluyor...' : 'Süper Admin Oluştur'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
