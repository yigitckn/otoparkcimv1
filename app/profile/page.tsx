'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Calendar, Car, Clock, LogOut, Star } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  created_at: string
}

interface UserPoints {
  total_points: number
  total_checkins: number
  approved_checkins: number
  free_parks_earned: number
  free_parks_used: number
}

interface Checkin {
  id: string
  parking_id: string
  photo_url: string
  status: string
  points_awarded: number
  created_at: string
  parking?: {
    name: string
    address: string
  }
  review?: {
    rating: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [ratingCheckinId, setRatingCheckinId] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile({ ...profileData, email: user.email || '' })
      setFullName(profileData.full_name || '')
      setPhone(profileData.phone || '')
    }

    // Puanları yükle
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (pointsData) {
      setUserPoints(pointsData)
    }

    // Park geçmişini yükle
    const { data: checkinsData } = await supabase
      .from('park_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (checkinsData) {
      const enrichedCheckins = await Promise.all(
        checkinsData.map(async (checkin) => {
          const { data: parking } = await supabase
            .from('parkings')
            .select('name, address')
            .eq('id', checkin.parking_id)
            .single()
          
          const { data: review } = await supabase
            .from('reviews')
            .select('rating')
            .eq('checkin_id', checkin.id)
            .single()

          return { ...checkin, parking, review }
        })
      )
      setCheckins(enrichedCheckins)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone: phone })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, full_name: fullName, phone: phone })
      setEditing(false)
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleRating = async (checkinId: string, parkingId: string) => {
    if (!profile || selectedRating === 0) return
    setSubmittingRating(true)

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: profile.id,
        parking_id: parkingId,
        checkin_id: checkinId,
        rating: selectedRating,
        was_spot_available: true
      })

    if (!error) {
      setCheckins(prev => prev.map(c => 
        c.id === checkinId 
          ? { ...c, review: { rating: selectedRating } }
          : c
      ))
      setRatingCheckinId(null)
      setSelectedRating(0)
    }
    setSubmittingRating(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Profilim</h1>
              <p className="text-sm text-slate-400">Hesap bilgileriniz</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Kişisel Bilgiler
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-colors"
              >
                Düzenle
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Ad Soyad</p>
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <p className="text-white font-medium">{profile?.full_name || 'Belirtilmemiş'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="text-white font-medium">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Telefon</p>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="0532 123 4567"
                  />
                ) : (
                  <p className="text-white font-medium">{profile?.phone || 'Belirtilmemiş'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Üyelik Tarihi</p>
                <p className="text-white font-medium">{profile?.created_at ? formatDate(profile.created_at) : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Puan Kartı */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Puanlarım
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-cyan-400">{userPoints?.total_points || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Toplam Puan</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{userPoints?.approved_checkins || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Onaylı Park</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{userPoints?.free_parks_earned || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Kazanılan Ücretsiz</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">{userPoints?.free_parks_used || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Kullanılan</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Sonraki ücretsiz park</span>
              <span className="text-sm text-cyan-400 font-medium">
                {userPoints ? `${userPoints.approved_checkins % 5}/5 park` : '0/5 park'}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${userPoints ? (userPoints.approved_checkins % 5) * 20 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Her 5 onaylı park kaydında 1 ücretsiz park hakkı kazanırsın!
            </p>
          </div>
        </div>

        {/* Park Geçmişi */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-green-400" />
            Park Geçmişim
          </h2>

          {checkins.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Henüz park kaydınız yok</p>
              <p className="text-sm text-slate-500 mt-1">Bir otoparka park ettiğinizde "Park Ettim" butonuna basın</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkins.map((checkin) => (
                <div key={checkin.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <div className="flex gap-4">
                    <img 
                      src={checkin.photo_url} 
                      alt="Park fotoğrafı" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{checkin.parking?.name || 'Bilinmeyen Otopark'}</p>
                      <p className="text-xs text-slate-400">{checkin.parking?.address}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          checkin.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          checkin.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {checkin.status === 'approved' ? '✓ Onaylandı' :
                           checkin.status === 'rejected' ? '✗ Reddedildi' : '⏳ Bekliyor'}
                        </span>
                        {checkin.points_awarded > 0 && (
                          <span className="text-xs text-cyan-400">+{checkin.points_awarded} puan</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {new Date(checkin.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  {/* Puanlama - sadece onaylı checkin'ler için */}
                  {checkin.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      {checkin.review ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">Puanınız:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= checkin.review!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : ratingCheckinId === checkin.id ? (
                        <div>
                          <p className="text-sm text-slate-300 mb-3">Bu otoparkı nasıl değerlendirirsiniz?</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setSelectedRating(star)}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-7 h-7 ${
                                      star <= (hoverRating || selectedRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-slate-600'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            {selectedRating > 0 && (
                              <span className="text-sm text-slate-400">
                                {selectedRating === 1 && 'Çok Kötü'}
                                {selectedRating === 2 && 'Kötü'}
                                {selectedRating === 3 && 'Orta'}
                                {selectedRating === 4 && 'İyi'}
                                {selectedRating === 5 && 'Mükemmel'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={() => {
                                setRatingCheckinId(null)
                                setSelectedRating(0)
                              }}
                              className="px-4 py-2 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              Vazgeç
                            </button>
                            <button
                              onClick={() => handleRating(checkin.id, checkin.parking_id)}
                              disabled={selectedRating === 0 || submittingRating}
                              className="flex-1 py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                            >
                              {submittingRating ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRatingCheckinId(checkin.id)}
                          className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          Bu otoparkı puanla
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}