// ============================================
// src/app/account/settings/page.tsx
// ============================================
import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase-server'

export default async function SettingsPage() {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="space-y-8">
      <h1 className="text-[32px] font-light tracking-tight text-black">
        Paramètres
      </h1>

      <div className="space-y-6">
        <div className="border border-grey-light p-6">
          <h2 className="text-[18px] font-light text-black mb-4">
            Informations du compte
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] tracking-[0.1em] uppercase text-grey-medium">
                Email
              </label>
              <p className="text-[15px] text-black mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="border border-grey-light p-6">
          <h2 className="text-[18px] font-light text-black mb-4">Sécurité</h2>

          <button className="text-[13px] tracking-[0.05em] font-semibold lowercase text-black hover:text-grey-medium transition-colors">
            Changer le mot de passe →
          </button>
        </div>
      </div>
    </div>
  )
}
