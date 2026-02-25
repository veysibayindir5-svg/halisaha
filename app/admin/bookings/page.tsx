'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
import { Booking, Field, Facility } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS, formatTurkishDate, formatHour } from '@/lib/utils'
import { Check, X, Archive, Trash2, RefreshCw, Filter, Star, StarOff } from 'lucide-react'

export default function AdminBookingsPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [fields, setFields] = useState<Field[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [filterFacility, setFilterFacility] = useState('')
    const [filterField, setFilterField] = useState('')
    const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0])
    const [filterStatus, setFilterStatus] = useState('')

    // Add subscriber modal — moved to /admin/subscribers

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
        const [bRes, fRes, fiRes] = await Promise.all([
            fetch('/api/bookings?include_all=true'),
            fetch('/api/facilities'),
            fetch('/api/fields'),
        ])
        const bData = await bRes.json()
        const fData = await fRes.json()
        const fiData = await fiRes.json()
        setBookings(bData.bookings || [])
        setFacilities(fData.facilities || [])
        setFields(fiData.fields || [])
        setLoading(false)
    }

    async function doAction(id: string, action: string) {
        const res = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        })
        if (res.ok) fetchData()
    }

    async function doDelete(id: string) {
        if (!confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return
        const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
        if (res.ok) fetchData()
    }


    const filteredFields = filterFacility
        ? fields.filter(f => f.facility_id === filterFacility)
        : fields

    const filtered = bookings.filter(b => {
        const field = fields.find(f => f.id === b.field_id)
        if (filterFacility && field?.facility_id !== filterFacility) return false
        if (filterField && b.field_id !== filterField) return false
        if (filterDate && b.booking_date !== filterDate) return false
        if (filterStatus === 'subscriber') return b.is_subscriber === true
        if (filterStatus && b.status !== filterStatus) return false
        return true
    })

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Rezervasyonlar</h1>
                        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} kayıt gösteriliyor</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/admin/subscribers"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-gray-900 border-2 border-yellow-500 bg-yellow-400 hover:bg-yellow-300 shadow-md transition"
                            style={{ boxShadow: '0 0 10px rgba(234,179,8,0.4)' }}
                        >
                            <Star size={15} fill="currentColor" /> Aboneler
                        </Link>
                        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm transition">
                            <RefreshCw size={15} /> Yenile
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Filter size={15} /> Filtrele:
                    </div>
                    <select value={filterFacility} onChange={e => { setFilterFacility(e.target.value); setFilterField('') }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Tüm Tesisler</option>
                        {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <select value={filterField} onChange={e => setFilterField(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Tüm Sahalar</option>
                        {filteredFields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Tüm Durumlar</option>
                        <option value="pending">Beklemede</option>
                        <option value="approved">Onaylandı</option>
                        <option value="cancelled">İptal</option>
                        <option value="subscriber">⭐ Abone</option>
                    </select>
                    {(filterFacility || filterField || filterDate || filterStatus) && (
                        <button onClick={() => { setFilterFacility(''); setFilterField(''); setFilterDate(''); setFilterStatus('') }} className="text-sm text-red-500 hover:underline">
                            Filtreyi Temizle
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-16 text-gray-400">
                            <RefreshCw size={24} className="animate-spin inline mb-2" />
                            <p>Yükleniyor...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-3">📋</p>
                            <p>Rezervasyon bulunamadı.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Müşteri', 'Telefon', 'Saha', 'Tarih', 'Saat', 'Durum', 'İşlemler'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(booking => {
                                    const field = fields.find(f => f.id === booking.field_id)
                                    const facility = facilities.find(f => f.id === field?.facility_id)
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                                            <td className="py-3 px-4 font-medium text-gray-800">{booking.customer_name}</td>
                                            <td className="py-3 px-4 text-gray-600">{booking.customer_phone}</td>
                                            <td className="py-3 px-4">
                                                <div className="text-gray-800 font-medium">{field?.name || '—'}</div>
                                                <div className="text-xs text-gray-400">{facility?.name}</div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{booking.booking_date}</td>
                                            <td className="py-3 px-4 text-gray-600">{booking.start_time} – {booking.end_time}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Subscriber badge */}
                                                    {booking.is_subscriber && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef9c3', color: '#854d0e', border: '2px solid #eab308', boxShadow: '0 0 6px rgba(234,179,8,0.4)' }}>
                                                            <Star size={11} fill="currentColor" /> Abone
                                                        </span>
                                                    )}
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${booking.is_subscriber
                                                        ? 'border-2 border-yellow-600'
                                                        : booking.status === 'pending' ? 'bg-orange-500 text-white badge-pending'
                                                            : booking.status === 'approved' ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-400 text-white'
                                                        }`}
                                                        style={booking.is_subscriber ? { background: '#eab308', color: '#1a1a1a' } : {}}
                                                    >
                                                        {booking.is_subscriber ? 'Abone' : STATUS_LABELS[booking.status]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Abone toggle */}
                                                    {!booking.is_subscriber ? (
                                                        <button
                                                            onClick={() => doAction(booking.id, 'set_subscriber')}
                                                            title="Abone Yap"
                                                            className="btn-subscriber"
                                                        >
                                                            <Star size={13} fill="currentColor" /> Abone Yap
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => doAction(booking.id, 'unset_subscriber')}
                                                            title="Aboneyi Kaldır"
                                                            className="btn-unsubscriber"
                                                        >
                                                            <StarOff size={13} /> Aboneyi Kaldır
                                                        </button>
                                                    )}
                                                    {booking.status === 'pending' && !booking.is_subscriber && (
                                                        <>
                                                            <button
                                                                onClick={() => doAction(booking.id, 'approve')}
                                                                title="Onayla"
                                                                className="btn-approve"
                                                            >
                                                                <Check size={15} /> Onayla
                                                            </button>
                                                            <button
                                                                onClick={() => doAction(booking.id, 'cancel')}
                                                                title="İptal Et"
                                                                className="btn-cancel"
                                                            >
                                                                <X size={15} /> İptal
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'approved' && !booking.is_subscriber && (
                                                        <button
                                                            onClick={() => doAction(booking.id, 'cancel')}
                                                            title="İptal Et"
                                                            className="btn-cancel"
                                                        >
                                                            <X size={15} /> İptal
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => doAction(booking.id, 'archive')}
                                                        title="Arşivle"
                                                        className="btn-archive"
                                                    >
                                                        <Archive size={15} /> Arşiv
                                                    </button>
                                                    <button
                                                        onClick={() => doDelete(booking.id)}
                                                        title="Sil"
                                                        className="btn-delete"
                                                    >
                                                        <Trash2 size={15} /> Sil
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    )
}
