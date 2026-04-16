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

const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'simplified' }]
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [{ visibility: 'on' }]
  }
]

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: mapStyles,
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
  const colors = {
    available: { from: '#22c55e', to: '#10b981' },
    limited: { from: '#f59e0b', to: '#f97316' },
    full: { from: '#ef4444', to: '#e11d48' }
  }
  
  const colorSet = status === 'available' ? colors.available : status === 'limited' ? colors.limited : colors.full
  const scale = isSelected ? 1.2 : 1
  const w = 32 * scale
  const h = 42 * scale
  
  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 32 42">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorSet.from}"/>
            <stop offset="100%" style="stop-color:${colorSet.to}"/>
          </linearGradient>
          <filter id="shadow" x="-25%" y="-15%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="url(#grad)" filter="url(#shadow)" ${isSelected ? 'stroke="white" stroke-width="2"' : ''}/>
        <circle cx="16" cy="14" r="9" fill="white"/>
        <text x="16" y="18" text-anchor="middle" fill="${colorSet.to}" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">P</text>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(w, h),
    anchor: new google.maps.Point(w / 2, h),
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