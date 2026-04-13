'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Parking } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Bell, X, Star, Clock, Shield, Car, Zap, Droplets, Wifi, ChevronLeft, ChevronRight, Navigation, List, Map as MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/map/Map'), { ssr: false })

export default function DashboardPage() {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [activeReservation, setActiveReservation] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [userName, setUserName] = useState('')
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [parkingReviews, setParkingReviews] = useState<any[]>([])
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')

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

  useEffect(() => {
    const channel = supabase
      .channel('user-parking-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'parkings'
      }, (payload) => {
        setParkings(prev => prev.map(p => 
          p.id === payload.new.id ? { ...p, ...payload.new } : p
        ))
        if (selectedParking?.id === payload.new.id) {
          setSelectedParking(prev => prev ? { ...prev, ...payload.new } : null)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedParking?.id])

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

  const loadParkingReviews = async (parkingId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('parking_id', parkingId)
      .order('created_at', { ascending: false })
      .limit(5)
    setParkingReviews(data || [])
  }

  const handleSelectParking = async (parking: Parking) => {
    setSelectedParking(parking)
    setShowDetail(true)
    setCurrentPhotoIndex(0)
    await loadParkingReviews(parking.id)
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
        setShowDetail(false)
        loadReservation()
      } else {
        const data = await res.json()
        alert(data.error || 'Hata')
      }
    } catch (e) {
      alert('Hata')
    }
  }

  const closeDetail = () => {
    setShowDetail(false)
    setSelectedParking(null)
  }

  const getMapsUrl = (lat: number, lng: number) => {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng
  }

  const getFeatureIcon = (feature: string) => {
    const icons: { [key: string]: any } = {
      'covered': Shield,
      'security': Shield,
      'valet': Car,
      'ev_charging': Zap,
      'car_wash': Droplets,
      'wifi': Wifi,
    }
    return icons[feature] || Shield
  }

  const getFeatureLabel = (feature: string) => {
    const labels: { [key: string]: string } = {
      'covered': 'Kapalı Otopark',
      'security': '7/24 Güvenlik',
      'valet': 'Vale Hizmeti',
      'ev_charging': 'Elektrikli Şarj',
      'car_wash': 'Oto Yıkama',
      'wifi': 'Ücretsiz WiFi',
    }
    return labels[feature] || feature
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
            <img src="/images/logo.png" alt="Otoparkçım" className="w-10 h-10 rounded-xl object-contain" />
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

      {/* Mobil Tab Butonları */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${mobileView === 'list' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600'}`}
        >
          <List className="w-5 h-5" />
          Liste
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition-colors ${mobileView === 'map' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600'}`}
        >
          <MapIcon className="w-5 h-5" />
          Harita
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Liste - Desktop'ta her zaman, Mobilde sadece list seçiliyse */}
        <div className={`w-full lg:w-96 bg-white border-r overflow-y-auto ${mobileView === 'list' ? 'block' : 'hidden'} lg:block`}>
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800">Yakın Otoparklar</h2>
            <p className="text-sm text-gray-500">{filteredParkings.length} otopark bulundu</p>
          </div>

          {filteredParkings.map((parking) => (
            <div
              key={parking.id}
              onClick={() => handleSelectParking(parking)}
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

          {/* Mobil Aktif Rezervasyon - Liste görünümünde */}
          {activeReservation && mobileView === 'list' && (
            <div className="p-4 lg:hidden">
              <ActiveReservation reservation={activeReservation} onCancel={handleCancel} onArrived={handleArrived} />
            </div>
          )}
        </div>

        {/* Harita - Desktop'ta her zaman, Mobilde sadece map seçiliyse */}
        <div className={`flex-1 relative ${mobileView === 'map' ? 'block' : 'hidden'} lg:block`}>
          <Map parkings={filteredParkings} selectedParking={selectedParking} userLocation={userLocation} onMarkerClick={handleSelectParking} />
          
          {/* Desktop Aktif Rezervasyon */}
          {activeReservation && (
            <div className="absolute bottom-4 left-4 right-4 z-20 hidden lg:block">
              <ActiveReservation reservation={activeReservation} onCancel={handleCancel} onArrived={handleArrived} />
            </div>
          )}

          {/* Mobil Aktif Rezervasyon - Harita görünümünde */}
          {activeReservation && mobileView === 'map' && (
            <div className="absolute bottom-4 left-4 right-4 z-20 lg:hidden">
              <ActiveReservation reservation={activeReservation} onCancel={handleCancel} onArrived={handleArrived} />
            </div>
          )}
        </div>

        {/* Detay Paneli */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${showDetail && selectedParking ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedParking && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <h2 className="font-bold text-lg text-gray-900">Otopark Detayı</h2>
                <button onClick={closeDetail} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* İçerik */}
              <div className="flex-1 overflow-y-auto">
                {/* Fotoğraf Galerisi */}
                <div className="relative h-56 bg-gradient-to-br from-blue-500 to-cyan-500">
                  {selectedParking.photos && selectedParking.photos.length > 0 ? (
                    <>
                      <img 
                        src={selectedParking.photos[currentPhotoIndex]} 
                        alt={selectedParking.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedParking.photos.length > 1 && (
                        <>
                          <button 
                            onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? selectedParking.photos!.length - 1 : prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                          </button>
                          <button 
                            onClick={() => setCurrentPhotoIndex(prev => prev === selectedParking.photos!.length - 1 ? 0 : prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {selectedParking.photos.map((_, idx) => (
                              <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white/80">
                        <Car className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Fotoğraf yok</p>
                      </div>
                    </div>
                  )}
                  {/* Durum Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${selectedParking.status === 'available' ? 'bg-green-500 text-white' : selectedParking.status === 'limited' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                    {selectedParking.status === 'available' ? '✓ Müsait' : selectedParking.status === 'limited' ? '⚠ Az Yer' : '✗ Dolu'}
                  </div>
                </div>

                {/* Temel Bilgiler */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedParking.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedParking.address}, {selectedParking.district}
                  </p>

                  {/* Puan ve İstatistikler */}
                  <div className="flex items-center gap-6 mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg font-bold text-gray-900">{selectedParking.trust_score?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span className="text-sm text-gray-500">({parkingReviews.length} değerlendirme)</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{selectedParking.capacity || '-'}</p>
                      <p className="text-xs text-gray-500">Kapasite</p>
                    </div>
                  </div>

                  {/* Fiyatlandırma */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Fiyatlandırma
                    </h4>
                    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                      {selectedParking.price_ranges && selectedParking.price_ranges.length > 0 ? (
                        selectedParking.price_ranges.map((range: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">
                              {range.min_hour}-{range.max_hour || '+'} saat
                            </span>
                            <span className="font-bold text-blue-600">{range.price} TL</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Saatlik</span>
                          <span className="font-bold text-blue-600">{selectedParking.hourly_price} TL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Özellikler */}
                  {selectedParking.features && selectedParking.features.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Özellikler</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedParking.features.map((feature: string) => {
                          const Icon = getFeatureIcon(feature)
                          return (
                            <div key={feature} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                              <Icon className="w-4 h-4 text-blue-500" />
                              {getFeatureLabel(feature)}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Çalışma Saatleri */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      Çalışma Saatleri
                    </h4>
                    <div className="bg-green-50 rounded-xl p-4">
                      {selectedParking.working_hours ? (
                        <div className="space-y-1 text-sm">
                          {Object.entries(selectedParking.working_hours).map(([day, hours]: [string, any]) => (
                            <div key={day} className="flex justify-between">
                              <span className="text-gray-600">{day}</span>
                              <span className="font-medium text-gray-900">{hours}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-700 font-medium text-center">7/24 Açık</p>
                      )}
                    </div>
                  </div>

                  {/* Değerlendirmeler */}
                  {parkingReviews.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Son Değerlendirmeler</h4>
                      <div className="space-y-3">
                        {parkingReviews.map((review) => (
                          <div key={review.id} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800 text-sm">{review.profiles?.full_name || 'Anonim'}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <p className={`text-xs ${review.was_spot_available ? 'text-green-600' : 'text-red-600'}`}>
                              {review.was_spot_available ? '✓ Yer vardı' : '✗ Yer yoktu'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-3">
                  <a 
                    href={getMapsUrl(selectedParking.latitude, selectedParking.longitude)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl text-center font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Yol Tarifi
                  </a>
                  <button 
                    onClick={() => handleReservation(selectedParking.id)} 
                    disabled={selectedParking.status === 'full' || !!activeReservation} 
                    className={'flex-1 py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ' + (selectedParking.status === 'full' || activeReservation ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30')}
                  >
                    <Car className="w-5 h-5" />
                    GELİYORUM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay */}
        {showDetail && selectedParking && (
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={closeDetail} />
        )}
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