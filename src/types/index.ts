export interface Parking {
  id: string
  name: string
  slug?: string
  address: string
  district: string
  latitude: number
  longitude: number
  hourly_price: number
  status: 'available' | 'limited' | 'full'
  capacity?: number
  features?: string[]
  photos?: string[]
  rating?: number
  review_count?: number
  source?: string
  is_active?: boolean
  is_claimed?: boolean
  working_hours?: any
  price_ranges?: any[]
  created_at?: string
  category?: string       // ← VARSA KONTROL ET
  price_info?: string     // ← EKLE
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