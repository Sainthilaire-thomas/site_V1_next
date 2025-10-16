'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ThemeProvider } from '@/components/admin/ThemeProvider'
import { ToastProvider } from '@/components/admin/Toast'
import { Breadcrumb } from '@/components/admin/Breadcrumb'
import { QuickActions } from '@/components/admin/QuickActions'
import { AdminNav } from '@/components/admin/AdminNav'
import { ThemeToggle } from '@/components/admin/ThemeToggle'

export function AdminClientWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          {/* Header avec navigation */}
          <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                {/* Logo / Titre */}
                <Link
                  href="/admin"
                  className="font-semibold text-lg hover:text-violet transition-colors"
                >
                  Admin
                </Link>

                {/* Navigation principale */}
                <AdminNav />

                {/* Actions de droite */}
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <Link
                    href="/"
                    className="text-sm hover:text-violet transition-colors hidden sm:block"
                    target="_blank"
                  >
                    Voir le site →
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu */}
          <main className="container mx-auto px-4 py-6">
            <Breadcrumb />
            <QuickActions />
            {children}
          </main>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
