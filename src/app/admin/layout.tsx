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

  // ✅ MODIFIER : Redirection vers /admin/login au lieu de /auth/login
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // ✅ AMÉLIORER : Meilleur message d'erreur si non-admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
        <div className="max-w-md text-center space-y-6 p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800">
          {/* Icône */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Accès refusé
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vous devez être administrateur pour accéder à cette section.
            </p>
          </div>

          {/* Informations utilisateur */}
          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              Connecté en tant que :
            </div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {user.email}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Rôle :{' '}
              <span className="font-mono">{profile?.role || 'customer'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/account"
              className="inline-block px-6 py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors font-medium"
            >
              Aller à mon compte client
            </Link>

            <Link
              href="/admin/login"
              className="inline-block px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Se connecter en tant qu'admin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Layout admin normal si l'utilisateur est bien admin
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
