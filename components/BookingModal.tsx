'use client'

import { useState } from 'react'
import { X, User, Phone, Calendar, Clock, Loader2 } from 'lucide-react'
import { formatHour } from '@/lib/utils'

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    fieldId: string
    fieldName: string
    date: string
    hour: number
    displayDate: string
    onSuccess: () => void
}

export default function BookingModal({
    isOpen,
    onClose,
    fieldId,
    fieldName,
    date,
    hour,
    displayDate,
    onSuccess,
}: BookingModalProps) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field_id: fieldId,
                    booking_date: date,
                    start_time: formatHour(hour),
                    end_time: formatHour(hour + 1),
                    customer_name: name.trim(),
                    customer_phone: phone.trim(),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Rezervasyon oluşturulamadı.')
                return
            }

            onSuccess()
            setName('')
            setPhone('')
            onClose()
        } catch {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
                {/* Header */}
                <div className="bg-green-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">Rezervasyon Yap</h2>
                        <p className="text-green-200 text-sm">{fieldName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-green-200 transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Info pills */}
                <div className="px-6 py-4 bg-green-50 border-b flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200 text-sm">
                        <Calendar size={15} className="text-green-600" />
                        <span className="font-medium text-gray-700">{displayDate}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200 text-sm">
                        <Clock size={15} className="text-green-600" />
                        <span className="font-medium text-gray-700">
                            {formatHour(hour)} – {formatHour(hour + 1)}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ad Soyad
                        </label>
                        <div className="relative">
                            <User
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Adınız ve soyadınız"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Telefon
                        </label>
                        <div className="relative">
                            <Phone
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="05xx xxx xx xx"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader2 size={15} className="animate-spin" />}
                            {loading ? 'Gönderiliyor...' : 'Rezervasyon Yap'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
