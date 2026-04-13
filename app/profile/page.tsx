'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Calendar, Car, Clock, CheckCircle, XCircle, LogOut, Star } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  created_at: string
}

interface Reservation {
  id: string
  status: string
  created_at: string
  expires_at: string
  parking_id: string
  parking: {
    id: string
    name: string
    address: string
    hourly_price: number
  }
  review?: {
    rating: number
    was_spot_available: boolean
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [ratingReservationId, setRatingReservationId] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [wasSpotAvailable, setWasSpotAvailable] = useState<boolean | null>(null)
  const [ratingStep, setRatingStep] = useState(1)

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

    const { data: reservationsData } = await supabase
      .from('reservations')
      .select('*, parking:parkings(id, name, address, hourly_price)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (reservationsData) {
      const reservationsWithReviews = await Promise.all(
        reservationsData.map(async (res) => {
          const { data: review } = await supabase
            .from('reviews')
            .select('rating, was_spot_available')
            .eq('reservation_id', res.id)
            .single()
          return { ...res, review }
        })
      )
      setReservations(reservationsWithReviews)
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

  const handleRating = async (reservationId: string, parkingId: string) => {
    if (!profile || selectedRating === 0 || wasSpotAvailable === null) return
    setSubmittingRating(true)

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: profile.id,
        parking_id: parkingId,
        reservation_id: reservationId,
        rating: selectedRating,
        was_spot_available: wasSpotAvailable,
      })

    if (!error) {
      setReservations(prev => prev.map(res => 
        res.id === reservationId 
          ? { ...res, review: { rating: selectedRating, was_spot_available: wasSpotAvailable } }
          : res
      ))
      setRatingReservationId(null)
      setSelectedRating(0)
      setWasSpotAvailable(null)
      setRatingStep(1)
    }
    setSubmittingRating(false)
  }

  const startRating = (reservationId: string) => {
    setRatingReservationId(reservationId)
    setRatingStep(1)
    setWasSpotAvailable(null)
    setSelectedRating(0)
  }

  const cancelRating = () => {
    setRatingReservationId(null)
    setSelectedRating(0)
    setWasSpotAvailable(null)
    setRatingStep(1)
  }

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500/20 text-green-400'
    if (status === 'completed') return 'bg-blue-500/20 text-blue-400'
    if (status === 'cancelled') return 'bg-red-500/20 text-red-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  const getStatusText = (status: string) => {
    if (status === 'active') return 'Aktif'
    if (status === 'completed') return 'Tamamlandı'
    if (status === 'cancelled') return 'İptal'
    if (status === 'no_show') return 'Gelmedi'
    return status
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

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            Rezervasyon Geçmişi
          </h2>

          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Henüz rezervasyon yapmadınız</p>
              <Link
                href="/dashboard"
                className="inline-block mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-colors"
              >
                Otopark Bul
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div key={res.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + 
                        (res.status === 'completed' ? 'bg-green-500/20' : res.status === 'cancelled' ? 'bg-red-500/20' : 'bg-blue-500/20')}>
                        {res.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : res.status === 'cancelled' ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{res.parking?.name}</p>
                        <p className="text-xs text-slate-400">{formatDate(res.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={'px-2 py-1 rounded-full text-xs font-medium ' + getStatusColor(res.status)}>
                        {getStatusText(res.status)}
                      </span>
                      <p className="text-sm text-cyan-400 mt-1">{res.parking?.hourly_price} TL/saat</p>
                    </div>
                  </div>

                  {res.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      {res.review ? (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${res.review.was_spot_available ? 'text-green-400' : 'text-red-400'}`}>
                              {res.review.was_spot_available ? '✓ Yer vardı' : '✗ Yer yoktu'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= res.review!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : ratingReservationId === res.id ? (
                        <div className="space-y-4">
                          {ratingStep === 1 ? (
                            <div>
                              <p className="text-sm text-slate-300 mb-3">Gittiğinizde yer var mıydı?</p>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setWasSpotAvailable(true)
                                    setRatingStep(2)
                                  }}
                                  className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium hover:bg-green-500/30 transition-colors border border-green-500/30"
                                >
                                  ✓ Evet, yer vardı
                                </button>
                                <button
                                  onClick={() => {
                                    setWasSpotAvailable(false)
                                    setRatingStep(2)
                                  }}
                                  className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors border border-red-500/30"
                                >
                                  ✗ Hayır, yer yoktu
                                </button>
                              </div>
                              <button
                                onClick={cancelRating}
                                className="w-full mt-3 py-2 text-slate-400 text-sm hover:text-slate-300 transition-colors"
                              >
                                Vazgeç
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-slate-300 mb-3">Hizmeti nasıl değerlendirirsiniz?</p>
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
                                  onClick={() => setRatingStep(1)}
                                  className="px-4 py-2 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                  Geri
                                </button>
                                <button
                                  onClick={() => handleRating(res.id, res.parking?.id)}
                                  disabled={selectedRating === 0 || submittingRating}
                                  className="flex-1 py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl hover:bg-cyan-600 disabled:opacity-50 transition-colors"
                                >
                                  {submittingRating ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => startRating(res.id)}
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