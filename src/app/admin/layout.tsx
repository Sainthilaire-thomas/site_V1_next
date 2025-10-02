import type { ReactNode } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/database.types'
import { ThemeProvider } from '@/components/admin/ThemeProvider'
import { ThemeToggle } from '@/components/admin/ThemeToggle'
import { ToastProvider } from '@/components/admin/Toast'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (k) => cookieStore.get(k)?.value, set() {}, remove() {} },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return <div className="p-6">Accès refusé.</div>

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          <header className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div className="font-semibold">Admin</div>
            <ThemeToggle />
          </header>
          <main className="p-6">{children}</main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
