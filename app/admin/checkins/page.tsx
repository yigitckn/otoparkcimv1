'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Clock, Image, User, MapPin } from 'lucide-react'

interface Checkin {
  id: string
  user_id: string
  parking_id: string
  photo_url: string
  status: 'pending' | 'approved' | 'rejected'
  points_awarded: number
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
  parking?: {
    name: string
    address: string
  }
  profiles?: {
    full_name: string
    email: string
    license_plate?: string
  }
}

export default function AdminCheckinsPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadCheckins()
  }, [])

  const loadCheckins = async () => {
  const { data, error } = await supabase
    .from('park_checkins')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data) {
    const enrichedData = await Promise.all(data.map(async (checkin) => {
      const { data: parking } = await supabase
        .from('parkings')
        .select('name, address')
        .eq('id', checkin.parking_id)
        .single()
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, license_plate')
        .eq('id', checkin.user_id)
        .single()


      return {
        ...checkin,
        parking,
        profiles: profile
      }
    }))

       setCheckins(enrichedData)
     }
        setLoading(false)
       }

  const handleApprove = async (checkin: Checkin) => {
    const points = 10 // Her onaylanan checkin için 10 puan

    // Checkin'i onayla
    await supabase
      .from('park_checkins')
      .update({
        status: 'approved',
        points_awarded: points,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', checkin.id)

    // Kullanıcıya puan ekle
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', checkin.user_id)
      .single()

    if (userPoints) {
      const newTotal = userPoints.total_points + points
      const newApproved = userPoints.approved_checkins + 1
      const freeParksEarned = Math.floor(newApproved / 5) // Her 5 onaylı checkin = 1 ücretsiz park

      await supabase
        .from('user_points')
        .update({
          total_points: newTotal,
          approved_checkins: newApproved,
          free_parks_earned: freeParksEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', checkin.user_id)
    }

    loadCheckins()
    setSelectedCheckin(null)
  }

  const handleReject = async (checkin: Checkin) => {
    await supabase
      .from('park_checkins')
      .update({
        status: 'rejected',
        points_awarded: 0,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', checkin.id)

    loadCheckins()
    setSelectedCheckin(null)
  }

  const filteredCheckins = checkins.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const pendingCount = checkins.filter(c => c.status === 'pending').length

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
          <h1 className="text-2xl font-bold text-white">Park Kayıtları</h1>
          <p className="text-slate-400">
            {pendingCount > 0 ? `${pendingCount} kayıt onay bekliyor` : 'Bekleyen kayıt yok'}
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'pending', label: 'Bekleyen', color: 'yellow' },
          { key: 'approved', label: 'Onaylı', color: 'green' },
          { key: 'rejected', label: 'Reddedilen', color: 'red' },
          { key: 'all', label: 'Tümü', color: 'gray' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
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

      {/* Checkin Listesi */}
      <div className="grid gap-4">
        {filteredCheckins.map((checkin) => (
          <div
            key={checkin.id}
            className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => setSelectedCheckin(checkin)}
          >
            <div className="flex gap-4">
              <img
                src={checkin.photo_url}
                alt="Park fotoğrafı"
                className="w-24 h-24 object-cover rounded-xl"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{checkin.parking?.name || 'Bilinmeyen Otopark'}</h3>
                    <p className="text-slate-400 text-sm">{checkin.parking?.address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    checkin.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    checkin.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {checkin.status === 'pending' ? 'Bekliyor' :
                     checkin.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {checkin.profiles?.full_name || 'Anonim'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(checkin.created_at).toLocaleDateString('tr-TR')} {new Date(checkin.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCheckins.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Kayıt bulunamadı
          </div>
        )}
      </div>

      {/* Detay Modal */}
      {selectedCheckin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Park Kaydı Detayı</h2>
              <button
                onClick={() => setSelectedCheckin(null)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4">
              <img
                src={selectedCheckin.photo_url}
                alt="Park fotoğrafı"
                className="w-full h-64 object-cover rounded-xl mb-4"
              />

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Otopark</p>
                  <p className="text-white font-medium">{selectedCheckin.parking?.name}</p>
                  <p className="text-slate-400 text-sm">{selectedCheckin.parking?.address}</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Kullanıcı</p>
                  <p className="text-white font-medium">{selectedCheckin.profiles?.full_name || 'Anonim'}</p>
                  <p className="text-slate-400 text-sm">{selectedCheckin.profiles?.email}</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Araç Plakası</p>
                  <p className="text-white font-medium text-lg">
                    {selectedCheckin.profiles?.license_plate || '❌ Plaka yok'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <p className="text-slate-400 text-sm mb-1">Tarih/Saat</p>
                <p className="text-white">
                  {new Date(selectedCheckin.created_at).toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedCheckin.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selectedCheckin)}
                    className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reddet
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCheckin)}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Onayla (+10 Puan)
                  </button>
                </div>
              )}

              {selectedCheckin.status !== 'pending' && (
                <div className={`p-4 rounded-xl text-center ${
                  selectedCheckin.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedCheckin.status === 'approved' 
                    ? `✓ Onaylandı - ${selectedCheckin.points_awarded} puan verildi`
                    : '✗ Reddedildi'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}