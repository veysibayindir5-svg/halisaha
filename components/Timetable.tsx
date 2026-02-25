'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import {
    getWeekDates,
    formatDate,
    formatDisplayDate,
    formatHour,
    isPastSlot,
    HOURS,
    DAYS_TR,
} from '@/lib/utils'
import { Booking } from '@/lib/types'
import BookingModal from './BookingModal'
import Legend from './Legend'

interface TimetableProps {
    fieldId: string
    fieldName: string
}

export default function Timetable({ fieldId, fieldName }: TimetableProps) {
    const [weekOffset, setWeekOffset] = useState(0)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [modalState, setModalState] = useState<{
        open: boolean
        date: string
        hour: number
        displayDate: string
    }>({ open: false, date: '', hour: 0, displayDate: '' })
    const [successMsg, setSuccessMsg] = useState('')

    const weekDates = getWeekDates(weekOffset)

    const fetchBookings = useCallback(async () => {
        if (!fieldId) return
        setLoading(true)
        try {
            const start = formatDate(weekDates[0])
            const end = formatDate(weekDates[6])
            const res = await fetch(
                `/api/bookings?field_id=${fieldId}&start=${start}&end=${end}`
            )
            const data = await res.json()
            setBookings(data.bookings || [])
        } catch {
            setBookings([])
        } finally {
            setLoading(false)
        }
    }, [fieldId, weekOffset]) // eslint-disable-line

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    function getSlotStatus(date: Date, hour: number) {
        if (isPastSlot(date, hour)) return 'past'
        const dateStr = formatDate(date)
        const startTime = formatHour(hour)
        const booking = bookings.find(
            b => b.booking_date === dateStr &&
                (b.start_time === startTime || b.start_time.startsWith(startTime + ':'))
        )
        if (!booking) return 'available'
        if (booking.is_subscriber) return 'subscriber'
        return booking.status // 'pending' | 'approved'
    }

    function handleCellClick(date: Date, hour: number) {
        const status = getSlotStatus(date, hour)
        if (status !== 'available') return
        const dateStr = formatDate(date)
        const displayDate = `${DAYS_TR[date.getDay() === 0 ? 6 : date.getDay() - 1]}, ${formatDisplayDate(date)}`
        setModalState({ open: true, date: dateStr, hour, displayDate })
    }

    function getCellClass(status: string) {
        switch (status) {
            case 'available': return 'slot-available'
            case 'pending': return 'slot-pending'
            case 'approved': return 'slot-approved'
            case 'subscriber': return 'slot-subscriber'
            case 'past': return 'slot-past'
            default: return 'slot-past'
        }
    }

    function getCellLabel(status: string) {
        switch (status) {
            case 'available': return 'Boş'
            case 'pending': return 'Bekliyor'
            case 'approved': return 'Dolu'
            case 'subscriber': return 'Abone'
            case 'past': return '—'
            default: return '—'
        }
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setWeekOffset(o => o - 1)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        title="Önceki hafta"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 min-w-[180px] text-center">
                        {formatDisplayDate(weekDates[0])} – {formatDisplayDate(weekDates[6])}
                    </span>
                    <button
                        onClick={() => setWeekOffset(o => o + 1)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        title="Sonraki hafta"
                    >
                        <ChevronRight size={18} />
                    </button>
                    {weekOffset !== 0 && (
                        <button
                            onClick={() => setWeekOffset(0)}
                            className="text-xs text-green-600 hover:underline flex items-center gap-1"
                        >
                            <RefreshCw size={12} /> Bu hafta
                        </button>
                    )}
                </div>
                <Legend />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-700 text-white">
                            <th className="py-3 px-3 text-left text-xs font-semibold w-16 sticky left-0 bg-gray-700 z-10">
                                Saat
                            </th>
                            {weekDates.map((date, i) => (
                                <th key={i} className="py-3 px-2 text-center text-xs font-semibold">
                                    <div>{DAYS_TR[i]}</div>
                                    <div className="font-normal text-gray-300 text-[11px] mt-0.5">
                                        {formatDisplayDate(date)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-gray-400">
                                    <RefreshCw size={20} className="animate-spin inline mr-2" />
                                    Yükleniyor...
                                </td>
                            </tr>
                        ) : (
                            HOURS.map(hour => (
                                <tr key={hour} className="border-t border-gray-100 hover:bg-gray-50/50">
                                    <td className="py-2 px-3 text-xs font-bold text-gray-500 bg-gray-50 sticky left-0 border-r border-gray-200">
                                        {formatHour(hour)}
                                    </td>
                                    {weekDates.map((date, i) => {
                                        const status = getSlotStatus(date, hour)
                                        return (
                                            <td key={i} className="p-1 text-center">
                                                <button
                                                    onClick={() => handleCellClick(date, hour)}
                                                    disabled={status !== 'available'}
                                                    className={`w-full py-2 px-1 rounded-lg text-xs font-medium transition-all ${getCellClass(status)}`}
                                                >
                                                    {getCellLabel(status)}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Success message */}
            {successMsg && (
                <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium">
                    ✅ {successMsg}
                </div>
            )}

            <BookingModal
                isOpen={modalState.open}
                onClose={() => setModalState(s => ({ ...s, open: false }))}
                fieldId={fieldId}
                fieldName={fieldName}
                date={modalState.date}
                hour={modalState.hour}
                displayDate={modalState.displayDate}
                onSuccess={() => {
                    setSuccessMsg('Rezervasyonunuz alındı! Onay için bekleyiniz.')
                    fetchBookings()
                    setTimeout(() => setSuccessMsg(''), 5000)
                }}
            />
        </div>
    )
}
