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
    available: { main: '#22c55e', dark: '#16a34a', light: '#4ade80' },
    limited: { main: '#eab308', dark: '#ca8a04', light: '#facc15' },
    full: { main: '#ef4444', dark: '#dc2626', light: '#f87171' }
  }
  
  const colorSet = status === 'available' ? colors.available : status === 'limited' ? colors.limited : colors.full
  const scale = isSelected ? 1.2 : 1
  const size = { w: 28 * scale, h: 35 * scale }
  
  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size.w}" height="${size.h}" viewBox="0 0 28 35">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${colorSet.light};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colorSet.dark};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M14 0 C6.268 0 0 6.268 0 14 C0 24.5 14 35 14 35 C14 35 28 24.5 28 14 C28 6.268 21.732 0 14 0 Z" fill="url(#grad)" filter="url(#shadow)" stroke="${isSelected ? '#ffffff' : 'none'}" stroke-width="${isSelected ? 2 : 0}"/>
        <text x="14" y="18" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3)">P</text>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(size.w, size.h),
    anchor: new google.maps.Point(size.w / 2, size.h),
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