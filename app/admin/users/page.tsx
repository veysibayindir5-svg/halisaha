'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { AdminPermissions, PERMISSION_LABELS, DEFAULT_PERMISSIONS } from '@/lib/auth'
import { RefreshCw, UserPlus, Trash2, Key, ShieldCheck, Shield, Eye, EyeOff, Check, X } from 'lucide-react'

interface AdminUserRow {
    id: string
    username: string
    role: 'super_admin' | 'admin'
    permissions: AdminPermissions
    created_at: string
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<AdminUserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/admin/users')
        if (res.status === 403) { router.push('/admin/bookings'); return }
        const data = await res.json()
        setUsers(data.users || [])
        setLoading(false)
    }, [router])

    useEffect(() => {
        async function checkAuth() {
            const res = await fetch('/api/admin/check')
            const data = await res.json()
            if (!data.authenticated || data.user?.role !== 'super_admin') {
                router.push('/admin/bookings')
                return
            }
            fetchData()
        }
        checkAuth()
    }, [fetchData, router])

    async function deleteUser(id: string, username: string) {
        if (!confirm(`"${username}" adlı kullanıcıyı silmek istediğinize emin misiniz?`)) return
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
        if (res.ok) fetchData()
        else {
            const data = await res.json()
            alert(data.error || 'Bir hata oluştu.')
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminNav />
            <main className="flex-1 ml-60 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ShieldCheck size={24} className="text-green-600" /> Kullanıcı Yönetimi
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">{users.length} admin kullanıcı</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition shadow-md"
                        >
                            <UserPlus size={15} /> Yeni Kullanıcı Ekle
                        </button>
                        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm transition">
                            <RefreshCw size={15} /> Yenile
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">
                        <RefreshCw size={24} className="animate-spin inline mb-2" /><p>Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map(user => (
                            <div key={user.id} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${user.role === 'super_admin' ? 'border-green-400' : 'border-gray-200'}`}>
                                {/* User header */}
                                <div className={`px-5 py-3 flex items-center justify-between ${user.role === 'super_admin' ? 'bg-green-50 border-b-2 border-green-300' : 'bg-gray-50 border-b border-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${user.role === 'super_admin' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                {user.username}
                                                {user.role === 'super_admin' && (
                                                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                                        <ShieldCheck size={10} /> Süper Admin
                                                    </span>
                                                )}
                                                {user.role === 'admin' && (
                                                    <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                                        <Shield size={10} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">Oluşturuldu: {new Date(user.created_at).toLocaleDateString('tr-TR')}</div>
                                        </div>
                                    </div>
                                    {user.role !== 'super_admin' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                                            >
                                                <Key size={12} /> Yetkiler
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id, user.username)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                                            >
                                                <Trash2 size={12} /> Sil
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Permissions grid */}
                                <div className="px-5 py-3">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">İzinler</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {(Object.keys(PERMISSION_LABELS) as (keyof AdminPermissions)[]).map(key => {
                                            const permitted = user.role === 'super_admin' ? true : (user.permissions?.[key] ?? false)
                                            return (
                                                <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${permitted ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                                                    {permitted ? <Check size={11} /> : <X size={11} />}
                                                    {PERMISSION_LABELS[key]}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchData() }}
                />
            )}

            {editingUser && (
                <EditPermissionsModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => { setEditingUser(null); fetchData() }}
                />
            )}
        </div>
    )
}

// ─── Add User Modal ──────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [permissions, setPermissions] = useState<AdminPermissions>({ ...DEFAULT_PERMISSIONS })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const toggle = (key: keyof AdminPermissions) =>
        setPermissions(p => ({ ...p, [key]: !p[key] }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password, permissions }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Hata oluştu.'); return }
            onSuccess()
        } catch { setError('Bir hata oluştu.') }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 bg-gradient-to-r from-green-700 to-emerald-600 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="font-bold text-lg text-white flex items-center gap-2"><UserPlus size={18} /> Yeni Kullanıcı Ekle</h2>
                        <p className="text-green-200 text-sm">Admin kullanıcı oluştur ve yetkilerini belirle</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:opacity-70 text-xl font-bold">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                            <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="kullanici_adi"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                            <div className="relative">
                                <input required type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 karakter"
                                    className="w-full pr-9 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Key size={14} /> İzinler</p>
                        <div className="grid grid-cols-1 gap-2">
                            {(Object.keys(PERMISSION_LABELS) as (keyof AdminPermissions)[]).map(key => (
                                <label key={key} className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition select-none ${permissions[key] ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                                    <div
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${permissions[key] ? 'bg-green-600' : 'bg-gray-300'}`}
                                        onClick={() => toggle(key)}
                                    >
                                        {permissions[key] && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{PERMISSION_LABELS[key]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm">{error}</div>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">İptal</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition">
                            <UserPlus size={15} />
                            {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Edit Permissions Modal ───────────────────────────────────────────────────
function EditPermissionsModal({ user, onClose, onSuccess }: { user: AdminUserRow; onClose: () => void; onSuccess: () => void }) {
    const [permissions, setPermissions] = useState<AdminPermissions>({ ...DEFAULT_PERMISSIONS, ...user.permissions })
    const [newPassword, setNewPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const toggle = (key: keyof AdminPermissions) =>
        setPermissions(p => ({ ...p, [key]: !p[key] }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const body: Record<string, unknown> = { permissions }
            if (newPassword) body.password = newPassword
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Hata oluştu.'); return }
            onSuccess()
        } catch { setError('Bir hata oluştu.') }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="font-bold text-lg text-white flex items-center gap-2"><Key size={18} /> Yetki Düzenle</h2>
                        <p className="text-blue-200 text-sm">@{user.username}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:opacity-70 text-xl font-bold">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Key size={14} /> İzinler</p>
                        <div className="grid grid-cols-1 gap-2">
                            {(Object.keys(PERMISSION_LABELS) as (keyof AdminPermissions)[]).map(key => (
                                <label key={key} className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition select-none ${permissions[key] ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                                    <div
                                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${permissions[key] ? 'bg-green-600' : 'bg-gray-300'}`}
                                        onClick={() => toggle(key)}
                                    >
                                        {permissions[key] && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{PERMISSION_LABELS[key]}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre <span className="text-gray-400">(opsiyonel)</span></label>
                        <div className="relative">
                            <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Boş bırakırsanız değişmez"
                                className="w-full pr-9 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2.5 text-sm">{error}</div>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">İptal</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition">
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
