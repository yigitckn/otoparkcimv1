'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [processing, setProcessing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    const { data } = await supabase
      .from('ownership_claims')
      .select('*, parking:parkings(id, name, address, district)')
      .order('created_at', { ascending: false })

    if (data) setClaims(data)
    setLoading(false)
  }

  const handleApprove = async (claim: any) => {
    if (!confirm('Bu başvuruyu onaylamak istiyor musun?')) return
    setProcessing(true)

    const { data } = await supabase.auth.getUser()

    await supabase.from('ownership_claims').update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: data.user?.id
    }).eq('id', claim.id)

    await supabase.from('profiles').update({
      role: 'parking_owner'
    }).eq('id', claim.user_id)

    await supabase.from('parkings').update({
      owner_id: claim.user_id,
      is_claimed: true,
      claimed_at: new Date().toISOString()
    }).eq('id', claim.parking.id)

    setProcessing(false)
    loadClaims()
    alert('Onaylandı!')
  }

  const handleReject = async (claim: any) => {
    const reason = prompt('Red sebebi:')
    if (!confirm('Bu başvuruyu reddetmek istiyor musun?')) return
    setProcessing(true)

    const { data } = await supabase.auth.getUser()

    await supabase.from('ownership_claims').update({
      status: 'rejected',
      reject_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: data.user?.id
    }).eq('id', claim.id)

    setProcessing(false)
    loadClaims()
    alert('Reddedildi!')
  }

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter)
  const pendingCount = claims.filter(c => c.status === 'pending').length
  const approvedCount = claims.filter(c => c.status === 'approved').length
  const rejectedCount = claims.filter(c => c.status === 'rejected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sahiplenme Başvuruları</h1>
        <p className="text-slate-400">Toplam {claims.length} başvuru</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <FilterButton label={'Bekleyen (' + pendingCount + ')'} value="pending" current={filter} onClick={setFilter} />
        <FilterButton label={'Onaylanan (' + approvedCount + ')'} value="approved" current={filter} onClick={setFilter} />
        <FilterButton label={'Reddedilen (' + rejectedCount + ')'} value="rejected" current={filter} onClick={setFilter} />
        <FilterButton label={'Tümü (' + claims.length + ')'} value="all" current={filter} onClick={setFilter} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 text-center">
          <p className="text-slate-400">Başvuru bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              processing={processing}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterButton({ label, value, current, onClick }: { label: string, value: string, current: string, onClick: (v: string) => void }) {
  const isActive = current === value
  const baseClass = 'px-4 py-2 rounded-xl text-sm font-medium'
  const activeClass = isActive ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'
  
  return (
    <button onClick={() => onClick(value)} className={baseClass + ' ' + activeClass}>
      {label}
    </button>
  )
}

function ClaimCard({ claim, processing, onApprove, onReject }: { claim: any, processing: boolean, onApprove: (c: any) => void, onReject: (c: any) => void }) {
  const parkingName = claim.parking ? claim.parking.name : 'Bilinmiyor'
  const parkingAddress = claim.parking ? claim.parking.address + ', ' + claim.parking.district : ''
  const dateStr = new Date(claim.created_at).toLocaleDateString('tr-TR')

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{parkingName}</h3>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-slate-400 text-sm mb-3">{parkingAddress}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Başvuran</p>
              <p className="text-white">{claim.full_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Telefon</p>
              <p className="text-white">{claim.phone}</p>
            </div>
            <div>
              <p className="text-slate-500">Tarih</p>
              <p className="text-white">{dateStr}</p>
            </div>
          </div>
          {claim.reject_reason && (
            <div className="mt-3 p-3 bg-red-500/10 rounded-xl">
              <p className="text-red-400 text-sm">Red sebebi: {claim.reject_reason}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          {claim.document_url && (
            <a href={claim.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600">
              Belgeyi Gör
            </a>
          )}
          {claim.status === 'pending' && (
            <>
              <button onClick={() => onApprove(claim)} disabled={processing} className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50">
                Onayla
              </button>
              <button onClick={() => onReject(claim)} disabled={processing} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50">
                Reddet
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Bekliyor</span>
  }
  if (status === 'approved') {
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Onaylandı</span>
  }
  if (status === 'rejected') {
    return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Reddedildi</span>
  }
  return null
}