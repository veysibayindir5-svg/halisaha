'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { Field, Facility } from '@/lib/types'
import { RefreshCw, Star, StarOff, XCircle, PlusCircle, User, Phone, Calendar, Clock } from 'lucide-react'

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const HOURS = Array.from({ length: 15 }, (_, i) => 10 + i) // 10..24

interface Subscription {
    group_id: string
    customer_name: string
    customer_phone: string
    field_id: string
    field_name: string
    facility_name: string
    start_time: string
    end_time: string
    weekday: number
    first_date: string
    total_bookings: number
    future_bookings: number
    status: 'active' | 'cancelled'
}

export default function AdminSubscribersPage() {
    const router = useRouter()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [fields, setFields] = useState<Field[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled'>('active')

    useEffect(() => {
        checkAuth()
        fetchData()
    }, [])

    async function checkAuth() {
        const res = await fetch('/api/admin/check')
        if (!res.ok) router.push('/admin')
    }

    async function fetchData() {
        setLoading(true)
        const [sRes, fRes, fiRes] = await Promise.all([
            fetch('/api/subscribers'),
            fetch('/api/facilities'),
            fetch('/api/fields'),
        ])
        const sData = await sRes.json()
        const fData = await fRes.json()
        const fiData = await fiRes.json()
        setSubscriptions(sData.subscriptions || [])
        setFacilities(fData.facilities || [])
        setFields(fiData.fields || [])
        setLoading(false)
    }

    async function cancelSubscription(group_id: string, name: string) {
        if (!confirm(`"${name}" adlı abonenin gelecekteki tüm rezervasyonları iptal edilecek. Emin misiniz?`)) return
        const res = await fetch(`/api/subscribers/${group_id}`, { method: 'DELETE' })
        if (res.ok) fetchData()
    }

    const filtered = subscriptions.filter(s =>
        filterStatus === 'all' ? true : s.status === filterStatus
    )

    const activeCount = subscriptions.filter(s => s.status === 'active').length

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span style={{ color: '#eab308' }}>⭐</span> Aboneler
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {activeCount} aktif abonelik · {filtered.length} gösteriliyor
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-gray-900 border-2 border-yellow-500 bg-yellow-400 hover:bg-yellow-300 shadow-md transition"
                            style={{ boxShadow: '0 0 12px rgba(234,179,8,0.5)' }}
                        >
                            <PlusCircle size={15} /> Yeni Abone Ekle
                        </button>
                        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm transition">
                            <RefreshCw size={15} /> Yenile
                        </button>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-5">
                    {(['active', 'cancelled', 'all'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border-2 ${filterStatus === status
                                ? 'border-yellow-500 bg-yellow-400 text-gray-900'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'active' ? '✅ Aktif' : status === 'cancelled' ? '❌ İptal' : '📋 Tümü'}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">
                        <RefreshCw size={24} className="animate-spin inline mb-2" />
                        <p>Yükleniyor...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">⭐</p>
                        <p>Abone bulunamadı.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(sub => (
                            <div
                                key={sub.group_id}
                                className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition ${sub.status === 'active'
                                    ? 'border-yellow-400'
                                    : 'border-gray-200 opacity-60'
                                    }`}
                            >
                                {/* Card header */}
                                <div
                                    className="px-4 py-3 flex items-center justify-between"
                                    style={sub.status === 'active' ? { background: '#fef9c3', borderBottom: '2px solid #eab308' } : { background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Star size={16} fill="#eab308" color="#ca8a04" />
                                        <span className="font-bold text-gray-900 text-sm">{sub.customer_name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sub.status === 'active'
                                        ? 'bg-yellow-400 text-yellow-900 border border-yellow-600'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {sub.status === 'active' ? 'Aktif' : 'İptal'}
                                    </span>
                                </div>

                                {/* Card body */}
                                <div className="px-4 py-3 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={13} className="text-gray-400" />
                                        {sub.customer_phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar size={13} className="text-gray-400" />
                                        <span className="font-semibold text-gray-800">{DAYS_TR[sub.weekday]}</span>
                                        <span className="text-gray-400">· Her hafta</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock size={13} className="text-gray-400" />
                                        {sub.start_time} – {sub.end_time}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        📍 <span className="font-medium">{sub.field_name}</span>
                                        {sub.facility_name && <span className="text-gray-400"> · {sub.facility_name}</span>}
                                    </div>
                                    <div className="flex gap-3 text-xs text-gray-400 pt-1">
                                        <span>📅 İlk: {sub.first_date}</span>
                                        <span>🔁 {sub.total_bookings} rezervasyon</span>
                                        <span>⏳ {sub.future_bookings} kalan</span>
                                    </div>
                                </div>

                                {/* Card footer */}
                                {sub.status === 'active' && (
                                    <div className="px-4 pb-3">
                                        <button
                                            onClick={() => cancelSubscription(sub.group_id, sub.customer_name)}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-red-600 border-2 border-red-200 bg-red-50 hover:bg-red-100 transition"
                                        >
                                            <XCircle size={14} /> Aboneliği İptal Et
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add Subscriber Modal */}
            {showModal && (
                <AddSubscriberModal
                    fields={fields}
                    facilities={facilities}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchData() }}
                />
            )}
        </div>
    )
}

// ============ ADD SUBSCRIBER MODAL ============
function AddSubscriberModal({
    fields,
    facilities,
    onClose,
    onSuccess,
}: {
    fields: Field[]
    facilities: Facility[]
    onClose: () => void
    onSuccess: () => void
}) {
    const [form, setForm] = useState({
        field_id: '',
        start_date: '',
        start_hour: '10',
        customer_name: '',
        customer_phone: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Show which weekday the selected date falls on
    const selectedWeekday = form.start_date
        ? DAYS_TR[new Date(form.start_date).getDay()]
        : null

    const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        const hour = parseInt(form.start_hour)
        try {
            const res = await fetch('/api/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field_id: form.field_id,
                    start_date: form.start_date,
                    start_time: `${String(hour).padStart(2, '0')}:00`,
                    end_time: `${String(hour + 1).padStart(2, '0')}:00`,
                    customer_name: form.customer_name.trim(),
                    customer_phone: form.customer_phone.trim(),
                    weeks: 52,
                }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Hata oluştu.'); setLoading(false); return }
            onSuccess()
        } catch {
            setError('Bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#eab308', borderBottom: '2px solid #ca8a04' }}>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <Star size={18} fill="currentColor" className="text-yellow-900" />
                            Yeni Abone Ekle
                        </h2>
                        <p className="text-yellow-900 text-sm opacity-80">52 hafta otomatik rezervasyon oluşturulur</p>
                    </div>
                    <button onClick={onClose} className="text-yellow-900 hover:opacity-70 transition text-xl font-bold">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Field selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saha</label>
                        <select
                            required
                            value={form.field_id}
                            onChange={e => set('field_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            <option value="">Saha seçin...</option>
                            {facilities.map(fac => (
                                <optgroup key={fac.id} label={fac.name}>
                                    {fields.filter(f => f.facility_id === fac.id).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Start date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                        <input
                            type="date"
                            required
                            value={form.start_date}
                            onChange={e => set('start_date', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        {selectedWeekday && (
                            <p className="mt-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 flex items-center gap-1">
                                <Star size={11} fill="#eab308" color="#ca8a04" />
                                Her <span className="underline">{selectedWeekday}</span> otomatik rezerve edilecek (52 hafta)
                            </p>
                        )}
                    </div>

                    {/* Hour */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                        <select
                            required
                            value={form.start_hour}
                            onChange={e => set('start_hour', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            {HOURS.map(h => (
                                <option key={h} value={String(h)}>{String(h).padStart(2, '0')}:00 – {String(h + 1).padStart(2, '0')}:00</option>
                            ))}
                        </select>
                    </div>

                    {/* Customer name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Ad Soyad</label>
                        <div className="relative">
                            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={form.customer_name}
                                onChange={e => set('customer_name', e.target.value)}
                                placeholder="Ad Soyad"
                                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    </div>

                    {/* Customer phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <div className="relative">
                            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                required
                                value={form.customer_phone}
                                onChange={e => set('customer_phone', e.target.value)}
                                placeholder="05xx xxx xx xx"
                                className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
                            style={{ background: '#eab308', color: '#1a1a1a', border: '2px solid #ca8a04' }}
                        >
                            <Star size={15} fill="currentColor" />
                            {loading ? 'Oluşturuluyor...' : 'Abone Ekle (52 Hafta)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
