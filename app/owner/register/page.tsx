'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'

function ParkingAnimation() {
  const [spots, setSpots] = useState([
    { id: 1, car: { color: '#8B5CF6', phase: 'parked' } as null | { color: string, phase: string } },
    { id: 2, car: null },
    { id: 3, car: { color: '#3B82F6', phase: 'parked' } },
    { id: 4, car: null },
    { id: 5, car: { color: '#EC4899', phase: 'parked' } },
    { id: 6, car: null },
  ])

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  useEffect(() => {
    const interval = setInterval(() => {
      setSpots(prev => {
        const newSpots = [...prev]
        const emptySpots = newSpots.filter(s => s.car === null)
        const parkedSpots = newSpots.filter(s => s.car?.phase === 'parked')

        const action = Math.random()

        if (action < 0.35 && parkedSpots.length > 1) {
          const spot = parkedSpots[Math.floor(Math.random() * parkedSpots.length)]
          const idx = newSpots.findIndex(s => s.id === spot.id)
          if (idx !== -1 && newSpots[idx].car) {
            newSpots[idx] = { ...newSpots[idx], car: { ...newSpots[idx].car!, phase: 'leaving' } }
          }
        } else if (emptySpots.length > 0) {
          const spot = emptySpots[Math.floor(Math.random() * emptySpots.length)]
          const idx = newSpots.findIndex(s => s.id === spot.id)
          const color = colors[Math.floor(Math.random() * colors.length)]
          if (idx !== -1) {
            newSpots[idx] = { ...newSpots[idx], car: { color, phase: 'entering' } }
          }
        }

        return newSpots
      })
    }, 2000)

    const phaseInterval = setInterval(() => {
      setSpots(prev => prev.map(spot => {
        if (spot.car?.phase === 'entering') {
          return { ...spot, car: { ...spot.car, phase: 'parked' } }
        }
        if (spot.car?.phase === 'leaving') {
          return { ...spot, car: null }
        }
        return spot
      }))
    }, 1500)

    return () => {
      clearInterval(interval)
      clearInterval(phaseInterval)
    }
  }, [])

  const CarIcon = ({ color }: { color: string }) => (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
      <path d="M52.11,33.19l-3.2-2.62a1.46,1.46,0,0,0-.49-.26l-4.91-12.5a4.87,4.87,0,0,0-4.54-3.08H25a4.87,4.87,0,0,0-4.54,3.08l-4.91,12.5a1.46,1.46,0,0,0-.49.26l-3.2,2.62a4.86,4.86,0,0,0-1.77,3.76V47.82a1.46,1.46,0,0,0,1.46,1.46h5.84a1.46,1.46,0,0,0,1.46-1.46V44.44H45.19v3.38a1.46,1.46,0,0,0,1.46,1.46h5.84a1.46,1.46,0,0,0,1.46-1.46V36.94A4.86,4.86,0,0,0,52.11,33.19Z" fill={color}/>
      <path d="M21.1,19.62A1.94,1.94,0,0,1,22.91,18.6H41.09a1.94,1.94,0,0,1,1.81,1l4.19,10.67H16.91Z" fill="#B4D7EE"/>
      <ellipse cx="20.52" cy="39.6" rx="4.38" ry="4.38" fill="#324A5E"/>
      <ellipse cx="20.52" cy="39.6" rx="2.19" ry="2.19" fill="#E8EDEE"/>
      <ellipse cx="43.48" cy="39.6" rx="4.38" ry="4.38" fill="#324A5E"/>
      <ellipse cx="43.48" cy="39.6" rx="2.19" ry="2.19" fill="#E8EDEE"/>
      <rect x="25.49" y="33.04" width="13.02" height="4.38" rx="0.97" fill="#FFE14D"/>
    </svg>
  )

  return (
    <div className="absolute bottom-16 left-0 right-0 px-12">
      <div className="flex justify-center gap-4">
        {spots.map((spot) => {
          const car = spot.car
          let translateY = '-60px'
          let opacity = 0

          if (car?.phase === 'entering') {
            translateY = '-30px'
            opacity = 0.6
          } else if (car?.phase === 'parked') {
            translateY = '0px'
            opacity = 1
          } else if (car?.phase === 'leaving') {
            translateY = '-60px'
            opacity = 0
          }

          return (
            <div key={spot.id} className="flex flex-col items-center">
              <div className="h-16 flex items-end justify-center">
                <div className="transition-all duration-1000 ease-in-out" style={{ transform: `translateY(${translateY})`, opacity }}>
                  {car && <CarIcon color={car.color} />}
                </div>
              </div>
              <div className="w-14 h-8 bg-white/5 rounded-md border-2 border-dashed border-white/20 flex items-center justify-center mt-1">
                <span className="text-white/40 text-xs font-semibold">P{spot.id}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-center text-white/30 text-xs mt-4">Canlı otopark görünümü</p>
    </div>
  )
}

const ParkingIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" className={className}>
    <rect x="122.24" y="212.007" fill="#707487" width="54.477" height="45.189"/>
    <rect x="228.536" y="212.007" fill="#707487" width="54.928" height="45.189"/>
    <rect x="334.393" y="212.007" fill="#707487" width="55.367" height="45.189"/>
    <path fill="#8F96AC" d="M71.059,250.571C71.443,148.983,154.408,66.335,256,66.335s184.557,82.648,184.941,184.236l0.025,6.618h34.729l-0.036-6.679C475.017,130.04,376.478,32.028,256,32.028S36.983,130.04,36.34,250.51l-0.036,6.679h34.729L71.059,250.571z"/>
    <path fill="#C7CFE2" d="M432.969,261.175v-9.885c0-97.589-79.388-176.982-176.969-176.982S79.031,153.701,79.031,251.29v9.885c0,2.198-1.788,3.986-3.986,3.986H36.327v214.81h77.941V313.433c0-2.198,1.788-3.986,3.986-3.986h275.492c2.198,0,3.986,1.788,3.986,3.986v166.539h77.941v-214.81h-38.718C434.758,265.161,432.969,263.373,432.969,261.175z M184.689,261.175c0,2.198-1.788,3.986-3.986,3.986h-62.449c-2.198,0-3.986-1.788-3.986-3.986v-53.161c0-2.198,1.788-3.986,3.986-3.986h62.449c2.198,0,3.986,1.788,3.986,3.986V261.175z M291.436,261.175c0,2.198-1.788,3.986-3.986,3.986H224.55c-2.198,0-3.986-1.788-3.986-3.986v-53.161c0-2.198,1.788-3.986,3.986-3.986h62.901c2.198,0,3.986,1.788,3.986,3.986V261.175z M397.732,261.175c0,2.198-1.788,3.986-3.986,3.986h-63.339c-2.198,0-3.986-1.788-3.986-3.986v-53.161c0-2.198,1.788-3.986,3.986-3.986h63.339c2.198,0,3.986,1.788,3.986,3.986V261.175z"/>
    <rect x="122.24" y="446.097" fill="#EFF2FA" width="267.52" height="33.882"/>
    <rect x="122.24" y="402.25" fill="#EFF2FA" width="267.52" height="35.875"/>
    <rect x="122.24" y="360.396" fill="#EFF2FA" width="267.52" height="33.882"/>
    <rect x="122.24" y="317.426" fill="#EFF2FA" width="267.52" height="34.998"/>
  </svg>
)

export default function OwnerRegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [document, setDocument] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<'tax' | 'license' | 'lease'>('tax')

  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!document) {
      setError('Lütfen işletme belgenizi yükleyin')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: 'parking_owner'
        }
      }
    })

    if (signUpError) {
      setError('Kayıt başarısız. ' + signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Profile güncelle
      await supabase.from('profiles').update({
        full_name: fullName,
        phone: phone,
        role: 'parking_owner'
      }).eq('id', data.user.id)

      // Belgeyi yükle ve claim oluştur
      const fileName = `${data.user.id}/${documentType}_${Date.now()}.${document.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('owner-documents')
        .upload(fileName, document)

      if (uploadError) {
        setError('Belge yüklenemedi: ' + uploadError.message)
        setLoading(false)
        return
      }

      // Claim kaydı oluştur
  await supabase.from('ownership_claims').insert({
     user_id: data.user.id,
     full_name: fullName,
     phone: phone,
     email: email,
     document_url: fileName,
     document_type: documentType,
     status: 'pending',
     claim_type: 'owner_registration'
   })
    }

    router.push('/owner/dashboard')
  }

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent"></div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-60 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="mb-8">
            <ParkingIcon className="w-24 h-24" />
          </div>

          <h1 className="text-4xl font-bold text-white text-center mb-4">İşletme Kaydı</h1>
          <p className="text-xl text-slate-400 text-center mb-12">Boş Saatlerinizi Doldurmanın En Kolay Yolu</p>

          <div className="flex items-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">%0</p>
              <p className="text-slate-500 text-sm">Komisyon</p>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div>
              <p className="text-3xl font-bold text-white">Anında</p>
              <p className="text-slate-500 text-sm">Onay</p>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div>
              <p className="text-3xl font-bold text-white">7/24</p>
              <p className="text-slate-500 text-sm">Destek</p>
            </div>
          </div>

          <ParkingAnimation />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <ParkingIcon className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">İşletme Kaydı</h1>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-2">Otopark Sahibi Kayıt</h2>
            <p className="text-slate-400 mb-6">İşletmenizi büyütün</p>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Adınız Soyadınız" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="ornek@email.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="0532 123 4567" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="En az 6 karakter" minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Belge Yükleme */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  İşletme Belgesi <span className="text-red-400">*</span>
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="tax">Vergi Levhası</option>
                  <option value="license">İşyeri Açma Ruhsatı</option>
                  <option value="lease">Kira Sözleşmesi</option>
                </select>
                
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setDocument(e.target.files?.[0] || null)}
                    className="hidden"
                    id="doc-upload"
                    required
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    {document ? (
                      <p className="text-green-400">✓ {document.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-400 mb-1">📄 Belge yükleyin</p>
                        <p className="text-slate-500 text-xs">PDF veya resim (max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 shadow-lg shadow-purple-500/20 transition-all">
                {loading ? 'Kayıt yapılıyor...' : 'İşletme Kaydı Oluştur'}
              </button>
            </form>

            <p className="text-center text-slate-500 mt-6">Zaten hesabınız var mı? <Link href="/auth/login" className="text-purple-400 font-semibold hover:underline">Giriş Yap</Link></p>
          </div>

          <p className="text-center text-slate-600 text-sm mt-6">
            <Link href="/auth/register" className="text-cyan-400 hover:underline">Normal kullanıcı olarak kayıt ol</Link>
          </p>
        </div>
      </div>
    </div>
  )
}