'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Calendar, Car, LogOut, Star, Edit } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  created_at: string
  avatar_url?: string
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
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [allCheckins, setAllCheckins] = useState<Checkin[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [feedbackOptions, setFeedbackOptions] = useState<string[]>([])
  
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

    const { data: pointsData } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (pointsData) {
      setUserPoints(pointsData)
    }

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
    const loadAllHistory = async () => {
  if (!profile) return
  setLoadingHistory(true)

  try {
    const { data: checkinsData } = await supabase
      .from('park_checkins')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

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
      setAllCheckins(enrichedCheckins)
      setShowAllHistory(true)
    }
  } catch (error) {
    console.error('Geçmiş yükleme hatası:', error)
  } finally {
    setLoadingHistory(false)
  }
}   
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
   const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Preview oluştur
  const reader = new FileReader()
  reader.onloadend = () => {
    setPhotoPreview(reader.result as string)
  }
  reader.readAsDataURL(file)
  setPhotoFile(file)
}
        const handleDeleteAccount = async () => {
  if (deleteConfirmText !== 'SİL') {
    alert('Lütfen "SİL" yazarak onaylayın!')
    return
  }

  if (!confirm('⚠️ HESABINIZİ SİLMEK ÜZERESİNİZ!\n\nBu işlem geri alınamaz. Tüm verileriniz silinecek.\n\nDevam etmek istiyor musunuz?')) {
    return
  }

  setDeletingAccount(true)

  try {
    if (!profile) return

    // 1. Profil fotoğrafını sil (varsa)
    if (profile.avatar_url) {
      const fileName = profile.avatar_url.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('profile-photos')
          .remove([fileName])
      }
    }

    // 2. İlgili verileri sil
    await supabase.from('park_checkins').delete().eq('user_id', profile.id)
    await supabase.from('user_points').delete().eq('user_id', profile.id)
    await supabase.from('reviews').delete().eq('user_id', profile.id)
    
    // 3. Profili sil
    await supabase.from('profiles').delete().eq('id', profile.id)

    // 4. Auth hesabını sil (admin API gerekir, şimdilik sadece çıkış yap)
    await supabase.auth.signOut()

    // Ana sayfaya yönlendir
    router.push('/')
  } catch (error) {
    console.error('Hesap silme hatası:', error)
    alert('Hesap silinirken hata oluştu!')
  } finally {
    setDeletingAccount(false)
  }
}
const handlePhotoUpload = async () => {
  if (!photoFile || !profile) return
  setUploadingPhoto(true)

  try {
    // Dosya adı: user_id + timestamp
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${profile.id}_${Date.now()}.${fileExt}`

    // Storage'a yükle
    const { error: uploadError, data } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, photoFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Public URL al
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName)

    // Profile'a kaydet
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id)

    if (updateError) throw updateError

    // State'i güncelle
    setProfile({ ...profile, avatar_url: publicUrl })
    setShowPhotoModal(false)
    setPhotoFile(null)
    setPhotoPreview(null)
  } catch (error) {
    console.error('Fotoğraf yükleme hatası:', error)
    alert('Fotoğraf yüklenirken hata oluştu!')
  } finally {
    setUploadingPhoto(false)
  }
}
       const handlePasswordChange = async () => {
  setPasswordError('')
  
  // Validasyon
  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError('Tüm alanları doldurun!')
    return
  }
  
  if (newPassword !== confirmPassword) {
    setPasswordError('Yeni şifreler eşleşmiyor!')
    return
  }
  
  if (newPassword.length < 6) {
    setPasswordError('Yeni şifre en az 6 karakter olmalı!')
    return
  }
  
  setChangingPassword(true)
  
  try {
    // Supabase ile şifre değiştir
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    
    // Başarılı
    alert('✅ Şifreniz başarıyla değiştirildi!')
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  } catch (error: any) {
    setPasswordError(error.message || 'Şifre değiştirme başarısız!')
  } finally {
    setChangingPassword(false)
  }
}
      const handleRating = async (checkinId: string, parkingId: string) => {
  if (!profile || selectedRating === 0) return
  setSubmittingRating(true)

  try {
    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: profile.id,
        parking_id: parkingId,
        checkin_id: checkinId,
        rating: selectedRating,
        was_spot_available: true,
        feedback: feedbackOptions.join(', ')
      })

    if (error) {
      console.error('Review insert error:', error)
      throw error
    }

    // Başarılı - state güncelle
    setCheckins(prev => prev.map(c => 
      c.id === checkinId 
        ? { ...c, review: { rating: selectedRating } }
        : c
    ))
    
    setRatingCheckinId(null)
    setSelectedRating(0)
    setHoverRating(0)
    setFeedbackOptions([])
    
    alert('✅ Değerlendirmeniz kaydedildi!')
  } catch (error: any) {
    console.error('Rating hatası:', error)
    alert('❌ Hata: ' + (error.message || 'Bilinmeyen hata'))
  } finally {
    setSubmittingRating(false)
  }
}

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    })
  }

  const approvedCount = userPoints?.approved_checkins || 0
  const stampsInCurrentCard = approvedCount % 10
  const firstName = profile?.full_name?.split(' ')[0] || 'K'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-white">Otoparkçım</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Profile Header Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 mb-6">
          <div className="flex items-start gap-6">
           {/* Profile Photo */}
       <div className="relative flex-shrink-0">
        {profile?.avatar_url ? (
      <img 
         src={profile.avatar_url} 
         alt="Profile" 
         className="w-24 h-24 rounded-full object-cover"
      />
       ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
         <span className="text-white text-3xl font-bold">{firstName[0].toUpperCase()}</span>
        </div>
      )}
        <button 
            onClick={() => setShowPhotoModal(true)}
            className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full shadow-lg flex items-center justify-center border-2 border-slate-600 hover:bg-slate-600 transition-colors"
         >
           <Edit className="w-4 h-4 text-slate-300" />
          </button>
         </div> 
          

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{profile?.full_name || 'İsim Belirtilmemiş'}</h1>
              <p className="text-slate-400 mb-3">{profile?.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Üyelik: {profile?.created_at ? formatDate(profile.created_at) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition-colors flex-shrink-0"
              >
                Profili Düzenle
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            )}
          </div>

          {/* Editable Fields */}
          {editing && (
            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532 123 4567"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* DAMGA KARTI - Küçültülmüş */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Damga Kartım</h2>
                  <p className="text-sm text-slate-400">10 damga doldur, 1 park bedava kazan!</p>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{stampsInCurrentCard}/10</span>
              </div>

              {/* MAVİ GRADIENT CONTAINER - Küçültülmüş */}
              <div style={{
                background: 'linear-gradient(115deg, #0b3d8f 0%, #1d7adb 60%, #4aa0eb 100%)',
                borderRadius: '38px',
                padding: '46px',
                position: 'relative',
                overflow: 'hidden',
                maxWidth: '720px',
                margin: '0 auto'
              }}>
                {/* Landing'deki stamps kartı */}
                <div className="stamps">
                  <div className="stamps-head">
                    <span>Damga Kartım</span>
                    <span className="pill">{stampsInCurrentCard} / 10</span>
                  </div>
                  <div className="stamps-grid" style={{ gap: '32px' }}>
                    {[...Array(10)].map((_, i) => {
                      const isFilled = i < stampsInCurrentCard
                      const isReward = i === 9
                      
                      return (
                        <div
                          key={i}
                          className={`stamp ${isFilled ? 'done' : ''} ${isReward ? 'reward' : ''}`}
                          style={{ width: '75px', height: '75px', fontSize: '28px' }}
                        >
                          {isFilled ? '✓' : isReward ? '★' : i + 1}
                        </div>
                      )
                    })}
                  </div>
                  <div className="stamps-foot">
                    {stampsInCurrentCard < 10 
                      ? `${10 - stampsInCurrentCard} park sonra bedava park kazanırsın.` 
                      : 'Tebrikler! Bedava park hakkı kazandın! 🎉'}
                  </div>
                </div>
              </div>
            </div>

            {/* Park Geçmişi */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8">
              <h2 className="text-xl font-bold text-white mb-6">Park Geçmişi</h2>

              {checkins.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-1">Henüz park kaydınız yok</p>
                  <p className="text-sm text-slate-500">Bir otoparka park ettiğinizde "Park Ettim" butonuna basın</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {checkins.map((checkin) => (
  <div key={checkin.id} className="p-4 bg-slate-900/50 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-700/30">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">✓</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{checkin.parking?.name || 'Bilinmeyen Otopark'}</h3>
        <p className="text-sm text-slate-400">{checkin.parking?.address}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-slate-500">{formatDate(checkin.created_at)}</p>
        {checkin.points_awarded > 0 && (
          <p className="text-xs text-green-400 font-medium">+{checkin.points_awarded} puan</p>
        )}
      </div>
    </div>

    {/* RATING BÖLÜMÜ */}
    {checkin.status === 'approved' && (
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        {checkin.review ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Puanınız:</span>
            <span className="text-yellow-400">{'⭐'.repeat(checkin.review.rating)}</span>
          </div>
        ) : (
          <>
            {ratingCheckinId === checkin.id ? (
              <div className="space-y-4">
                   {/* Yıldızlar */}
<div>
  <p className="text-sm text-slate-300 mb-2">Bu otoparkı değerlendirin:</p>
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setSelectedRating(star)}
        className="text-4xl transition-all hover:scale-110 focus:outline-none"
      >
        <span className={`${
          star <= (hoverRating || selectedRating) 
            ? 'text-yellow-400' 
            : 'text-slate-600'
        }`}>
          {star <= (hoverRating || selectedRating) ? '★' : '☆'}
        </span>
      </button>
    ))}
  </div>
  <p className="text-xs text-slate-500 mt-1">
    {selectedRating > 0 && `${selectedRating} yıldız seçildi`}
           </p>
         </div>

                {/* Feedback Seçenekleri */}
{selectedRating > 0 && (
  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
    <p className="text-sm text-slate-300 mb-3">
      {selectedRating >= 3 ? 'Ne hoşunuza gitti?' : 'Sorun neydi?'}
    </p>
    <div className="flex flex-wrap gap-2">
      {selectedRating >= 3 ? (
        // Olumlu seçenekler
        <>
          {['Yer buldum', 'Fiyatlar uygun', 'Güvenli', 'Temiz'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (feedbackOptions.includes(option)) {
                  setFeedbackOptions(feedbackOptions.filter(o => o !== option))
                } else {
                  setFeedbackOptions([...feedbackOptions, option])
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                feedbackOptions.includes(option)
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {feedbackOptions.includes(option) && '✓ '}
              {option}
            </button>
          ))}
        </>
      ) : (
        // Olumsuz seçenekler
        <>
          {['Yer yoktu', 'Fiyatlar güncel değil', 'Güvensiz', 'Kirli'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (feedbackOptions.includes(option)) {
                  setFeedbackOptions(feedbackOptions.filter(o => o !== option))
                } else {
                  setFeedbackOptions([...feedbackOptions, option])
                }
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                feedbackOptions.includes(option)
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {feedbackOptions.includes(option) && '✓ '}
              {option}
            </button>
          ))}
        </>
      )}
    </div>
  </div>
)}

                {/* Butonlar */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRatingCheckinId(null)
                      setSelectedRating(0)
                      setHoverRating(0)
                      setFeedbackOptions([])
                    }}
                    className="flex-1 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm hover:bg-slate-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleRating(checkin.id, checkin.parking_id)}
                    disabled={selectedRating === 0 || submittingRating}
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submittingRating ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setRatingCheckinId(checkin.id)}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                ⭐ Puan Ver
              </button>
              )}
            </>
           )}
         </div>
        )}
      </div>
        ))}

                <button 
                   onClick={loadAllHistory}
                  disabled={loadingHistory}
                  className="w-full mt-6 py-3 text-cyan-400 font-medium hover:bg-cyan-500/10 rounded-xl transition-colors disabled:opacity-50"
                 >
                  {loadingHistory ? 'Yükleniyor...' : 'Tüm Geçmişi Gör'}
                 </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
             {/* İstatistikler */}
<div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
  <h2 className="text-lg font-bold text-white mb-4">İstatistikler</h2>
  
  <div className="space-y-4">
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">Toplam Park</span>
        <span className="text-lg font-bold text-white">{userPoints?.total_checkins || 0}</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
          style={{ width: `${userPoints?.total_checkins ? Math.min((userPoints.total_checkins / 100) * 100, 100) : 0}%` }}
        ></div>
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">Onaylı Park</span>
        <span className="text-lg font-bold text-white">{userPoints?.approved_checkins || 0}</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500" 
          style={{ width: `${userPoints?.approved_checkins ? Math.min((userPoints.approved_checkins / 100) * 100, 100) : 0}%` }}
        ></div>
      </div>
    </div>

            <div className="pt-4 border-t border-slate-700/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
           <div className="flex items-center justify-between">
          <div>
               <p className="text-xs text-purple-300 mb-1">Bedava Park Hakkı</p>
               <p className="text-2xl font-bold text-white">{(userPoints?.free_parks_earned || 0) - (userPoints?.free_parks_used || 0)}</p>
             </div>
             <span className="text-3xl">🎁</span>
           </div>
          </div>
        </div>
       </div>

            {/* Ayarlar */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Ayarlar</h2>
              
              <div className="space-y-2">
                     <button 
                   onClick={() => setShowPasswordModal(true)}
                   className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors flex items-center justify-between"
              >
                   <span>Şifre Değiştir</span>
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
              </button>
                
                <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors flex items-center justify-between">
                  <span>Bildirim Ayarları</span>
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              <button 
                 onClick={() => router.push('/profile/privacy')}
                  className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl transition-colors flex items-center justify-between"
                >
                  <span>Gizlilik</span>
                 <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
              </button>

                <div className="pt-4 border-t border-slate-700/50">
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                     className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                   Hesabı Sil
                 </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* PHOTO UPLOAD MODAL */}
{showPhotoModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 max-w-md w-full">
      <h3 className="text-2xl font-bold text-white mb-6">Profil Fotoğrafı</h3>
      
      {/* Preview */}
      <div className="mb-6 flex justify-center">
        {photoPreview ? (
          <img 
            src={photoPreview} 
            alt="Preview" 
            className="w-32 h-32 rounded-full object-cover border-4 border-cyan-500"
          />
        ) : profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt="Current" 
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-600"
          />
        ) : (
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{firstName[0].toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* File Input */}
      <div className="mb-6">
        <label className="block w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
            id="photo-upload"
          />
          <div className="w-full py-3 px-4 bg-slate-700 text-white rounded-xl text-center cursor-pointer hover:bg-slate-600 transition-colors border-2 border-dashed border-slate-600">
            📸 Fotoğraf Seç
          </div>
        </label>
        <p className="text-xs text-slate-400 mt-2 text-center">
          PNG, JPG veya GIF • Max 5MB
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowPhotoModal(false)
            setPhotoFile(null)
            setPhotoPreview(null)
          }}
          className="flex-1 py-3 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handlePhotoUpload}
          disabled={!photoFile || uploadingPhoto}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadingPhoto ? 'Yükleniyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  </div>
     )}
                      {/* PASSWORD CHANGE MODAL */}
{showPasswordModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 max-w-md w-full">
      <h3 className="text-2xl font-bold text-white mb-6">Şifre Değiştir</h3>
      
      {passwordError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
          {passwordError}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mevcut Şifre</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Yeni Şifre</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Yeni Şifre (Tekrar)</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowPasswordModal(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setPasswordError('')
          }}
          className="flex-1 py-3 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handlePasswordChange}
          disabled={changingPassword}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {changingPassword ? 'Değiştiriliyor...' : 'Değiştir'}
        </button>
      </div>
    </div>
  </div>
         )}
      {/* DELETE ACCOUNT MODAL */}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 rounded-3xl border-2 border-red-500/50 p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Hesabı Sil</h3>
        <p className="text-slate-400 text-sm">
          Bu işlem <span className="text-red-400 font-bold">geri alınamaz!</span> Tüm verileriniz kalıcı olarak silinecektir.
        </p>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-red-300 mb-3">
          Hesabınızı silmek için aşağıya <span className="font-bold">SİL</span> yazın:
        </p>
        <input
          type="text"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder="SİL"
          className="w-full px-4 py-3 bg-slate-900/50 border border-red-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-bold"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowDeleteModal(false)
            setDeleteConfirmText('')
          }}
          className="flex-1 py-3 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition-colors"
              >
                İptal
             </button>
            <button
                onClick={handleDeleteAccount}
                 disabled={deletingAccount || deleteConfirmText !== 'SİL'}
                 className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {deletingAccount ? 'Siliniyor...' : 'Hesabı Sil'}
             </button>
           </div>
          </div>
         </div>
   )}
   {/* ALL HISTORY MODAL */}
{showAllHistory && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 max-w-3xl w-full max-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Tüm Park Geçmişi</h3>
        <button
          onClick={() => setShowAllHistory(false)}
          className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {allCheckins.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Henüz park kaydınız yok</p>
          </div>
        ) : (
          allCheckins.map((checkin) => (
            <div 
              key={checkin.id} 
              className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30 hover:bg-slate-700/30 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                checkin.status === 'approved' ? 'bg-green-500/20' : 
                checkin.status === 'rejected' ? 'bg-red-500/20' : 
                'bg-yellow-500/20'
              }`}>
                <span className="text-2xl">
                  {checkin.status === 'approved' ? '✓' : 
                   checkin.status === 'rejected' ? '✗' : '⏳'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">
                  {checkin.parking?.name || 'Bilinmeyen Otopark'}
                </h4>
                <p className="text-sm text-slate-400 truncate">{checkin.parking?.address}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    checkin.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    checkin.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {checkin.status === 'approved' ? 'Onaylandı' :
                     checkin.status === 'rejected' ? 'Reddedildi' :
                     'Beklemede'}
                  </span>
                  {checkin.review?.rating && (
                    <span className="text-xs text-yellow-400">
                      {'⭐'.repeat(checkin.review.rating)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-500 mb-1">{formatDate(checkin.created_at)}</p>
                {checkin.points_awarded > 0 && (
                  <p className="text-sm text-green-400 font-bold">+{checkin.points_awarded} puan</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Toplam park sayısı:</span>
          <span className="text-white font-bold text-lg">{allCheckins.length}</span>
        </div>
      </div>
    </div>
  </div>
)}         
      </main>
    </div>
  )
}