'use client'

import { useState } from 'react'
import { Parking } from '@/types'

interface Props {
  parking: Parking
  onClose: () => void
  onReservationSuccess: () => void
}

export default function ParkingCard({ parking, onClose, onReservationSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parking_id: parking.id })
      })
      if (res.ok) {
        onReservationSuccess()
      } else {
        setError('Hata')
        setLoading(false)
      }
    } catch (e) {
      setError('Hata')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 w-80">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold">{parking.name}</h3>
        <button onClick={onClose}>X</button>
      </div>
      <p className="text-sm text-gray-500 mb-2">{parking.address}</p>
      <p className="text-xl font-bold text-blue-600 mb-4">{parking.hourly_price} TL/saat</p>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading || parking.status === 'full'}
        className="w-full py-3 bg-green-500 text-white rounded-xl disabled:bg-gray-400"
      >
        {loading ? 'Bekle...' : 'GELIYORUM'}
      </button>
    </div>
  )
}