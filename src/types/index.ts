export interface Parking {
  id: string
  owner_id: string
  name: string
  address: string
  district: string
  latitude: number
  longitude: number
  hourly_price: number
  total_capacity: number
  current_occupancy: number
  status: 'available' | 'limited' | 'full'
  features: string[]
  trust_score: number
  is_active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  user_id: string
  parking_id: string
  status: 'active' | 'completed' | 'cancelled' | 'no_show'
  created_at: string
  expires_at: string
  arrived_at?: string
  parking?: Parking
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'user' | 'owner'
  no_show_count: number
  restricted_until?: string
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  parking_id: string
  reservation_id: string
  rating: number
  comment?: string
  created_at: string
}