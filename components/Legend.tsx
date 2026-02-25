export default function Legend() {
    const items = [
        { color: 'bg-green-500', label: 'Müsait' },
        { color: 'bg-orange-500', label: 'Beklemede' },
        { color: 'bg-blue-600', label: 'Onaylandı' },
        { color: 'bg-yellow-400 border-2 border-yellow-600', label: 'Abone' },
        { color: 'bg-gray-300', label: 'Geçmiş Saat' },
    ]

    return (
        <div className="flex flex-wrap gap-4 items-center">
            {items.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded ${item.color} inline-block`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                </div>
            ))}
        </div>
    )
}
