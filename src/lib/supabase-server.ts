// src/lib/supabase-server.ts
import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from '@supabase/ssr'
import type { Database } from './database.types'
import { cookies } from "next/headers";

// ✅ Fonction principale (votre code existant)
export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ nouvelle API attendue par @supabase/ssr
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({
                name,
                value,
                ...(options as CookieOptions | undefined),
              })
            })
          } catch {
            // Appelé depuis un Server Component pur -> on ne peut pas écrire des cookies ici, c'est OK.
          }
        },
      },
    }
  )
}

// ✅ Alias pour l'API analytics (même fonction, nom différent)
export const createServerClient = getServerSupabase;
