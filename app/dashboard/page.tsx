'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Parking } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Bell, X, Star, Clock, Shield, Car, Zap, Droplets, Wifi, ChevronLeft, ChevronRight, Navigation, List, Map as MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import CheckinModal from '@/components/CheckinModal'

const Map = dynamic(() => import('@/components/map/Map'), { ssr: false })

export default function DashboardPage() {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('all')
  const [featureFilters, setFeatureFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [userName, setUserName] = useState('')
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [parkingReviews, setParkingReviews] = useState<any[]>([])
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [searchBounds, setSearchBounds] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)
  const [showCheckinModal, setShowCheckinModal] = useState(false)

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

  const toggleFeatureFilter = (feature: string) => {
    setFeatureFilters(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const filteredParkings = parkings.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.address.toLowerCase().includes(q) && !p.district.toLowerCase().includes(q)) {
        return false
      }
    }
    if (sortBy === 'available' && p.status === 'full') return false
    if (featureFilters.length > 0) {
      const parkingFeatures = p.features || []
      for (const f of featureFilters) {
        if (!parkingFeatures.includes(f)) return false
      }
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'cheapest') return a.hourly_price - b.hourly_price
    if (sortBy === 'rating') return (b.trust_score || 0) - (a.trust_score || 0)
    if (userLocation) {
      const distA = getDistance(userLocation.lat, userLocation.lng, Number(a.latitude), Number(a.longitude))
      const distB = getDistance(userLocation.lat, userLocation.lng, Number(b.latitude), Number(b.longitude))
      return distA - distB
    }
    return 0
  })

  const nearbyParkings = filteredParkings.filter(p => {
    if (searchBounds) {
      const lat = Number(p.latitude)
      const lng = Number(p.longitude)
      return lat <= searchBounds.north && 
             lat >= searchBounds.south && 
             lng <= searchBounds.east && 
             lng >= searchBounds.west
    }
    
    if (userLocation) {
      const dist = getDistance(userLocation.lat, userLocation.lng, Number(p.latitude), Number(p.longitude))
      return dist <= 3
    }
    
    return true
  })

  const sortOptions = [
    { key: 'all', label: 'Tümü' },
    { key: 'cheapest', label: 'En Ucuz' },
    { key: 'rating', label: 'En Yüksek Puan' },
    { key: 'available', label: 'Müsait' },
  ]

  const featureOptions = [
    { key: 'ev_charging', label: 'Elektrikli Şarj', icon: Zap },
    { key: 'covered', label: 'Kapalı Otopark', icon: Shield },
    { key: 'car_wash', label: 'Oto Yıkama', icon: Droplets },
  ]

  const closeDetail = () => {
    setShowDetail(false)
    setSelectedParking(null)
  }

  const handleAreaSearch = (bounds: {
    north: number
    south: number
    east: number
    west: number
  }) => {
    setSearchBounds(bounds)
    setSearchCenter({
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2
    })
  }

  const handleResetSearch = () => {
    setSearchCenter(null)
    setSearchBounds(null)
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

  const FilterBar = () => (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {sortOptions.map((s) => (
        <button
          key={s.key}
          onClick={() => setSortBy(s.key)}
          className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
            sortBy === s.key
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white/95 text-gray-700 hover:bg-white border border-gray-200/80 shadow-sm backdrop-blur-sm'
          }`}
        >
          {s.label}
        </button>
      ))}
      <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 mx-1" />
      {featureOptions.map((f) => (
        <button
          key={f.key}
          onClick={() => toggleFeatureFilter(f.key)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
            featureFilters.includes(f.key)
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-white/95 text-gray-700 hover:bg-white border border-gray-200/80 shadow-sm backdrop-blur-sm'
          }`}
        >
          <f.icon className="w-3.5 h-3.5" />
          {f.label}
        </button>
      ))}
      {featureFilters.length > 0 && (
        <button
          onClick={() => setFeatureFilters([])}
          className="p-2 rounded-full bg-white/95 text-red-500 hover:bg-red-50 flex-shrink-0 border border-red-200 shadow-sm backdrop-blur-sm transition-colors"
          title="Filtreleri temizle"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/images/logo.png" alt="Otoparkçım" className="w-12 h-12 rounded-xl object-contain" />
            <span className="hidden sm:block text-2xl font-extrabold tracking-tight">
              Otopark<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">çım</span>
            </span>
          </Link>
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Adres, ilçe veya otopark ara..."
                className="w-full py-2.5 pl-11 pr-4 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <Link href="/profile" className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{userName ? userName[0].toUpperCase() : 'U'}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{userName || 'Profil'}</span>
            </Link>
          </div>
        </div>
      </header>

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
        <div className={`w-full lg:w-96 bg-white border-r overflow-y-auto ${mobileView === 'list' ? 'block' : 'hidden'} lg:block`}>
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-gray-800">Yakın Otoparklar</h2>
            <p className="text-sm text-gray-500">
              📍 {nearbyParkings.length} otopark <span className="text-blue-500 font-medium">{searchBounds ? 'bu bölgede' : '3 km içinde'}</span>
            </p>
          </div>
          <div className="p-3 border-b bg-white lg:hidden">
            <FilterBar />
          </div>

          {nearbyParkings.map((parking) => (
            <div
              key={parking.id}
              onClick={() => handleSelectParking(parking)}
              className={'p-4 border-b cursor-pointer transition-colors ' + (selectedParking?.id === parking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50')}
            >
              <div className="flex gap-3">
                {parking.source === 'ispark' ? (
                  <img src="/images/ispark-logo.png" alt="İSPARK" className="w-14 h-14 rounded-xl object-contain" />
                ) : (
                  <div className={'w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ' + (parking.status === 'available' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : parking.status === 'limited' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-red-500 to-rose-600')}>
                    P
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{parking.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{parking.address}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={parking.hourly_price > 0 ? "text-sm font-bold text-blue-600" : "text-sm font-medium text-amber-600"}>{parking.hourly_price > 0 ? parking.hourly_price + ' TL/saat' : 'Fiyat bekleniyor'}</span>
                    <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (parking.status === 'available' ? 'bg-green-100 text-green-700' : parking.status === 'limited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                      {parking.status === 'available' ? 'Müsait' : parking.status === 'limited' ? 'Az Yer' : 'Dolu'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`flex-1 relative ${mobileView === 'map' ? 'block' : 'hidden'} lg:block`}>
          <div className="absolute top-4 left-4 right-4 z-10">
            <FilterBar />
          </div>
          <Map parkings={filteredParkings} selectedParking={selectedParking} userLocation={userLocation} onMarkerClick={handleSelectParking} onAreaSearch={handleAreaSearch} searchCenter={searchCenter} onResetSearch={handleResetSearch} />
        </div>

        <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${showDetail && selectedParking ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedParking && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <h2 className="font-bold text-lg text-gray-900">Otopark Detayı</h2>
                <button onClick={closeDetail} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="relative h-56 bg-gradient-to-br from-blue-500 to-cyan-500">
                  {selectedParking.photos && selectedParking.photos.length > 0 ? (
                    <>
                      <img src={selectedParking.photos[currentPhotoIndex]} alt={selectedParking.name} className="w-full h-full object-cover" />
                      {selectedParking.photos.length > 1 && (
                        <>
                          <button onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? selectedParking.photos!.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                          </button>
                          <button onClick={() => setCurrentPhotoIndex(prev => prev === selectedParking.photos!.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
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
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${selectedParking.status === 'available' ? 'bg-green-500 text-white' : selectedParking.status === 'limited' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                    {selectedParking.status === 'available' ? '✓ Müsait' : selectedParking.status === 'limited' ? '⚠ Az Yer' : '✗ Dolu'}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedParking.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedParking.address}, {selectedParking.district}
                  </p>
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
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Fiyatlandırma
                    </h4>
                    {selectedParking.hourly_price > 0 || (selectedParking.price_ranges && selectedParking.price_ranges.length > 0) ? (
                      <div>
                        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                          {selectedParking.price_ranges && selectedParking.price_ranges.length > 0 ? (
                            selectedParking.price_ranges.map((range: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">{range.min_hour}-{range.max_hour || '+'} saat</span>
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
                        {selectedParking.source === 'ispark' && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <span>ℹ️</span> Bazı lokasyonlarda fiyat farklılık gösterebilir
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-xl p-4 text-center">
                        <p className="text-amber-700 text-sm font-medium">Fiyat bilgisi henüz eklenmedi</p>
                        <p className="text-amber-600 text-xs mt-1">İşletme tarafından güncellenecek</p>
                      </div>
                    )}
                  </div>
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t bg-white">
                {!selectedParking.is_claimed && (
                  <Link href={'/claim/' + selectedParking.id} className="block w-full py-3 mb-3 bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-xl text-center font-medium hover:bg-amber-100 transition-colors">
                    Bu otopark size mi ait?
                  </Link>
                )}
                <div className="flex gap-3">
                  <a href={getMapsUrl(selectedParking.latitude, selectedParking.longitude)} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl text-center font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Yol Tarifi
                  </a>
                  <button 
                    onClick={() => setShowCheckinModal(true)} 
                    className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Car className="w-5 h-5" />
                    PARK ETTİM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showDetail && selectedParking && (
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={closeDetail} />
        )}

        {showCheckinModal && selectedParking && (
          <CheckinModal
            parking={{ id: selectedParking.id, name: selectedParking.name }}
            onClose={() => setShowCheckinModal(false)}
            onSuccess={() => {
              setShowCheckinModal(false)
              setShowDetail(false)
              setSelectedParking(null)
            }}
          />
        )}
      </div>
    </div>
  )
}