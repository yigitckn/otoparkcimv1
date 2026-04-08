'use client'

import { useState, useEffect } from 'react'

interface Props {
  reservation: any
  onCancel: () => void
  onArrived: () => void
}

export default function ActiveReservation({ reservation, onCancel, onArrived }: Props) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expires = new Date(reservation.expires_at).getTime()
      const diff = expires - now

      if (diff <= 0) {
        setTimeLeft('Sure doldu')
        clearInterval(interval)
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(mins + ':' + (secs < 10 ? '0' : '') + secs)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [reservation.expires_at])

  return (
    <div className="bg-white rounded-2xl shadow-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Aktif Rezervasyon</h3>
        <span className="text-2xl font-bold text-blue-600">{timeLeft}</span>
      </div>
      <p className="text-gray-600 mb-4">{reservation.parking?.name || 'Otopark'}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold"
        >
          Iptal
        </button>
        <button
          onClick={onArrived}
          className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold"
        >
          Vardim
        </button>
      </div>
    </div>
  )
}