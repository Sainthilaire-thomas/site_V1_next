// src/app/account/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase-server'
import AccountSidebar from '@/components/account/AccountSidebar'
import HeaderMinimal from '@/components/layout/HeaderMinimal'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-white">
      <HeaderMinimal />

      <div className="max-w-[1920px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <AccountSidebar />

          {/* Contenu principal */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
