'use client'

import { useRouter } from 'next/navigation'

export default function OwnerSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 max-w-md w-full p-10 text-center">

        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-3xl font-extrabold text-[#0b1c35] mb-3">
          Başvurunuz Alındı!
        </h1>

        <p className="text-[#33476a] text-[15px] leading-relaxed mb-4">
          Teşekkürler! Başvurunuz ve paket seçiminiz ekibimize iletildi.
        </p>

        <p className="text-[#5a6c8a] text-[13.5px] leading-relaxed mb-8">
          Ödeme bilgileriniz en kısa sürede WhatsApp veya e-posta yoluyla
          tarafınıza iletilecektir. Ödeme onayının ardından otoparkınız
          12-24 saat içinde yayına alınacaktır.
        </p>

        <div className="bg-[#eef6fe] rounded-2xl p-5 text-left space-y-3 mb-8">
          <div className="flex items-center gap-3 text-[13.5px] text-[#0b1c35] font-medium">
            <span>📋</span>
            <span>Başvuru Durumu: <span className="text-[#1d7adb] font-bold">İnceleniyor</span></span>
          </div>
          <div className="flex items-center gap-3 text-[13.5px] text-[#0b1c35] font-medium">
            <span>💳</span>
            <span>Ödeme: <span className="text-[#d97706] font-bold">Bekleniyor</span></span>
          </div>
          <div className="flex items-center gap-3 text-[13.5px] text-[#0b1c35] font-medium">
            <span>🅿️</span>
            <span>Listeleme: <span className="text-[#5a6c8a] font-bold">Onay sonrası aktif olacak</span></span>
          </div>
        </div>

        <button
          onClick={() => router.push('/owner/dashboard')}
          className="w-full h-12 rounded-xl font-extrabold text-[15px] text-white transition-colors"
          style={{ background: '#1d7adb' }}
          onMouseOver={e => (e.currentTarget.style.background = '#1769c2')}
          onMouseOut={e => (e.currentTarget.style.background = '#1d7adb')}
        >
          Dashboard'a Dön
        </button>

      </div>
    </div>
  )
}
