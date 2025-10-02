import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
// ✅ accepte SERVICE_ROLE_KEY ou SERVICE_KEY
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!URL || !SERVICE_KEY) {
  throw new Error('Supabase admin: env manquantes (URL / SERVICE_KEY)')
}

export const supabaseAdmin = createClient<Database>(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { headers: { 'X-Client-Info': 'admin-server' } },
})
