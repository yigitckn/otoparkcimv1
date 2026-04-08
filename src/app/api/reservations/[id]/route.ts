import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Giris yapmaniz gerekiyor' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('reservations')
    .update(body)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Guncelleme basarisiz' }, { status: 500 })
  }

  return NextResponse.json({ reservation: data })
}