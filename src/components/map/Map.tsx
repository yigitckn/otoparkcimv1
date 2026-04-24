'use client'

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useCallback, useState, useEffect } from 'react'
import { Parking } from '@/types'
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer'

interface MapProps {
  parkings: Parking[]
  selectedParking: Parking | null
  userLocation: { lat: number; lng: number } | null
  onMarkerClick: (parking: Parking) => void
  onAreaSearch?: (bounds: {
    north: number
    south: number
    east: number
    west: number
  }) => void
  searchCenter?: { lat: number; lng: number } | null
  onResetSearch?: () => void
}

const mapStyles = [
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.station', elementType: 'all', stylers: [{ visibility: 'off' }] },
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

export default function Map({ parkings, selectedParking, userLocation, onMarkerClick, onAreaSearch, searchCenter, onResetSearch }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null)
  const [showAreaSearch, setShowAreaSearch] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

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

  const createClusterIcon = (count: number) => {
    const size = count > 50 ? 56 : count > 20 ? 48 : 40
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#1e40af" stroke="white" stroke-width="3"/>
        <text x="${size/2}" y="${size/2 + 5}" text-anchor="middle" fill="white" font-size="${size > 48 ? 16 : 14}" font-weight="bold" font-family="system-ui, sans-serif">${count}</text>
      </svg>
    `)}`
  }

  const onLoad = useCallback((map: google.maps.Map) => {
  setMap(map)
  
  map.addListener('dragend', () => {
    const center = map.getCenter()
    if (center) {
      setMapCenter({ lat: center.lat(), lng: center.lng() })
      setShowAreaSearch(true)
    }
  })
}, [])

  const onUnmount = useCallback(() => {
    if (clusterer) {
      clusterer.clearMarkers()
    }
    setMap(null)
  }, [clusterer])

  useEffect(() => {
    if (!map || !parkings.length) return

    if (clusterer) {
      clusterer.clearMarkers()
    }

    const markers = parkings.map(parking => {
      const marker = new google.maps.Marker({
        position: { lat: Number(parking.latitude), lng: Number(parking.longitude) },
        icon: getMarkerIcon(parking.status, selectedParking?.id === parking.id),
      })
      
      marker.addListener('click', () => onMarkerClick(parking))
      return marker
    })

      const newClusterer = new MarkerClusterer({
         map,
         markers,
         algorithm: new SuperClusterAlgorithm({ maxZoom: 16, radius: 120 }),
  renderer: {
        render: ({ count, position }) => {
          return new google.maps.Marker({
            position,
            icon: {
              url: createClusterIcon(count),
              scaledSize: new google.maps.Size(count > 50 ? 56 : count > 20 ? 48 : 40, count > 50 ? 56 : count > 20 ? 48 : 40),
              anchor: new google.maps.Point((count > 50 ? 56 : count > 20 ? 48 : 40) / 2, (count > 50 ? 56 : count > 20 ? 48 : 40) / 2),
            },
            zIndex: 1000 + count,
          })
        }
      }
    })

    setClusterer(newClusterer)

    return () => {
      newClusterer.clearMarkers()
    }
  }, [map, parkings, selectedParking])

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
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
     >
      {showAreaSearch && mapCenter && onAreaSearch && (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
      <button
          onClick={() => {
            const bounds = map?.getBounds()
            if (bounds) {
              onAreaSearch({
                north: bounds.getNorthEast().lat(),
                south: bounds.getSouthWest().lat(),
                east: bounds.getNorthEast().lng(),
                west: bounds.getSouthWest().lng()
              })
            }
            setShowAreaSearch(false)
          }}
        className="px-4 py-2.5 bg-white rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
      >
        <span>🔍</span> Bu alanda ara
      </button>
     </div>
      )}
      {searchCenter && onResetSearch && (
  <div className="absolute bottom-32 right-2 z-10">
    <button
       onClick={() => {
      if (userLocation && map) {
       map.panTo(userLocation)
       map.setZoom(15)
     }
       onResetSearch()
     }}
       className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"
       title="Konumuma dön"
    >
       <span className="text-lg">📍</span>
  </button>
    </div>
     )}
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
    </GoogleMap>
  )
}