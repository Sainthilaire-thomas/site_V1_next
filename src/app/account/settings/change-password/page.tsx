// src/app/account/settings/change-password/page.tsx
import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase-server'
import ChangePasswordForm from './ChangePasswordForm'

export default async function ChangePasswordPage() {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-light tracking-tight text-black mb-2">
          Changer le mot de passe
        </h1>
        <p className="text-[13px] text-grey-medium">
          Modifiez votre mot de passe pour sécuriser votre compte
        </p>
      </div>

      <div className="max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
