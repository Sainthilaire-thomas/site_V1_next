// src/lib/supabase-browser.ts
'use client'

import { createBrowserClient as createSupabaseClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

// Instance par défaut
export const supabaseBrowser = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ Export de la fonction pour créer de nouvelles instances
export function createBrowserClient() {
  console.log('🔑 Creating Supabase client...')
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log(
    '   Key (first 20 chars):',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
  )

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
