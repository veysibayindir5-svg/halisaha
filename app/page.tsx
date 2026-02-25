import Link from 'next/link'
import { MapPin, Phone, ChevronRight, Clock } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createServerClient } from '@/lib/supabase/server'
import { Facility } from '@/lib/types'

async function getFacilities(): Promise<Facility[]> {
  const supabase = createServerClient()
  const { data } = await supabase.from('facilities').select('*').order('name')
  return data || []
}

export default async function HomePage() {
  const facilities = await getFacilities()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Halısaha Rezervasyon
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Dilediğiniz sahayı kolayca rezerve edin. Haftalık müsaitlik takvimine göz atın ve hemen yerinizi ayırtın.
          </p>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-all shadow-lg text-lg"
          >
            <Clock size={20} />
            Müsaitlik Takvimi
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🗓️', title: 'Online Rezervasyon', desc: 'Dilediğiniz günü seçin, anında rezervasyonunuz oluşsun', color: 'bg-green-100', delay: '0s' },
            { icon: '✅', title: 'Hızlı Onay', desc: 'Rezervasyonunuz en kısa sürede onaylanır', color: 'bg-blue-100', delay: '1s' },
            { icon: '📱', title: 'Kolay Kullanım', desc: 'Kolayca saha seçin ve müsait saatleri görün', color: 'bg-orange-100', delay: '2s' },
          ].map(f => (
            <div key={f.title} className="p-4 flex flex-col items-center">
              <div
                className={`${f.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-md`}
                style={{ animation: `float-icon 3s ease-in-out ${f.delay} infinite` }}
              >
                <span className="text-4xl">{f.icon}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>


      {/* Facilities */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tesislerimiz</h2>
          <Link href="/schedule" className="text-sm text-green-600 hover:underline font-medium">
            Tüm saatleri gör →
          </Link>
        </div>

        {facilities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🏟️</div>
            <p className="text-lg">Henüz tesis eklenmemiş.</p>
            <Link href="/admin/facilities" className="mt-3 inline-block text-green-600 hover:underline text-sm">
              Admin panelinden tesis ekleyin →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map(facility => (
              <Link
                key={facility.id}
                href={`/facility/${facility.id}`}
                className="bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all group overflow-hidden"
              >
                {/* Card top */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-500 h-32 flex items-center justify-center">
                  <span className="text-5xl group-hover:scale-110 transition-transform">⚽</span>
                </div>
                {/* Card body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {facility.name}
                  </h3>
                  {facility.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-500 mb-1.5">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-green-500" />
                      <span>{facility.address}</span>
                    </div>
                  )}
                  {facility.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Phone size={14} className="text-green-500" />
                      <span>{facility.phone}</span>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full group-hover:bg-green-100 transition">
                    Rezervasyon Yap <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
