'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Upload, Search, Check, X, Trash2, Edit } from 'lucide-react'

interface Parking {
  id: string
  name: string
  address: string
  district: string
  latitude: number
  longitude: number
  is_claimed: boolean
  owner_id: string | null
  status: string
  capacity: number
  hourly_price: number
  created_at: string
}

export default function AdminParkingsPage() {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingParking, setEditingParking] = useState<Parking | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadParkings()
  }, [])

  const loadParkings = async () => {
    const { data, error } = await supabase
      .from('parkings')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setParkings(data)
    }
    setLoading(false)
  }

  const deleteParking = async (id: string) => {
    if (!confirm('Bu otoparkı silmek istediğine emin misin?')) return

    const { error } = await supabase
      .from('parkings')
      .delete()
      .eq('id', id)

    if (!error) {
      setParkings(prev => prev.filter(p => p.id !== id))
    }
  }

  const filteredParkings = parkings.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.district.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'claimed') return matchesSearch && p.is_claimed
    if (filter === 'unclaimed') return matchesSearch && !p.is_claimed
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Otoparklar</h1>
          <p className="text-slate-400">Toplam {parkings.length} otopark</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Toplu Yükle
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Otopark Ekle
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Otopark ara..."
            className="w-full py-3 px-4 pl-10 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tümü' },
            { key: 'claimed', label: 'Sahipli' },
            { key: 'unclaimed', label: 'Sahipsiz' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as 'all' | 'claimed' | 'unclaimed')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400 font-medium">Otopark</th>
                <th className="text-left p-4 text-slate-400 font-medium">İlçe</th>
                <th className="text-left p-4 text-slate-400 font-medium">Durum</th>
                <th className="text-left p-4 text-slate-400 font-medium">Sahiplik</th>
                <th className="text-right p-4 text-slate-400 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredParkings.map((parking) => (
                <tr key={parking.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{parking.name}</p>
                      <p className="text-slate-400 text-sm">{parking.address}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300">{parking.district}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      parking.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      parking.status === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {parking.status === 'available' ? 'Müsait' : parking.status === 'limited' ? 'Az Yer' : 'Dolu'}
                    </span>
                  </td>
                  <td className="p-4">
                    {parking.is_claimed ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        Sahipli
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400 text-sm">
                        <X className="w-4 h-4" />
                        Sahipsiz
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingParking(parking)}
                        className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteParking(parking.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParkings.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            Otopark bulunamadı
          </div>
        )}
      </div>

      {showAddModal && (
        <AddParkingModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadParkings()
          }}
        />
      )}

      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false)
            loadParkings()
          }}
        />
      )}

      {editingParking && (
        <EditParkingModal
          parking={editingParking}
          onClose={() => setEditingParking(null)}
          onSuccess={() => {
            setEditingParking(null)
            loadParkings()
          }}
        />
      )}
    </div>
  )
}

function AddParkingModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now()

    const { error: insertError } = await supabase
      .from('parkings')
      .insert({
        name,
        address,
        district,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        slug,
        status: 'available',
        is_active: true,
        is_claimed: false,
        hourly_price: 0,
        capacity: 0
      })

    if (insertError) {
      setError('Otopark eklenemedi: ' + insertError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Sahipsiz Otopark Ekle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Otopark Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Örnek: İSPARK Taksim"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Adres</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Taksim Meydanı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İlçe</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Beyoğlu"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Enlem (Lat)</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="41.0370"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Boylam (Lng)</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="28.9850"
                required
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            💡 Google Maps'te otoparkı bul, sağ tıkla → koordinatları kopyala
          </p>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BulkUploadModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [csvData, setCsvData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ success: number, failed: number } | null>(null)

  const supabase = createClient()

  const handleUpload = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    const lines = csvData.trim().split('\n')
    let success = 0
    let failed = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(',').map(p => p.trim())
      if (parts.length < 5) {
        failed++
        continue
      }

      const [name, address, district, lat, lng] = parts

      const slug = name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-' + Date.now() + '-' + i

      const { error } = await supabase
        .from('parkings')
        .insert({
          name,
          address,
          district,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          slug,
          status: 'available',
          is_active: true,
          is_claimed: false,
          hourly_price: 0,
          capacity: 0
        })

      if (error) {
        failed++
      } else {
        success++
      }
    }

    setResult({ success, failed })
    setLoading(false)

    if (success > 0) {
      setTimeout(() => {
        onSuccess()
      }, 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Toplu Otopark Yükle</h2>
        
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className={`p-3 rounded-xl text-sm ${result.failed > 0 ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
              ✅ {result.success} otopark eklendi
              {result.failed > 0 && ` | ❌ ${result.failed} başarısız`}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              CSV Formatında Yapıştır
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={`isim,adres,ilçe,enlem,boylam
İSPARK Taksim,Taksim Meydanı,Beyoğlu,41.0370,28.9850
İSPARK Kadıköy,Kadıköy İskelesi,Kadıköy,40.9912,29.0228`}
            />
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">📋 Format:</p>
            <code className="text-cyan-400 text-xs">
              isim,adres,ilçe,enlem,boylam
            </code>
            <p className="text-slate-500 text-xs mt-2">
              İlk satır başlık olmalı. Her satır bir otopark.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !csvData.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditParkingModal({ parking, onClose, onSuccess }: { parking: Parking, onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState(parking.name)
  const [address, setAddress] = useState(parking.address || '')
  const [district, setDistrict] = useState(parking.district || '')
  const [latitude, setLatitude] = useState(parking.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(parking.longitude?.toString() || '')
  const [capacity, setCapacity] = useState(parking.capacity?.toString() || '0')
  const [hourlyPrice, setHourlyPrice] = useState(parking.hourly_price?.toString() || '0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('parkings')
      .update({
        name,
        address,
        district,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        capacity: parseInt(capacity),
        hourly_price: parseFloat(hourlyPrice)
      })
      .eq('id', parking.id)

    if (updateError) {
      setError('Güncellenemedi: ' + updateError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Otopark Düzenle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Otopark Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Adres</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İlçe</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Enlem</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Boylam</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Kapasite</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Saatlik Ücret (₺)</label>
              <input
                type="number"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}