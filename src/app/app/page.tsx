'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Parking } from '@/types'
import Map from '@/components/map/Map'
import ParkingList from '@/components/parking/ParkingList'
import ParkingCard from '@/components/parking/ParkingCard'
import ActiveReservation from '@/components/reservation/ActiveReservation'
import { Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

export default function AppPage() {
  const [parkings, setParkings] = useState<Parking[]>([])
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [activeReservation, setActiveReservation] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'nearby' | 'available' | 'cheapest'>('all')
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const { data: parkingsData } = await supabase
        .from('parkings')
        .select('*')
        .eq('is_active', true)

      setParkings(parkingsData || [])

      const response = await fetch('/api/reservations')
      if (response.ok) {
        const data = await response.json()
        if (data.reservation) {
          setActiveReservation(data.reservation)
        }
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredParkings = parkings.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return p.name.toLowerCase().includes(query) ||
             p.address.toLowerCase().includes(query) ||
             p.district.toLowerCase().includes(query)
    }
    return true
  }).filter(p => {
    if (filter === 'available') return p.status !== 'full'
    return true
  }).sort((a, b) => {
    if (filter === 'cheapest') return a.hourly_price - b.hourly_price
    return 0
  })

  const handleReservationSuccess = () => {
    setSelectedParking(null)
    loadData()
  }

  const handleCancelReservation = async () => {
    if (!activeReservation) return
    try {
      const response = await fetch(`/api/reservations/${activeReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (response.ok) {
        setActiveReservation(null)
        loadData()
      }
    } catch (error) {
      console.error('İptal hatası:', error)
    }
  }

  const handleArrived = async () => {
    if (!activeReservation) return
    try {
      const response = await fetch(`/api/reservations/${activeReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', arrived_at: new Date().toISOString() })
      })
      if (response.ok) {
        setActiveReservation(null)
        loadData()
      }
    } catch (error) {
      console.error('Varış hatası:', error)
    }
  }

  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'cheapest', label: 'En Ucuz' },
    { key: 'nearby', label: 'Yakın' },
    { key: 'available', label: 'Müsait' },
  ] as const

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-blue-600 hidden sm:block">Otoparkçım</span>
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Konum veya otopark ara..."
                className="w-full py-2.5 px-4 pl-10 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <Link href="/profile" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
          </Link>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Parking List */}
        <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 overflow-hidden flex flex-col">
          <ParkingList
            parkings={filteredParkings}
            selectedParking={selectedParking}
            onSelect={setSelectedParking}
          />
        </div>

        {/* Right Panel - Map */}
        <div className="hidden lg:flex flex-1 relative">
          <Map
            parkings={filteredParkings}
            selectedParking={selectedParking}
            userLocation={userLocation}
            onMarkerClick={setSelectedParking}
          />

          {/* Selected Parking Card on Map */}
          {selectedParking && !activeReservation && (
            <div className="absolute top-4 left-4 z-10">
              <ParkingCard
                parking={selectedParking}
                onClose={() => setSelectedParking(null)}
                onReservationSuccess={handleReservationSuccess}
              />
            </div>
          )}

          {/* Active Reservation */}
          {activeReservation && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <ActiveReservation
                reservation={activeReservation}
                onCancel={handleCancelReservation}
                onArrived={handleArrived}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Selected Parking Bottom Sheet */}
      {selectedParking && !activeReservation && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
          <ParkingCard
            parking={selectedParking}
            onClose={() => setSelectedParking(null)}
            onReservationSuccess={handleReservationSuccess}
          />
        </div>
      )}

      {/* Mobile: Active Reservation */}
      {activeReservation && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
          <ActiveReservation
            reservation={activeReservation}
            onCancel={handleCancelReservation}
            onArrived={handleArrived}
          />
        </div>
      )}
    </div>
  )
}