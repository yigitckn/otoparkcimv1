export interface Parking {
  id: string
  owner_id: string | null
  name: string
  slug: string
  address: string
  district: string
  latitude: number
  longitude: number
  hourly_price: number
  capacity: number
  status: 'available' | 'limited' | 'full'
  features: string[]
  is_active: boolean
  trust_score: number
  created_at: string
  rating?: number
  review_count?: number
  updated_at: string
  photos?: string[]
  price_ranges?: { min_hour: number; max_hour: number | null; price: number }[]
  working_hours?: { [key: string]: string }
  is_claimed?: boolean
  claimed_at?: string
  current_occupancy?: number
  source?: string
  external_id?: string
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