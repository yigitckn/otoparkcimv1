'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ParkingSquare, Users, FileCheck, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Stats {
  totalParkings: number
  claimedParkings: number
  unclaimedParkings: number
  totalUsers: number
  pendingClaims: number
  approvedClaims: number
  rejectedClaims: number
  pendingFreePark: number
}
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
  totalParkings: 0,
  claimedParkings: 0,
  unclaimedParkings: 0,
  totalUsers: 0,
  pendingClaims: 0,
  approvedClaims: 0,
  rejectedClaims: 0,
  pendingFreePark: 0  // ← EKLE
})


  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Toplam otopark
      const { count: totalParkings } = await supabase
        .from('parkings')
        .select('*', { count: 'exact', head: true })

      // Sahipli otoparklar
      const { count: claimedParkings } = await supabase
        .from('parkings')
        .select('*', { count: 'exact', head: true })
        .eq('is_claimed', true)

      // Toplam kullanıcı
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Bekleyen başvurular
      const { count: pendingClaims } = await supabase
        .from('ownership_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Onaylanan başvurular
      const { count: approvedClaims } = await supabase
        .from('ownership_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

         // Reddedilen başvurular
      const { count: rejectedClaims } = await supabase
       .from('ownership_claims')
       .select('*', { count: 'exact', head: true })
       .eq('status', 'rejected')

         // Bedava park talepleri
      const { count: pendingFreePark } = await supabase
       .from('free_park_requests')
       .select('*', { count: 'exact', head: true })
       .eq('status', 'pending')

      setStats({
        totalParkings: totalParkings || 0,
        claimedParkings: claimedParkings || 0,
        unclaimedParkings: (totalParkings || 0) - (claimedParkings || 0),
        totalUsers: totalUsers || 0,
        pendingClaims: pendingClaims || 0,
        approvedClaims: approvedClaims || 0,
        rejectedClaims: rejectedClaims || 0,
        pendingFreePark: pendingFreePark || 0
      })
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Toplam Otopark',
      value: stats.totalParkings,
      icon: ParkingSquare,
      color: 'cyan',
      bgColor: 'bg-cyan-500/20',
      textColor: 'text-cyan-400'
    },
    {
      title: 'Sahipli Otopark',
      value: stats.claimedParkings,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      title: 'Sahipsiz Otopark',
      value: stats.unclaimedParkings,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      title: 'Bekleyen Başvuru',
      value: stats.pendingClaims,
      icon: FileCheck,
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400'
    },
    {
      title: 'Onaylanan Başvuru',
      value: stats.approvedClaims,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-400'
    },
    {
  title: 'Bedava Park Talepleri',
  value: stats.pendingFreePark || 0,
  icon: CheckCircle,
  color: 'purple',
  bgColor: 'bg-purple-500/20',
  textColor: 'text-purple-400'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Platformun genel durumunu buradan takip edebilirsin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.pendingClaims > 0 && (
        <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-orange-400 font-medium">
            ⚠️ {stats.pendingClaims} adet bekleyen sahiplenme başvurusu var!
          </p>
          <a href="/admin/claims" className="text-orange-300 text-sm underline">
            Başvuruları incele →
          </a>
        </div>
      )}
    </div>
  )
}