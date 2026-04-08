'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Parking } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Bell } from 'lucide-react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/map/Map'), { ssr: false })

export default function DashboardPage() {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [activeReservation, setActiveReservation] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [userName, setUserName] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  const checkUserAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
    
    if (profile?.role === 'parking_owner') {
      router.push('/owner/dashboard')
      return
    }

    if (profile?.full_name) {
      setUserName(profile.full_name.split(' ')[0])
    }

    loadParkings()
    loadReservation()
  }

  const loadParkings = async () => {
    try {
      const { data, error } = await supabase.from('parkings').select('*').eq('is_active', true)
      if (error) console.error('Error:', error)
      setParkings(data || [])
    } catch (error) {
      console.error('Hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReservation = async () => {
    try {
      const res = await fetch('/api/reservations')
      if (res.ok) {
        const data = await res.json()
        setActiveReservation(data.reservation)
      }
    } catch (e) {
      console.error('Rezervasyon yüklenemedi')
    }
  }

  const handleCancel = async () => {
    if (!activeReservation) return
    try {
      const res = await fetch('/api/reservations/' + activeReservation.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (res.ok) {
        setActiveReservation(null)
        alert('Rezervasyon iptal edildi')
      }
    } catch (e) {
      alert('Hata')
    }
  }

  const handleArrived = async () => {
    if (!activeReservation) return
    try {
      const res = await fetch('/api/reservations/' + activeReservation.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', arrived_at: new Date().toISOString() })
      })
      if (res.ok) {
        setActiveReservation(null)
        alert('Hoşgeldiniz!')
      }
    } catch (e) {
      alert('Hata')
    }
  }

  const filteredParkings = parkings.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)
    }
    return true
  }).filter(p => {
    if (filter === 'available') return p.status !== 'full'
    return true
  }).sort((a, b) => {
    if (filter === 'cheapest') return a.hourly_price - b.hourly_price
    return 0
  })

  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'cheapest', label: 'En Ucuz' },
    { key: 'available', label: 'Müsait' },
  ]

  const handleReservation = async (parkingId: string) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parking_id: parkingId })
      })
      if (res.ok) {
        alert('Rezervasyon yapıldı!')
        setSelectedParking(null)
        loadReservation()
      } else {
        const data = await res.json()
        alert(data.error || 'Hata')
      }
    } catch (e) {
      alert('Hata')
    }
  }

  const closeCard = () => setSelectedParking(null)

  const getMapsUrl = (lat: number, lng: number) => {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent hidden sm:block">Otoparkçım</span>
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Adres, ilçe veya otopark ara..."
                className="w-full py-3 px-4 pl-10 pr-20 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Ara
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{userName ? userName[0].toUpperCase() : 'U'}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{userName || 'Profil'}</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600 mr-4">İstanbul</span>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={'px-4 py-2 rounded-full text-sm font-medium transition-colors ' + (filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-96 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800">Yakın Otoparklar</h2>
            <p className="text-sm text-gray-500">{filteredParkings.length} otopark bulundu</p>
          </div>

          {filteredParkings.map((parking) => (
            <div
              key={parking.id}
              onClick={() => setSelectedParking(parking)}
              className={'p-4 border-b cursor-pointer transition-colors ' + (selectedParking?.id === parking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50')}
            >
              <div className="flex gap-3">
                <div className={'w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ' + (parking.status === 'available' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : parking.status === 'limited' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-red-500 to-rose-600')}>
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{parking.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{parking.address}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold text-blue-600">{parking.hourly_price} TL/saat</span>
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (parking.status === 'available' ? 'bg-green-100 text-green-700' : parking.status === 'limited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                      {parking.status === 'available' ? 'Müsait' : parking.status === 'limited' ? 'Az Yer' : 'Dolu'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex flex-1 relative">
          <Map parkings={filteredParkings} selectedParking={selectedParking} userLocation={userLocation} onMarkerClick={setSelectedParking} />
          
          {activeReservation && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <ActiveReservation reservation={activeReservation} onCancel={handleCancel} onArrived={handleArrived} />
            </div>
          )}

          {selectedParking && !activeReservation && (
            <div className="absolute top-4 left-4 bg-white p-5 rounded-2xl shadow-xl max-w-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedParking.name}</h3>
                  <p className="text-sm text-gray-500">{selectedParking.address}</p>
                </div>
                <button onClick={closeCard} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <span className="text-xl">×</span>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedParking.hourly_price} TL</p>
                  <p className="text-xs text-gray-500">saat</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800">{selectedParking.trust_score?.toFixed(1) || '5.0'}</p>
                  <p className="text-xs text-gray-500">puan</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className={'px-3 py-1 rounded-full text-sm font-medium ' + (selectedParking.status === 'available' ? 'bg-green-100 text-green-700' : selectedParking.status === 'limited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                  {selectedParking.status === 'available' ? 'Müsait' : selectedParking.status === 'limited' ? 'Az Yer' : 'Dolu'}
                </div>
              </div>

              <div className="flex gap-3">
                <a href={getMapsUrl(selectedParking.latitude, selectedParking.longitude)} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl text-center text-sm font-semibold hover:bg-blue-50 transition-colors">Yol Tarifi</a>
                <button onClick={() => handleReservation(selectedParking.id)} disabled={selectedParking.status === 'full'} className={'flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors ' + (selectedParking.status === 'full' ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30')}>GELİYORUM</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveReservation({ reservation, onCancel, onArrived }: { reservation: any, onCancel: () => void, onArrived: () => void }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expires = new Date(reservation.expires_at).getTime()
      const diff = expires - now

      if (diff <= 0) {
        setTimeLeft('Süre doldu')
        clearInterval(interval)
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(mins + ':' + (secs < 10 ? '0' : '') + secs)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [reservation.expires_at])

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Aktif Rezervasyon</h3>
          <p className="text-gray-500 text-sm">{reservation.parking?.name || 'Otopark'}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{timeLeft}</p>
          <p className="text-xs text-gray-500">kalan süre</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors">İptal Et</button>
        <button onClick={onArrived} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-colors">Vardım</button>
      </div>
    </div>
  )
}