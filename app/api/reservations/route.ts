import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ reservation: null })
  }

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, parking:parkings(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return NextResponse.json({ reservation })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Giris yapmaniz gerekiyor' }, { status: 401 })
  }

  const { parking_id } = await request.json()

  const { data: existingRes } = await supabase
    .from('reservations')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (existingRes) {
    return NextResponse.json({ error: 'Zaten aktif rezervasyonunuz var' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user.id,
      parking_id,
      status: 'active',
      expires_at: expiresAt
    })
    .select('*, parking:parkings(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Rezervasyon olusturulamadi' }, { status: 500 })
  }

  return NextResponse.json({ reservation })
}