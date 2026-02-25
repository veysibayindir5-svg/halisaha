'use client'

import { useState } from 'react'
import { Field } from '@/lib/types'
import Timetable from '@/components/Timetable'

export default function FacilityTimetableClient({ fields }: { fields: Field[] }) {
    const [selectedFieldId, setSelectedFieldId] = useState(fields[0]?.id || '')
    const selectedField = fields.find(f => f.id === selectedFieldId)

    return (
        <div>
            {/* Field tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                {fields.map(field => (
                    <button
                        key={field.id}
                        onClick={() => setSelectedFieldId(field.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${selectedFieldId === field.id
                            ? 'bg-green-600 text-white border-green-600 shadow'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'
                            }`}
                    >
                        {field.name}
                        {field.type && (
                            <span className="ml-1.5 text-xs opacity-75">({field.type})</span>
                        )}
                    </button>
                ))}
            </div>

            {selectedField && (
                <Timetable
                    fieldId={selectedField.id}
                    fieldName={selectedField.name}
                />
            )}
        </div>
    )
}
