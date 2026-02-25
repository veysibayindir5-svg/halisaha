import { format, addDays, startOfWeek, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

export const HOURS = Array.from({ length: 15 }, (_, i) => i + 10) // 10..24

export const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

export function getWeekDates(weekOffset: number = 0): Date[] {
    const now = new Date()
    const monday = startOfWeek(now, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i + weekOffset * 7))
}

export function formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd')
}

export function formatDisplayDate(date: Date): string {
    return format(date, 'd MMM', { locale: tr })
}

export function formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`
}

export function isPastSlot(date: Date, hour: number): boolean {
    const now = new Date()
    const slotDate = new Date(date)
    slotDate.setHours(hour, 0, 0, 0)
    return slotDate < now
}

export function formatTurkishDate(dateStr: string): string {
    try {
        const date = parseISO(dateStr)
        return format(date, 'dd MMMM yyyy EEEE', { locale: tr })
    } catch {
        return dateStr
    }
}

export const STATUS_LABELS: Record<string, string> = {
    pending: 'Beklemede',
    approved: 'Onaylandı',
    cancelled: 'İptal Edildi',
}

export const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-orange-500',
    approved: 'bg-blue-600',
    cancelled: 'bg-gray-400',
}
