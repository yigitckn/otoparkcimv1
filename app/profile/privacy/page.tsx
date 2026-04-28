'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Eye, Shield } from 'lucide-react'

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Tüm kullanıcı verilerini topla
    const [profile, points, checkins, reviews] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_points').select('*').eq('user_id', user.id).single(),
      supabase.from('park_checkins').select('*').eq('user_id', user.id),
      supabase.from('reviews').select('*').eq('user_id', user.id)
    ])

    setUserData({
      profile: profile.data,
      points: points.data,
      checkins: checkins.data || [],
      reviews: reviews.data || [],
      email: user.email
    })

    setLoading(false)
  }

  const downloadData = () => {
    if (!userData) return

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `otoparkçım-verilerim-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
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
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-3 text-white hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Geri</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Gizlilik ve Verilerim</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Veri Özeti */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Veri Özetiniz</h2>
              <p className="text-sm text-slate-400">Otoparkçım'da saklanan verileriniz</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-slate-400 text-sm mb-1">Park Sayısı</p>
              <p className="text-2xl font-bold text-white">{userData?.checkins.length || 0}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-slate-400 text-sm mb-1">Değerlendirme</p>
              <p className="text-2xl font-bold text-white">{userData?.reviews.length || 0}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-slate-400 text-sm mb-1">Toplam Puan</p>
              <p className="text-2xl font-bold text-white">{userData?.points?.total_points || 0}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
              <p className="text-slate-400 text-sm mb-1">Profil Fotoğrafı</p>
              <p className="text-2xl font-bold text-white">{userData?.profile?.avatar_url ? '✓' : '—'}</p>
            </div>
          </div>
        </div>

        {/* Verileriniz */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Saklanan Verileriniz</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-slate-300">Ad Soyad</span>
              <span className="text-white font-medium">{userData?.profile?.full_name || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-slate-300">E-posta</span>
              <span className="text-white font-medium">{userData?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-slate-300">Telefon</span>
              <span className="text-white font-medium">{userData?.profile?.phone || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
              <span className="text-slate-300">Kayıt Tarihi</span>
              <span className="text-white font-medium">
                {userData?.profile?.created_at ? new Date(userData.profile.created_at).toLocaleDateString('tr-TR') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* İndirme */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">Verilerinizi İndirin</h3>
              <p className="text-sm text-slate-400 mb-4">
                Otoparkçım'da saklanan tüm verilerinizi JSON formatında indirebilirsiniz. 
                Bu dosya kişisel bilgilerinizi, park geçmişinizi ve değerlendirmelerinizi içerir.
              </p>
              <button
                onClick={downloadData}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Verilerimi İndir
              </button>
            </div>
          </div>
        </div>

        {/* GDPR Bilgi */}
        <div className="mt-6 p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
          <p className="text-xs text-slate-500 text-center">
            Verileriniz KVKK ve GDPR kapsamında korunmaktadır. Dilediğiniz zaman verilerinizi indirebilir 
            veya hesabınızı silerek tüm verilerinizi kalıcı olarak silebilirsiniz.
          </p>
        </div>
      </main>
    </div>
  )
}