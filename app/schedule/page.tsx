'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Timetable from '@/components/Timetable'
import { Facility, Field } from '@/lib/types'

export default function SchedulePage() {
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [fields, setFields] = useState<Field[]>([])
    const [selectedFacilityId, setSelectedFacilityId] = useState('')
    const [selectedFieldId, setSelectedFieldId] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/facilities')
            .then(r => r.json())
            .then(d => {
                const facs = d.facilities || []
                setFacilities(facs)
                if (facs.length > 0) setSelectedFacilityId(facs[0].id)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!selectedFacilityId) return
        setSelectedFieldId('')
        setFields([])
        fetch(`/api/fields?facility_id=${selectedFacilityId}`)
            .then(r => r.json())
            .then(d => {
                const fs = d.fields || []
                setFields(fs)
                if (fs.length > 0) setSelectedFieldId(fs[0].id)
            })
    }, [selectedFacilityId])

    const selectedField = fields.find(f => f.id === selectedFieldId)

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Haftalık Rezervasyon Takvimi</h1>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
                ) : facilities.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p>Henüz tesis eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Selectors */}
                        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col gap-1 min-w-[200px]">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tesis</label>
                                <select
                                    value={selectedFacilityId}
                                    onChange={e => setSelectedFacilityId(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {facilities.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            {fields.length > 0 && (
                                <div className="flex flex-col gap-1 min-w-[200px]">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saha</label>
                                    <select
                                        value={selectedFieldId}
                                        onChange={e => setSelectedFieldId(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {fields.map(f => (
                                            <option key={f.id} value={f.id}>{f.name} {f.type ? `(${f.type})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {selectedField ? (
                            <Timetable fieldId={selectedField.id} fieldName={selectedField.name} />
                        ) : (
                            <div className="text-center py-12 text-gray-400">Bu tesise saha eklenmemiş.</div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
