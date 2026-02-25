export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="text-white font-semibold text-lg mb-1">⚽ Halısaha Rezervasyon</div>
                <p className="text-sm text-gray-400 mb-3">Online rezervasyon ile saha kiralama artık çok kolay</p>
                <p className="text-xs text-gray-500">
                    © {new Date().getFullYear()} Halısaha Rezervasyon Sistemi. Tüm hakları saklıdır.
                </p>
            </div>
        </footer>
    )
}
