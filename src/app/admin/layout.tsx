// src/app/admin/layout.tsx
import type { ReactNode } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/database.types'
import { ToastProvider } from '@/components/admin/Toast'
import { Breadcrumb } from '@/components/admin/Breadcrumb'
import { QuickActions } from '@/components/admin/QuickActions'
import { AdminNav } from '@/components/admin/AdminNav'
import { ThemeToggle } from '@/components/admin/ThemeToggle'
import Link from 'next/link'

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
    <ToastProvider>
      {/* Container principal avec dark mode */}
      <div className="min-h-screen bg-white dark:bg-slate-950 text-black dark:text-white">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/admin"
                className="font-semibold text-lg text-gray-900 dark:text-gray-100 hover:text-violet dark:hover:text-violet transition-colors"
              >
                Admin
              </Link>

              <AdminNav />

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-violet dark:hover:text-violet transition-colors hidden sm:block"
                  target="_blank"
                >
                  Voir le site →
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-6">
          <Breadcrumb />
          <QuickActions />
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
