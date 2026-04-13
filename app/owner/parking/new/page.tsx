'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Car, Plus, Trash2, Zap, Shield, Wifi, Droplets, Clock, Camera, X } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const featureOptions = [
  { id: 'covered', label: 'Kapalı Otopark', icon: Shield },
  { id: 'security', label: '7/24 Güvenlik', icon: Shield },
  { id: 'valet', label: 'Vale Hizmeti', icon: Car },
  { id: 'ev_charging', label: 'Elektrikli Şarj', icon: Zap },
  { id: 'car_wash', label: 'Oto Yıkama', icon: Droplets },
  { id: 'wifi', label: 'Ücretsiz WiFi', icon: Wifi },
]

const defaultWorkingHours = {
  'Pazartesi': { open: '08:00', close: '22:00', is24: false, closed: false },
  'Salı': { open: '08:00', close: '22:00', is24: false, closed: false },
  'Çarşamba': { open: '08:00', close: '22:00', is24: false, closed: false },
  'Perşembe': { open: '08:00', close: '22:00', is24: false, closed: false },
  'Cuma': { open: '08:00', close: '22:00', is24: false, closed: false },
  'Cumartesi': { open: '09:00', close: '23:00', is24: false, closed: false },
  'Pazar': { open: '09:00', close: '23:00', is24: false, closed: false },
}

interface PriceRange {
  id: string
  minHour: string
  maxHour: string
  price: string
}

interface WorkingHour {
  open: string
  close: string
  is24: boolean
  closed: boolean
}

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '12px' }
const defaultCenter = { lat: 41.0082, lng: 28.9784 }
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'simplified' }]
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [{ visibility: 'on' }]
  }
]
const ParkingIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" className={className}>
    <rect x="122.24" y="212.007" fill="#707487" width="54.477" height="45.189"/>
    <rect x="228.536" y="212.007" fill="#707487" width="54.928" height="45.189"/>
    <rect x="334.393" y="212.007" fill="#707487" width="55.367" height="45.189"/>
    <path fill="#8F96AC" d="M71.059,250.571C71.443,148.983,154.408,66.335,256,66.335s184.557,82.648,184.941,184.236l0.025,6.618h34.729l-0.036-6.679C475.017,130.04,376.478,32.028,256,32.028S36.983,130.04,36.34,250.51l-0.036,6.679h34.729L71.059,250.571z"/>
    <path fill="#C7CFE2" d="M432.969,261.175v-9.885c0-97.589-79.388-176.982-176.969-176.982S79.031,153.701,79.031,251.29v9.885c0,2.198-1.788,3.986-3.986,3.986H36.327v214.81h77.941V313.433c0-2.198,1.788-3.986,3.986-3.986h275.492c2.198,0,3.986,1.788,3.986,3.986v166.539h77.941v-214.81h-38.718C434.758,265.161,432.969,263.373,432.969,261.175z"/>
    <rect x="122.24" y="446.097" fill="#EFF2FA" width="267.52" height="33.882"/>
    <rect x="122.24" y="402.25" fill="#EFF2FA" width="267.52" height="35.875"/>
    <rect x="122.24" y="360.396" fill="#EFF2FA" width="267.52" height="33.882"/>
    <rect x="122.24" y="317.426" fill="#EFF2FA" width="267.52" height="34.998"/>
  </svg>
)

