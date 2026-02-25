'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/AdminNav'
import { Field, Facility } from '@/lib/types'
import { Plus, Pencil, Trash2, X, Check, Goal } from 'lucide-react'

export default function AdminFieldsPage() {
    const [fields, setFields] = useState<Field[]>([])
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', type: '', facility_id: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        setLoading(true)
        const [fRes, faRes] = await Promise.all([
            fetch('/api/fields'),
            fetch('/api/facilities'),
        ])
        const fData = await fRes.json()
        const faData = await faRes.json()
        setFields(fData.fields || [])
        setFacilities(faData.facilities || [])
        setLoading(false)
    }

    function startEdit(field: Field) {
        setEditingId(field.id)
        setForm({ name: field.name, type: field.type || '', facility_id: field.facility_id })
        setShowForm(true)
        setError('')
    }

    function startNew() {
        setEditingId(null)
        setForm({ name: '', type: 'Halısaha', facility_id: facilities[0]?.id || '' })
        setShowForm(true)
        setError('')
    }

    async function handleSave() {
        if (!form.name.trim() || !form.facility_id) { setError('Tesis ve saha adı zorunludur.'); return }
        setSaving(true); setError('')
        try {
            const res = await fetch(
                editingId ? `/api/fields/${editingId}` : '/api/fields',
                {
                    method: editingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                }
            )
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Hata oluştu.'); return }
            setShowForm(false)
            fetchData()
        } catch { setError('Bağlantı hatası.') }
        finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!confirm('Bu sahayı silmek istediğinize emin misiniz?')) return
        await fetch(`/api/fields/${id}`, { method: 'DELETE' })
        fetchData()
    }

    const FIELD_TYPES = ['Halısaha', 'Futbol 5', 'Futbol 7', 'Futbol 11', 'Padel', 'Tenis', 'Basketbol']

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Saha Yönetimi</h1>
                        <p className="text-gray-500 text-sm">{fields.length} saha kayıtlı</p>
                    </div>
                    <button onClick={startNew} className="btn-approve">
                        <Plus size={16} /> Saha Ekle
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                        <h2 className="font-bold text-gray-800 mb-4">{editingId ? 'Saha Düzenle' : 'Yeni Saha'}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tesis *</label>
                                <select value={form.facility_id} onChange={e => setForm(f => ({ ...f, facility_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="">Tesis Seçin</option>
                                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Saha Adı *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Örn: Saha 1" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tür</label>
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60">
                                <Check size={15} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                                <X size={15} /> İptal
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
                    ) : fields.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Goal size={40} className="mx-auto mb-3 opacity-30" />
                            <p>Henüz saha yok. Yeni saha ekleyin.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {['Saha Adı', 'Tür', 'Tesis', 'İşlemler'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fields.map(field => {
                                    const facility = facilities.find(f => f.id === field.facility_id)
                                    return (
                                        <tr key={field.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-800">{field.name}</td>
                                            <td className="py-3 px-4">
                                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">{field.type || 'Halısaha'}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">{facility?.name || '—'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => startEdit(field)} className="btn-edit">
                                                        <Pencil size={15} /> Düzenle
                                                    </button>
                                                    <button onClick={() => handleDelete(field.id)} className="btn-delete">
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
