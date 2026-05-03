'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Camera, Upload, Car, CheckCircle } from 'lucide-react'

interface CheckinModalProps {
  parking: {
    id: string
    name: string
  }
  onClose: () => void
  onSuccess: () => void
}

export default function CheckinModal({ parking, onClose, onSuccess }: CheckinModalProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useFreepark, setUseFreepark] = useState(false)
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null)
  const [iban, setIban] = useState('')
  const [freeParkNotes, setFreeParkNotes] = useState('')
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [freeParkCount, setFreeParkCount] = useState(0)
  const supabase = createClient()
  const [success, setSuccess] = useState(false)
  const [skipPhoto, setSkipPhoto] = useState(false)
  const [photoMetadata, setPhotoMetadata] = useState<{
    timestamp: number | null
    location: { lat: number; lng: number } | null
  }>({ timestamp: null, location: null })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFreeParkCount()
  }, [])

  const loadFreeParkCount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_points')
      .select('free_parks_earned, free_parks_used')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setFreeParkCount((data.free_parks_earned || 0) - (data.free_parks_used || 0))
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Fotoğraf 5MB\'dan küçük olmalı')
        return
      }
      
      const timestamp = file.lastModified
      const now = Date.now()
      const timeDiff = Math.abs(now - timestamp) / 1000 / 60
      
      let location: { lat: number; lng: number } | null = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        } catch (err) {
          console.log('Konum alınamadı:', err)
        }
      }
      
      setPhotoMetadata({ timestamp, location })
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
      setError('')
      
      if (timeDiff > 10) {
        setError('⚠️ Bu fotoğraf eski görünüyor. Lütfen şimdi çekin.')
        setPhoto(null)
        setPreview(null)
        return
      }
    }
  }

  const handleReceiptUpload = async (file: File) => {
    setUploadingReceipt(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Fiş yükleme hatası:', error)
      alert('Fiş yüklenirken hata oluştu!')
      return null
    } finally {
      setUploadingReceipt(false)
    }
  }

  const uploadPhoto = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const fileName = `${user.id}/${parking.id}/${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('checkin-photos')
      .upload(fileName, file)

    if (uploadError) {
      alert('Fotoğraf yüklenemedi!')
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('checkin-photos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async () => {
    if (useFreepark) {
      if (!photo || !receiptPhoto || !iban) {
        alert('Lütfen tüm alanları doldurun!')
        return
      }

      if (iban.length < 26) {
        alert('Geçerli bir IBAN girin!')
        return
      }

      setLoading(true)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Kullanıcı bulunamadı')

        const parkPhotoUrl = await uploadPhoto(photo)
        if (!parkPhotoUrl) return

        const receiptPhotoUrl = await handleReceiptUpload(receiptPhoto)
        if (!receiptPhotoUrl) return

        const { data: checkin, error: checkinError } = await supabase
        .from('park_checkins')
        .insert({
          user_id: user.id,
          parking_id: parking.id,
          photo_url: parkPhotoUrl,
          status: 'pending',
          is_free_park: true,
          can_earn_points: false
      })
          .select()
          .single()


        if (checkinError) throw checkinError

        const { error: requestError } = await supabase
          .from('free_park_requests')
          .insert({
            user_id: user.id,
            checkin_id: checkin.id,
            parking_id: parking.id,
            receipt_photo_url: receiptPhotoUrl,
            iban: iban,
            notes: freeParkNotes
          })

        if (requestError) throw requestError

        // Önce mevcut değeri al
     const { data: currentPoints } = await supabase
      .from('user_points')
       .select('free_parks_used')
       .eq('user_id', user.id)
       .single()

     // Sonra artır
      const { error: updateError } = await supabase
       .from('user_points')
       .update({ free_parks_used: (currentPoints?.free_parks_used || 0) + 1 })
       .eq('user_id', user.id)
          
                    

        if (updateError) throw updateError

        alert('🎉 Bedava park talebiniz alındı! 24 saat içinde ödeme yapılacak.')
        onSuccess()
      } catch (error: any) {
        console.error('Hata:', error)
        alert('Bir hata oluştu: ' + error.message)
      } finally {
        setLoading(false)
      }
    } else {
      if (!photo && !skipPhoto) {
        alert('Lütfen araç fotoğrafı yükleyin!')
        return
      }

      setLoading(true)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Kullanıcı bulunamadı')

        let photoUrl = null
        if (photo) {
          photoUrl = await uploadPhoto(photo)
          if (!photoUrl) return
        }

        const { error: checkinError } = await supabase
          .from('park_checkins')
          .insert({
            user_id: user.id,
            parking_id: parking.id,
            photo_url: photoUrl,
            status: photo ? 'pending' : 'approved',
            metadata: photoMetadata,
            can_earn_points: !!photo
          })

        if (checkinError) throw checkinError

        const { data: existingPoints } = await supabase
          .from('user_points')
          .select('id, total_checkins')
          .eq('user_id', user.id)
          .single()

        if (!existingPoints) {
          await supabase.from('user_points').insert({
            user_id: user.id,
            total_points: 0,
            total_checkins: 1,
            approved_checkins: 0
          })
        } else {
          await supabase
            .from('user_points')
            .update({ total_checkins: existingPoints.total_checkins + 1 })
            .eq('user_id', user.id)
        }

        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } catch (err) {
        setError('Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
          <p className="text-gray-600 mb-2">Park kaydınız alındı.</p>
          <p className="text-sm text-gray-500">
            {photo ? 'Fotoğrafınız 24 saat içinde kontrol edilecek ve puanınız yüklenecek.' : 'Park kaydınız oluşturuldu.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Park Ettim</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <p className="text-blue-800 font-medium">{parking.name}</p>
            <p className="text-blue-600 text-sm mt-1">📍 Bu otoparka park ettiniz</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {freeParkCount > 0 && !useFreepark && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-5">
              <p className="text-purple-800 font-bold mb-2">🎁 {freeParkCount} Bedava Park Hakkınız Var!</p>
              <button
                onClick={() => setUseFreepark(true)}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold"
              >
                Bedava Park Hakkını Kullan
              </button>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arabanızın Fotoğrafı <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Park halindeki arabanızın fotoğrafını çekin.
            </p>

            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button
                  onClick={() => { setPhoto(null); setPreview(null) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Fotoğraf Çek</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Galeriden Seç</span>
                </button>
              </div>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
                  {useFreepark && (
  <>
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Otopark Fişi <span className="text-red-500">*</span>
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setReceiptPhoto(e.target.files?.[0] || null)}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
      />
      {receiptPhoto && (
        <p className="text-xs text-green-600 mt-1">✓ Fiş yüklendi</p>
      )}
    </div>

    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        IBAN <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={iban}
        onChange={(e) => setIban(e.target.value.replace(/\s/g, ''))}
        placeholder="TR00 0000 0000 0000 0000 0000 00"
        maxLength={26}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm"
      />
    </div>

    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Notlar (Opsiyonel)
      </label>
      <textarea
        value={freeParkNotes}
        onChange={(e) => setFreeParkNotes(e.target.value)}
        placeholder="Varsa eklemek istediğiniz not..."
        className="w-full border border-gray-300 rounded-lg p-2 text-sm h-16"
      />
    </div>
  </>
)}
          <div className="bg-amber-50 rounded-xl p-4 mb-5">
            <p className="text-amber-800 text-sm font-medium">🎁 Puan Kazan!</p>
            <p className="text-amber-700 text-xs mt-1">
              Her onaylanan park kaydı için puan kazanırsın. 10 onaylı park = Bedava park hakkı!
            </p>
          </div>

          {!photo && !preview && !skipPhoto && (
            <button
              onClick={() => {
                setSkipPhoto(true)
                setTimeout(() => handleSubmit(), 100)
              }}
              className="w-full py-3 mb-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              ⚠️ Fotoğrafsız Devam Et (Puan Kazanamazsınız)
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={(!photo && !skipPhoto) || loading}
            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${
              !photo && !skipPhoto || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Car className="w-5 h-5" />
                Park Kaydını Gönder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}