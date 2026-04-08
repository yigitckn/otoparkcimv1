'use client'

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useCallback, useState } from 'react'
import { Parking } from '@/types'

interface MapProps {
  parkings: Parking[]
  selectedParking: Parking | null
  userLocation: { lat: number; lng: number } | null
  onMarkerClick: (parking: Parking) => void
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

const center = { lat: 41.0082, lng: 28.9784 }

export default function Map({ parkings, selectedParking, userLocation, onMarkerClick }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const getMarkerIcon = (status: string, isSelected: boolean) => {
    const color = status === 'available' ? '#22c55e' : status === 'limited' ? '#eab308' : '#ef4444'
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: isSelected ? '#3b82f6' : '#ffffff',
      strokeWeight: isSelected ? 3 : 2,
      scale: isSelected ? 14 : 10,
    }
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-500">Harita yüklenemedi</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={userLocation || center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: 8,
          }}
        />
      )}

      {parkings.map((parking) => (
        <Marker
          key={parking.id}
          position={{ lat: Number(parking.latitude), lng: Number(parking.longitude) }}
          icon={getMarkerIcon(parking.status, selectedParking?.id === parking.id)}
          onClick={() => onMarkerClick(parking)}
        />
      ))}
    </GoogleMap>
  )
}