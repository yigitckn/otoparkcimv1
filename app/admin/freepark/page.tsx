'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

type FilterType = 'all' | 'pending' | 'approved' | 'paid' | 'rejected'

interface FreeParkRequest {
  id: string
  user_id: string
  parking_id: string
  receipt_photo_url: string
  iban: string
  amount: number | null
  notes: string | null
  status: string
  admin_notes: string | null
  created_at: string
  paid_at: string | null
  profiles: {
    full_name: string
    email: string
  } | null
  parkings: {
    name: string
    address: string
  } | null
}

const supabase = createClient()

export default function FreeParkRequests() {
  const [requests, setRequests] = useState<FreeParkRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('pending')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('free_park_requests')
      .select(`
        *,
        profiles!free_park_requests_user_id_fkey(full_name, email),
        parkings(name, address)
      `)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error:', error)
    } else {
      setRequests((data as FreeParkRequest[]) || [])
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const updates: Record<string, string> = { status }
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    if (notes) updates.admin_notes = notes

    const { error } = await supabase
      .from('free_park_requests')
      .update(updates)
      .eq('id', id)

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      alert('Güncellendi!')
      loadRequests()
    }
  }

  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: 'pending', label: 'Bekleyen', color: 'bg-yellow-100 text-yellow-700' },
    { key: 'approved', label: 'Onaylanan', color: 'bg-blue-100 text-blue-700' },
    { key: 'paid', label: 'Ödenen', color: 'bg-green-100 text-green-700' },
    { key: 'rejected', label: 'Reddedilen', color: 'bg-red-100 text-red-700' },
    { key: 'all', label: 'Tümü', color: 'bg-gray-100 text-gray-700' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bedava Park Talepleri</h1>
            <p className="text-gray-600 mt-1">{requests.length} talep</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.key ? f.color : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500">Talep bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{req.profiles?.full_name || 'Anonim'}</h3>
                    <p className="text-sm text-gray-600">{req.profiles?.email}</p>
                    <p className="text-sm text-gray-600 mt-1">{req.parkings?.name}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'paid' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {req.status === 'pending' ? 'Bekliyor' :
                     req.status === 'approved' ? 'Onaylandı' :
                     req.status === 'paid' ? 'Ödendi' : 'Reddedildi'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">IBAN</p>
                    <p className="font-mono text-sm">{req.iban}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tutar</p>
                    <p className="font-bold">{req.amount ? req.amount + ' TL' : 'Belirlenmedi'}</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                 <a href={req.receipt_photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-center text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Fişi Görüntüle
                  </a>
                </div>

                {req.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Kullanıcı Notu:</p>
                    <p className="text-sm">{req.notes}</p>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(req.id, 'approved')}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Onayla
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Red nedeni:')
                        if (reason) updateStatus(req.id, 'rejected', reason)
                      }}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reddet
                    </button>
                  </div>
                )}

                {req.status === 'approved' && (
                  <button
                    onClick={() => updateStatus(req.id, 'paid')}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Ödendi İşaretle
                  </button>
                )}

                {req.admin_notes && (
                  <div className="mt-4 bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-500 mb-1">Admin Notu:</p>
                    <p className="text-sm text-red-700">{req.admin_notes}</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  {new Date(req.created_at).toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}