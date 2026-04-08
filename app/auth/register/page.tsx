'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'

function ParkingAnimation() {
  const [spots, setSpots] = useState([
    { id: 1, car: null as null | { color: string, phase: string } },
    { id: 2, car: { color: '#10B981', phase: 'parked' } },
    { id: 3, car: null },
    { id: 4, car: { color: '#3B82F6', phase: 'parked' } },
    { id: 5, car: null },
    { id: 6, car: { color: '#F59E0B', phase: 'parked' } },
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

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      await supabase.from('profiles').update({
        full_name: fullName,
        phone: phone
      }).eq('id', data.user.id)
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-transparent"></div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-60 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/20">
              <span className="text-white font-bold text-3xl">P</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white text-center mb-4">Otoparkçım</h1>
          <p className="text-xl text-slate-400 text-center mb-12">Hemen ücretsiz kayıt ol</p>

          <div className="flex items-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-slate-500 text-sm">Otopark</p>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div>
              <p className="text-3xl font-bold text-white">7/24</p>
              <p className="text-slate-500 text-sm">Hizmet</p>
            </div>
            <div className="w-px h-12 bg-slate-700"></div>
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-slate-500 text-sm">Kullanıcı</p>
            </div>
          </div>

          <ParkingAnimation />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Otoparkçım</h1>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-2">Hesap Oluştur</h2>
            <p className="text-slate-400 mb-6">Ücretsiz kayıt olun</p>

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
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="Adınız Soyadınız" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="ornek@email.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="0532 123 4567" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" placeholder="En az 6 karakter" minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all">
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </form>

            <p className="text-center text-slate-500 mt-6">Zaten hesabınız var mı? <Link href="/auth/login" className="text-cyan-400 font-semibold hover:underline">Giriş Yap</Link></p>
          </div>

          <p className="text-center text-slate-600 text-sm mt-6">
            <Link href="/owner/register" className="text-cyan-400 hover:underline">Otopark sahibi misiniz?</Link>
          </p>
        </div>
      </div>
    </div>
  )
}