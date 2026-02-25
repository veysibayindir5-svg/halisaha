'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { Facility } from '@/lib/types'
import { Plus, Pencil, Trash2, X, Check, Building2 } from 'lucide-react'

export default function AdminFacilitiesPage() {
    const router = useRouter()
    const [facilities, setFacilities] = useState<Facility[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', address: '', phone: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        setLoading(true)
        const res = await fetch('/api/facilities')
        const data = await res.json()
        setFacilities(data.facilities || [])
        setLoading(false)
    }

    function startEdit(f: Facility) {
        setEditingId(f.id)
        setForm({ name: f.name, address: f.address || '', phone: f.phone || '' })
        setShowForm(true)
        setError('')
    }

    function startNew() {
        setEditingId(null)
        setForm({ name: '', address: '', phone: '' })
        setShowForm(true)
        setError('')
    }

    async function handleSave() {
        if (!form.name.trim()) { setError('Tesis adı zorunludur.'); return }
        setSaving(true)
        setError('')
        try {
            const res = await fetch(
                editingId ? `/api/facilities/${editingId}` : '/api/facilities',
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
        if (!confirm('Bu tesisi silmek istediğinize emin misiniz?')) return
        await fetch(`/api/facilities/${id}`, { method: 'DELETE' })
        fetchData()
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tesis Yönetimi</h1>
                        <p className="text-gray-500 text-sm">{facilities.length} tesis kayıtlı</p>
                    </div>
                    <button onClick={startNew} className="btn-approve">
                        <Plus size={16} /> Tesis Ekle
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                        <h2 className="font-bold text-gray-800 mb-4">{editingId ? 'Tesis Düzenle' : 'Yeni Tesis'}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tesis Adı *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Tesis adı" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Adres</label>
                                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Adres" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Telefon</label>
                                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0212 000 00 00" />
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
                    ) : facilities.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                            <p>Henüz tesis yok. Yeni tesis ekleyin.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {['Tesis Adı', 'Adres', 'Telefon', 'İşlemler'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {facilities.map(f => (
                                    <tr key={f.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">{f.name}</td>
                                        <td className="py-3 px-4 text-gray-500">{f.address || '—'}</td>
                                        <td className="py-3 px-4 text-gray-500">{f.phone || '—'}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(f)} className="btn-edit">
                                                    <Pencil size={15} /> Düzenle
                                                </button>
                                                <button onClick={() => handleDelete(f.id)} className="btn-delete">
                                                    <Trash2 size={15} /> Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    )
}
