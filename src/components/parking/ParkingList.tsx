'use client'

import { Parking } from '@/types'

interface ParkingListProps {
  parkings: Parking[]
  selectedParking: Parking | null
  onSelect: (parking: Parking) => void
}

export default function ParkingList({ parkings, selectedParking, onSelect }: ParkingListProps) {
  const getStatusColor = (status: string) => {
    if (status === 'available') return 'text-green-600 bg-green-50'
    if (status === 'limited') return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusText = (status: string) => {
    if (status === 'available') return 'Müsait'
    if (status === 'limited') return 'Az Yer'
    return 'Dolu'
  }

  const getBgGradient = (status: string) => {
    if (status === 'available') return 'from-green-100 to-green-200'
    if (status === 'limited') return 'from-yellow-100 to-yellow-200'
    return 'from-red-100 to-red-200'
  }

  if (parkings.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-gray-500">
        <p>Otopark bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="font-bold text-gray-800">Yakın Otoparklar</h2>
        <p className="text-sm text-gray-500">{parkings.length} otopark bulundu</p>
      </div>

      <div className="divide-y divide-gray-50">
        {parkings.map((parking) => (
          <div
            key={parking.id}
            onClick={() => onSelect(parking)}
            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition ${
              selectedParking?.id === parking.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
            }`}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${getBgGradient(parking.status)} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">🅿️</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{parking.name}</h3>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs text-gray-500">{parking.trust_score?.toFixed(1) || '5.0'}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 truncate mb-2">{parking.address}</p>

              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-600">
                  {parking.hourly_price}₺
                  <span className="text-xs text-gray-400 font-normal">/saat</span>
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${getStatusColor(parking.status)}`}>
                  {getStatusText(parking.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}