export default function NewParkingPage() {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [totalCapacity, setTotalCapacity] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([
    { id: '1', minHour: '0', maxHour: '1', price: '' }
  ])
  const [workingHours, setWorkingHours] = useState<{ [key: string]: WorkingHour }>(defaultWorkingHours)
  const [is24_7, setIs24_7] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)

  const router = useRouter()
  const supabase = createClient()

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  useEffect(() => {
    checkUser()
    getUserLocation()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
          setMapCenter(loc)
        },
        () => {}
      )
    }
  }

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
  }, [])

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }

  const addPriceRange = () => {
    const lastRange = priceRanges[priceRanges.length - 1]
    const newMinHour = lastRange ? lastRange.maxHour : '0'
    setPriceRanges([...priceRanges, {
      id: Date.now().toString(),
      minHour: newMinHour,
      maxHour: '',
      price: ''
    }])
  }

  const removePriceRange = (id: string) => {
    if (priceRanges.length > 1) {
      setPriceRanges(priceRanges.filter(pr => pr.id !== id))
    }
  }

  const updatePriceRange = (id: string, field: keyof PriceRange, value: string) => {
    setPriceRanges(priceRanges.map(pr => 
      pr.id === id ? { ...pr, [field]: value } : pr
    ))
  }

  const updateWorkingHour = (day: string, field: keyof WorkingHour, value: any) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const toggle24_7 = () => {
    setIs24_7(!is24_7)
    if (!is24_7) {
      const newHours: { [key: string]: WorkingHour } = {}
      Object.keys(workingHours).forEach(day => {
        newHours[day] = { open: '00:00', close: '23:59', is24: true, closed: false }
      })
      setWorkingHours(newHours)
    } else {
      setWorkingHours(defaultWorkingHours)
    }
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || photos.length >= 5 || !user) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('parking-photos')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Yükleme hatası:', uploadError)
      setError('Fotoğraf yüklenemedi: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('parking-photos')
      .getPublicUrl(fileName)

    setPhotos([...photos, urlData.publicUrl])
    setUploading(false)
    setError('')
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!selectedLocation) {
      setError('Lütfen haritadan otopark konumunu seçin')
      return
    }

    setLoading(true)
    setError('')

    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now()

    const firstPrice = priceRanges[0]?.price || '0'

    const formattedWorkingHours: { [key: string]: string } = {}
    Object.entries(workingHours).forEach(([day, hours]) => {
      if (hours.closed) {
        formattedWorkingHours[day] = 'Kapalı'
      } else if (hours.is24 || is24_7) {
        formattedWorkingHours[day] = '24 Saat'
      } else {
        formattedWorkingHours[day] = `${hours.open} - ${hours.close}`
      }
    })

    const { error: insertError } = await supabase
      .from('parkings')
      .insert({
        owner_id: user.id,
        name,
        slug,
        address,
        district,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        hourly_price: parseFloat(firstPrice),
        capacity: parseInt(totalCapacity),
        status: 'available',
        features: features,
        price_ranges: priceRanges.map(pr => ({
          min_hour: parseInt(pr.minHour),
          max_hour: pr.maxHour ? parseInt(pr.maxHour) : null,
          price: parseFloat(pr.price)
        })),
        working_hours: formattedWorkingHours,
        photos: photos,
        is_active: true,
        trust_score: 5.0
      })
      .select()
      .single()

    if (insertError) {
      setError('Otopark eklenemedi: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/owner/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <header className="bg-slate-900/50 border-b border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/owner/dashboard" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <ParkingIcon className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-white">Yeni Otopark Ekle</h1>
              <p className="text-sm text-slate-400">Otopark bilgilerini girin</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Temel Bilgiler
            </h2>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Otopark Adı</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Örnek: Merkez Otopark"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Adres</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Sokak, Bina No, Mahalle"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">İlçe</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Örnek: Kadıköy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Toplam Kapasite (Araç Sayısı)</label>
                <input
                  type="number"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Fotoğraflar
            </h2>
            <p className="text-sm text-slate-400 mb-4">Otoparkınızın fotoğraflarını ekleyin (max 5 adet)</p>
            
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'} ${photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={uploadPhoto}
                disabled={uploading || photos.length >= 5}
                className="hidden"
              />
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                  <span className="text-cyan-400 text-sm">Yükleniyor...</span>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-slate-400 text-sm">Fotoğraf yüklemek için tıklayın</span>
                  <span className="text-slate-500 text-xs mt-1">{photos.length}/5 fotoğraf</span>
                </>
              )}
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group aspect-video rounded-xl overflow-hidden bg-slate-900">
                    <img src={photo} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Konum Seçin
            </h2>
            <p className="text-sm text-slate-400 mb-4">Haritaya tıklayarak otoparkınızın konumunu seçin</p>
            
            {isLoaded ? (
              <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onClick={onMapClick}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                styles: mapStyles,
              }}
              >
                {selectedLocation && (
                  <Marker position={selectedLocation} />
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-[300px] bg-slate-900/50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
            )}
            
            {selectedLocation && (
              <p className="text-sm text-cyan-400 mt-3">Konum seçildi: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Çalışma Saatleri
              </h2>
              <button
                type="button"
                onClick={toggle24_7}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${is24_7 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {is24_7 ? '✓ 7/24 Açık' : '7/24 Açık'}
              </button>
            </div>

            {!is24_7 && (
              <div className="space-y-3">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                    <span className="w-24 text-sm font-medium text-slate-300">{day}</span>
                    
                    <button
                      type="button"
                      onClick={() => updateWorkingHour(day, 'closed', !hours.closed)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hours.closed ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                    >
                      {hours.closed ? 'Kapalı' : 'Açık'}
                    </button>

                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateWorkingHour(day, 'open', e.target.value)}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateWorkingHour(day, 'close', e.target.value)}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => updateWorkingHour(day, 'is24', !hours.is24)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hours.is24 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        >
                          24 Saat
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-cyan-400" />
                Fiyatlandırma
              </h2>
              <button
                type="button"
                onClick={addPriceRange}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Aralık Ekle
              </button>
            </div>

            <div className="space-y-3">
              {priceRanges.map((range) => (
                <div key={range.id} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Başlangıç (saat)</label>
                      <input
                        type="number"
                        value={range.minHour}
                        onChange={(e) => updatePriceRange(range.id, 'minHour', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Bitiş (saat)</label>
                      <input
                        type="number"
                        value={range.maxHour}
                        onChange={(e) => updatePriceRange(range.id, 'maxHour', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="24+"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Ücret (TL)</label>
                      <input
                        type="number"
                        value={range.price}
                        onChange={(e) => updatePriceRange(range.id, 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="30"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  {priceRanges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePriceRange(range.id)}
                      className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Örnek: 0-1 saat 30 TL, 1-3 saat 50 TL, 3+ saat 80 TL</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Özellikler
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featureOptions.map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => toggleFeature(feature.id)}
                  className={'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ' + 
                    (features.includes(feature.id) 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                      : 'bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500'
                    )}
                >
                  <feature.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/owner/dashboard"
              className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-xl font-semibold text-center hover:bg-slate-700 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 shadow-lg shadow-cyan-500/25"
            >
              {loading ? 'Ekleniyor...' : 'Otopark Ekle'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}