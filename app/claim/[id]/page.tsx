'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Building2, CheckCircle, User, Phone, Mail, FileText } from 'lucide-react'

export default function ClaimParkingPage() {
  const [parking, setParking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

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
    setEmail(user.email || '')

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (profile?.full_name) {
      setFullName(profile.full_name)
    }

    const { data: parkingData } = await supabase
      .from('parkings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (parkingData) {
      setParking(parkingData)
    }

    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = user.id + '-' + Date.now() + '.' + fileExt

    const { error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(fileName, file)

    if (uploadError) {
      setError('Belge yüklenemedi: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('claim-documents')
      .getPublicUrl(fileName)

    setDocumentUrl(urlData.publicUrl)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documentUrl) {
      setError('Lütfen işletme belgenizi yükleyin')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase
      .from('ownership_claims')
      .insert({
        parking_id: params.id,
        user_id: user.id,
        full_name: fullName,
        phone: phone,
        email: email,
        document_url: documentUrl,
        status: 'pending'
      })

    if (insertError) {
      setError('Başvuru gönderilemedi: ' + insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center border border-slate-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Başvurunuz Alındı!</h2>
          <p className="text-slate-400 mb-8">
            Başvurunuz incelemeye alındı. En kısa sürede size dönüş yapacağız.
          </p>
          <Link
            href="/dashboard"
            className="inline-block w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  if (!parking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Otopark bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <header className="bg-slate-900/50 border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">İşletme Sahipliği Başvurusu</h1>
            <p className="text-sm text-slate-400">Bu otoparkın size ait olduğunu doğrulayın</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{parking.name}</h2>
              <p className="text-slate-400">{parking.address}, {parking.district}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-6">Başvuru Bilgileri</h3>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4 text-cyan-400" />
                Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Adınız ve soyadınız"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                Telefon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                İşletme Belgesi
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Vergi levhası, işletme ruhsatı veya kira sözleşmesi yükleyin
              </p>
              
              {documentUrl ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Belge yüklendi</span>
                  <button
                    type="button"
                    onClick={() => setDocumentUrl('')}
                    className="ml-auto text-green-400 text-sm underline hover:text-green-300 transition-colors"
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500"></div>
                      <span className="text-slate-400 text-sm">Yükleniyor...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-slate-400 text-sm">Belge yüklemek için tıklayın</span>
                      <span className="text-slate-500 text-xs mt-1">PDF veya resim dosyası</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 py-4 bg-slate-700 text-slate-300 rounded-xl font-semibold text-center hover:bg-slate-600 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting || !documentUrl}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25"
            >
              {submitting ? 'Gönderiliyor...' : 'Başvuru Gönder'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}