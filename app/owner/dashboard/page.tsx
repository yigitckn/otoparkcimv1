'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, MapPin, Car, TrendingUp, Clock } from 'lucide-react'

interface Parking {
  id: string
  name: string
  address: string
  hourly_price: number
  capacity: number
  status: string
  is_active: boolean
}

interface Reservation {
  id: string
  status: string
  created_at: string
  parking: { name: string }
  profiles: { full_name: string }
}

export default function OwnerDashboardPage() {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndLoad()
  }, [])

  const checkUserAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'parking_owner') {
      router.push('/dashboard')
      return
    }

    setUser(user)
    await loadData(user.id)
  }

  const loadData = async (userId: string) => {
    try {
      const { data: parkingsData } = await supabase
        .from('parkings')
        .select('*')
        .eq('owner_id', userId)

      setParkings(parkingsData || [])

      if (parkingsData && parkingsData.length > 0) {
        const parkingIds = parkingsData.map(p => p.id)
        const { data: reservationsData } = await supabase
          .from('reservations')
          .select('*, parking:parkings(name), profiles(full_name)')
          .in('parking_id', parkingIds)
          .order('created_at', { ascending: false })
          .limit(10)

        setReservations(reservationsData || [])
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalCapacity = parkings.reduce((sum, p) => sum + (p.capacity || 0), 0)
  const activeReservations = reservations.filter(r => r.status === 'active').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <header className="bg-slate-900/50 border-b border-slate-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-white">Otoparkçım</span>
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full ml-2">İşletmeci</span>
          </Link>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-slate-400 hover:text-white text-sm"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Otopark Yönetimi</h1>
            <p className="text-slate-400">Otoparklarınızı yönetin ve takip edin</p>
          </div>
          <Link
            href="/owner/parking/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-5 h-5" />
            Otopark Ekle
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-slate-400 text-sm">Toplam Otopark</span>
            </div>
            <p className="text-3xl font-bold text-white">{parkings.length}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-slate-400 text-sm">Toplam Kapasite</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalCapacity}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-slate-400 text-sm">Aktif Rezervasyon</span>
            </div>
            <p className="text-3xl font-bold text-white">{activeReservations}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-bold text-white mb-4">Otoparklarım</h2>
            {parkings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">Henüz otopark eklemediniz</p>
                <Link
                  href="/owner/parking/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30"
                >
                  <Plus className="w-4 h-4" />
                  İlk Otoparkınızı Ekleyin
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {parkings.map((parking) => (
                  <div key={parking.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                    <div>
                      <h3 className="font-semibold text-white">{parking.name}</h3>
                      <p className="text-sm text-slate-400">{parking.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">{parking.hourly_price} TL/saat</p>
                      <p className="text-xs text-slate-500">{parking.capacity} araçlık</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-bold text-white mb-4">Son Rezervasyonlar</h2>
            {reservations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Henüz rezervasyon yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                    <div>
                      <p className="font-medium text-white">{res.profiles?.full_name || 'Misafir'}</p>
                      <p className="text-sm text-slate-400">{res.parking?.name}</p>
                    </div>
                    <span className={'px-2 py-1 rounded-full text-xs font-medium ' + 
                      (res.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                       res.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 
                       'bg-red-500/20 text-red-400')}>
                      {res.status === 'active' ? 'Aktif' : res.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}