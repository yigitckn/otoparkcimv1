import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('URL:', url)
    console.error('KEY:', key)
    throw new Error('Supabase credentials missing')
  }
  
  return supabaseCreateClient(url, key)
}