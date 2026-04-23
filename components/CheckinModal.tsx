'use client'

import { useState, useRef } from 'react'
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
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Fotoğraf 5MB\'dan küçük olmalı')
        return
      }
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!photo) {
      setError('Lütfen arabanızın fotoğrafını çekin')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Giriş yapmanız gerekiyor')
        setLoading(false)
        return
      }

      // Fotoğrafı Storage'a yükle
      const fileName = `${user.id}/${parking.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('checkin-photos')
        .upload(fileName, photo)

      if (uploadError) {
        setError('Fotoğraf yüklenemedi: ' + uploadError.message)
        setLoading(false)
        return
      }

      // Public URL al
      const { data: urlData } = supabase.storage
        .from('checkin-photos')
        .getPublicUrl(fileName)

      // Checkin kaydı oluştur
      const { error: checkinError } = await supabase
        .from('park_checkins')
        .insert({
          user_id: user.id,
          parking_id: parking.id,
          photo_url: urlData.publicUrl,
          status: 'pending'
        })

      if (checkinError) {
        setError('Kayıt oluşturulamadı: ' + checkinError.message)
        setLoading(false)
        return
      }

      // user_points tablosunda kayıt yoksa oluştur
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

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
          <p className="text-gray-600 mb-2">Park kaydınız alındı.</p>
          <p className="text-sm text-gray-500">Fotoğrafınız 24 saat içinde kontrol edilecek ve puanınız yüklenecek.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Park Ettim</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <p className="text-blue-800 font-medium">{parking.name}</p>
            <p className="text-blue-600 text-sm mt-1">📍 Bu otoparka park ettiniz</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arabanızın Fotoğrafı <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Park halindeki arabanızın fotoğrafını çekin. Bu, park kaydınızı doğrulamamıza yardımcı olur.
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

          <div className="bg-amber-50 rounded-xl p-4 mb-5">
            <p className="text-amber-800 text-sm font-medium">🎁 Puan Kazan!</p>
            <p className="text-amber-700 text-xs mt-1">
              Her onaylanan park kaydı için puan kazanırsın. 5 onaylı park = Ücretsiz park hakkı!
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!photo || loading}
            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${
              !photo || loading
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