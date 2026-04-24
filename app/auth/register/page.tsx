'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [acceptPlatePolicy, setAcceptPlatePolicy] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Plaka girildi ama onay verilmedi
    if (licensePlate && !acceptPlatePolicy) {
      setError('Plaka kullanımı için gizlilik politikasını kabul etmelisiniz.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    })

    if (signUpError) {
      setError('Kayıt başarısız. ' + signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Profile güncelle - plaka varsa ekle
      const profileData: any = {
        full_name: fullName,
        phone: phone
      }

      // Plaka varsa ve onay verildiyse ekle
      if (licensePlate && acceptPlatePolicy) {
        profileData.license_plate = licensePlate
        profileData.plate_consent_given = true
        profileData.plate_consent_date = new Date().toISOString()
      }

      await supabase.from('profiles').update(profileData).eq('id', data.user.id)
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* SOL TARAF - Hero Section */}
      <div className="hidden lg:flex lg:w-[53%] relative overflow-hidden">
        {/* Arka plan fotoğrafı */}
        <div className="absolute inset-0">
          <Image
            src="/images/parking-lot.jpg"
            alt="Otopark"
            fill
            className="object-cover animate-slow-zoom"
            priority
          />
        </div>
        
        {/* Karanlık overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,12,24,0.45)] via-[rgba(8,12,24,0.25)] to-[rgba(8,12,24,0.88)]" />
        
        {/* Sağ kenar geçişi */}
        <div className="absolute top-0 bottom-0 right-0 w-[55%] bg-gradient-to-r from-transparent via-[rgba(11,18,32,0.4)] to-[#0b1220]" />

        {/* İçerik */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f7ff5] to-[#5ea3ff] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-extrabold text-xl">P</span>
            </div>
            <span className="text-white font-bold text-[22px] tracking-tight">
              Otopark<span className="text-[#5ea3ff]">çım</span>
            </span>
          </div>
          
          {/* Alt kısım - Animasyonlu metin */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.18] backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[11px] font-bold tracking-[2px] text-white/80">TANIDIK BİR HİKAYE</span>
            </div>

            {/* Dönen metinler */}
            <div className="relative h-[68px] mb-3">
              <div className="pain-word pain-1">
                <span className="text-[44px] font-bold tracking-tight text-white leading-none">Park yeri derdi...</span>
              </div>
              <div className="pain-word pain-2">
                <span className="text-[44px] font-bold tracking-tight text-white leading-none">Dolu otoparklar...</span>
              </div>
              <div className="pain-word pain-3">
                <span className="text-[44px] font-bold tracking-tight text-white leading-none">Tutarsız fiyatlar...</span>
              </div>
              <div className="pain-word pain-4">
                <span className="text-[44px] font-bold tracking-tight text-white leading-none">Saatlerce arama...</span>
              </div>
            </div>

            {/* Hemen Başla */}
            <div className="finale mb-5">
              <div className="flex items-center gap-4">
                <span className="text-[56px] font-extrabold tracking-tighter leading-none bg-gradient-to-r from-white to-[#cfe4ff] bg-clip-text text-transparent">
                  Artık yok.
                </span>
                <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-95">
                  <circle cx="20" cy="20" r="18" fill="#10b981"/>
                  <path d="M 12 20 L 18 26 L 28 14" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Açıklama */}
            <p className="text-[15px] leading-relaxed text-white/85 max-w-[420px] mb-6">
              Otoparkçım ile İstanbul'daki 300+ anlaşmalı otoparkı anlık gör, fiyatları karşılaştır, aracını güvenle parket.
            </p>

            {/* İstatistikler */}
            <div className="flex gap-7 pt-5 border-t border-white/15">
              {[['300+', 'Otopark'], ['39', 'İlçe'], ['7/24', 'Canlı']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-xl font-bold text-white tracking-tight">{num}</div>
                  <div className="text-[10.5px] text-white/60 tracking-wider uppercase mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ TARAF - Form */}
      <div className="w-full lg:w-[47%] bg-[#0b1220] flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[360px]">
          {/* Mobil logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f7ff5] to-[#5ea3ff] flex items-center justify-center">
              <span className="text-white font-extrabold text-xl">P</span>
            </div>
            <span className="text-white font-bold text-xl">
              Otopark<span className="text-[#5ea3ff]">çım</span>
            </span>
          </div>

          {/* Başlık */}
          <h1 className="text-[26px] font-bold text-white tracking-tight mb-1">Hesap Oluştur</h1>
          <p className="text-sm text-white/60 mb-7">Ücretsiz kayıt olun</p>

          {/* Hata mesajı */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/85 mb-1.5 tracking-wide">AD SOYAD</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#2f7ff5] transition-colors"
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/85 mb-1.5 tracking-wide">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#2f7ff5] transition-colors"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/85 mb-1.5 tracking-wide">TELEFON</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#2f7ff5] transition-colors"
                  placeholder="0532 123 4567"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/85 mb-1.5 tracking-wide">ŞİFRE</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#2f7ff5] transition-colors"
                  placeholder="En az 6 karakter"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Plaka - Opsiyonel */}
            <div>
              <label className="block text-xs font-semibold text-white/85 mb-1.5 tracking-wide">
                ARAÇ PLAKASI (Opsiyonel)
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2"/>
                  <path d="M7 10h10M7 14h6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase().trim())}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.12] rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#2f7ff5] transition-colors"
                  placeholder="34 ABC 123"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-white/50 mt-1.5 flex items-center gap-1">
                <span>💡</span>
                <span>Plaka eklerseniz park onaylarında puan kazanırsınız</span>
              </p>
            </div>

            {/* KVKK Onayı - Sadece plaka girilirse göster */}
            {licensePlate && (
              <div className="flex items-start gap-2.5 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <input
                  type="checkbox"
                  id="plate-consent"
                  checked={acceptPlatePolicy}
                  onChange={(e) => setAcceptPlatePolicy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-500"
                />
                <label htmlFor="plate-consent" className="text-xs text-white/80 leading-relaxed">
                  Araç plakamın park onayı ve puan sistemi için saklanmasını ve işlenmesini kabul ediyorum.{' '}
                  <Link href="/privacy" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">
                    Gizlilik Politikası
                  </Link>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#2f7ff5] to-[#5ea3ff] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all mt-2"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-5">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-[#5ea3ff] font-semibold hover:underline">
              Giriş Yap
            </Link>
          </p>

          <p className="text-center text-sm text-white/40 mt-4">
            <Link href="/owner/register" className="text-[#5ea3ff] hover:underline">
              Otopark sahibi misiniz?
            </Link>
          </p>
        </div>
      </div>

      {/* CSS Animasyonları */}
      <style jsx global>{`
        @keyframes slow-zoom {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.12); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 24s ease-in-out infinite;
        }

        @keyframes pain-cycle {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          3%, 17% { opacity: 1; transform: translateY(0); }
          20% { opacity: 0; transform: translateY(-8px); }
        }
        .pain-word {
          position: absolute;
          inset: 0;
          opacity: 0;
          animation: pain-cycle 20s ease-in-out infinite;
        }
        .pain-1 { animation-delay: 0s; }
        .pain-2 { animation-delay: 4s; }
        .pain-3 { animation-delay: 8s; }
        .pain-4 { animation-delay: 12s; }

        @keyframes finale-cycle {
          0%, 84% { opacity: 0; transform: scale(0.96); }
          87% { opacity: 1; transform: scale(1.02); }
          90%, 100% { opacity: 1; transform: scale(1); }
        }
        .finale {
          animation: finale-cycle 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}