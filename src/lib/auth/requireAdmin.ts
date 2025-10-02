// src/lib/auth/requireAdmin.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export async function requireAdmin() {
  // ✅ Next 15 : cookies() est async
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ⚠️ En Server Component, on ne peut pas set/delete.
      // On fournit des no-ops pour satisfaire les types d'@supabase/ssr.
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return { ok: false as const, status: 401, message: 'Unauthorized' }

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (pErr) return { ok: false as const, status: 500, message: pErr.message }
  if (profile?.role !== 'admin')
    return { ok: false as const, status: 403, message: 'Forbidden' }

  return { ok: true as const, user, supabase }
}
