export interface Facility {
    id: string
    name: string
    address: string
    phone: string
    created_at: string
}

export interface Field {
    id: string
    facility_id: string
    name: string
    type: string
    created_at: string
    facility?: Facility
}

export interface Booking {
    id: string
    field_id: string
    booking_date: string // YYYY-MM-DD
    start_time: string   // HH:mm
    end_time: string     // HH:mm
    customer_name: string
    customer_phone: string
    status: 'pending' | 'approved' | 'cancelled'
    is_archived: boolean
    is_subscriber: boolean
    subscriber_group_id: string | null
    created_at: string
    field?: Field
}

export type BookingStatus = 'pending' | 'approved' | 'cancelled'

export interface TimeSlot {
    hour: number
    date: string
    status: 'available' | 'pending' | 'approved' | 'past' | 'subscriber'
    booking?: Booking
}
