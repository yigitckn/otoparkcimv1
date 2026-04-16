'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
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
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.station', elementType: 'all', stylers: [{ visibility: 'off' }] },
]

export default function EditParkingPage() {
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  useEffect(() => {
    checkUserAndLoadParking()
  }, [])

  const checkUserAndLoadParking = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)

    const { data: parking } = await supabase
      .from('parkings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!parking) {
      router.push('/owner/dashboard')
      return
    }

    if (parking.owner_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/owner/dashboard')
        return
      }
    }

    setName(parking.name || '')
    setAddress(parking.address || '')
    setDistrict(parking.district || '')
    setTotalCapacity(parking.capacity?.toString() || '')
    setFeatures(parking.features || [])
    setPhotos(parking.photos || [])

    if (parking.latitude && parking.longitude) {
      setSelectedLocation({ lat: parking.latitude, lng: parking.longitude })
      setMapCenter({ lat: parking.latitude, lng: parking.longitude })
    }

    if (parking.price_ranges && parking.price_ranges.length > 0) {
      setPriceRanges(parking.price_ranges.map((pr: any, idx: number) => ({
        id: idx.toString(),
        minHour: pr.min_hour?.toString() || '0',
        maxHour: pr.max_hour?.toString() || '',
        price: pr.price?.toString() || ''
      })))
    } else if (parking.hourly_price > 0) {
      setPriceRanges([{ id: '1', minHour: '0', maxHour: '1', price: parking.hourly_price.toString() }])
    }

    if (parking.working_hours) {
      const wh: { [key: string]: WorkingHour } = {}
      Object.entries(parking.working_hours).forEach(([day, hours]: [string, any]) => {
        if (hours === '24 Saat') {
          wh[day] = { open: '00:00', close: '23:59', is24: true, closed: false }
        } else if (hours === 'Kapalı') {
          wh[day] = { open: '08:00', close: '22:00', is24: false, closed: true }
        } else {
          const parts = hours.split(' - ')
          wh[day] = { open: parts[0] || '08:00', close: parts[1] || '22:00', is24: false, closed: false }
        }
      })
      setWorkingHours(wh)

      const all24 = Object.values(wh).every(h => h.is24)
      setIs24_7(all24)
    }

    setLoading(false)
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
    const fileName = user.id + '-' + Date.now() + '.' + fileExt

    const { error: uploadError } = await supabase.storage
      .from('parking-photos')
      .upload(fileName, file)

    if (uploadError) {
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
    if (!user || !selectedLocation) {
      setError('Lütfen haritadan konum seçin')
      return
    }

    setSaving(true)
    setError('')

    const firstPrice = priceRanges[0]?.price || '0'

    const formattedWorkingHours: { [key: string]: string } = {}
    Object.entries(workingHours).forEach(([day, hours]) => {
      if (hours.closed) {
        formattedWorkingHours[day] = 'Kapalı'
      } else if (hours.is24 || is24_7) {
        formattedWorkingHours[day] = '24 Saat'
      } else {
        formattedWorkingHours[day] = hours.open + ' - ' + hours.close
      }
    })

    const { error: updateError } = await supabase
      .from('parkings')
      .update({
        name,
        address,
        district,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        hourly_price: parseFloat(firstPrice),
        capacity: parseInt(totalCapacity) || 0,
        features: features,
        price_ranges: priceRanges.map(pr => ({
          min_hour: parseInt(pr.minHour),
          max_hour: pr.maxHour ? parseInt(pr.maxHour) : null,
          price: parseFloat(pr.price)
        })),
        working_hours: formattedWorkingHours,
        photos: photos,
      })
      .eq('id', params.id)

    if (updateError) {
      setError('Otopark güncellenemedi: ' + updateError.message)
      setSaving(false)
      return
    }

    router.push('/owner/dashboard')
  }

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
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/owner/dashboard" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Otopark Düzenle</h1>
            <p className="text-sm text-slate-400">Otopark bilgilerini güncelleyin</p>
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Toplam Kapasite</label>
                <input
                  type="number"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Fotoğraflar
            </h2>
            
            <label className={'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ' + (uploading ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 hover:border-slate-500') + (photos.length >= 5 ? ' opacity-50 cursor-not-allowed' : '')}>
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
                  <span className="text-slate-400 text-sm">Fotoğraf yükle ({photos.length}/5)</span>
                </>
              )}
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
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
              Konum
            </h2>
            
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                onClick={onMapClick}
                options={{ disableDefaultUI: true, zoomControl: true, styles: mapStyles }}
              >
                {selectedLocation && <Marker position={selectedLocation} />}
              </GoogleMap>
            ) : (
              <div className="w-full h-[300px] bg-slate-900/50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
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
                className={'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' + (is24_7 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-700 text-slate-300')}
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
                      className={'px-3 py-1.5 rounded-lg text-xs font-medium ' + (hours.closed ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400')}
                    >
                      {hours.closed ? 'Kapalı' : 'Açık'}
                    </button>
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateWorkingHour(day, 'open', e.target.value)}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateWorkingHour(day, 'close', e.target.value)}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                        />
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
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>
            </div>

            <div className="space-y-3">
              {priceRanges.map((range) => (
                <div key={range.id} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Min Saat</label>
                      <input
                        type="number"
                        value={range.minHour}
                        onChange={(e) => updatePriceRange(range.id, 'minHour', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Max Saat</label>
                      <input
                        type="number"
                        value={range.maxHour}
                        onChange={(e) => updatePriceRange(range.id, 'maxHour', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Fiyat (TL)</label>
                      <input
                        type="number"
                        value={range.price}
                        onChange={(e) => updatePriceRange(range.id, 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                  {priceRanges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePriceRange(range.id)}
                      className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
                      : 'bg-slate-900/50 border-slate-600 text-slate-400'
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
              disabled={saving}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 shadow-lg shadow-cyan-500/25"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}