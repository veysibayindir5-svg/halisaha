import { notFound } from 'next/navigation'
import { MapPin, Phone, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FacilityTimetableClient from '@/components/FacilityTimetableClient'
import { createServerClient } from '@/lib/supabase/server'
import { Facility, Field } from '@/lib/types'

async function getFacility(id: string): Promise<Facility | null> {
    const supabase = createServerClient()
    const { data } = await supabase.from('facilities').select('*').eq('id', id).single()
    return data
}

async function getFields(facilityId: string): Promise<Field[]> {
    const supabase = createServerClient()
    const { data } = await supabase
        .from('fields')
        .select('*')
        .eq('facility_id', facilityId)
        .order('name')
    return data || []
}

export default async function FacilityPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const facility = await getFacility(id)
    if (!facility) notFound()

    const fields = await getFields(id)

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                {/* Back */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-4 transition"
                >
                    <ChevronLeft size={16} /> Ana Sayfaya Dön
                </Link>

                {/* Facility header */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black mb-2">{facility.name}</h1>
                            {facility.address && (
                                <div className="flex items-center gap-2 text-green-200 text-sm mb-1">
                                    <MapPin size={14} />
                                    {facility.address}
                                </div>
                            )}
                            {facility.phone && (
                                <div className="flex items-center gap-2 text-green-200 text-sm">
                                    <Phone size={14} />
                                    {facility.phone}
                                </div>
                            )}
                        </div>
                        <div className="text-5xl">⚽</div>
                    </div>
                </div>

                {/* Field selection & timetable */}
                {fields.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">Bu tesise henüz saha eklenmemiş.</p>
                    </div>
                ) : (
                    <FacilityTimetableClient fields={fields} />
                )}
            </main>

            <Footer />
        </div>
    )
}
