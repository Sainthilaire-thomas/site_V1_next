// src/app/api/auth/logout/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.signOut()

  // Redirection vers la page de connexion
  return NextResponse.redirect(
    new URL(
      '/auth/login',
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    )
  )
}
