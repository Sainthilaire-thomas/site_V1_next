// src/app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { Archivo_Black, Archivo_Narrow } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker'

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

const archivoNarrow = Archivo_Narrow({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-archivo-narrow',
  display: 'swap',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: '.blancherenaudin',
  description: "Mode contemporaine & savoir-faire d'exception",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${archivoBlack.variable} ${archivoNarrow.variable} antialiased`}
      >
        {/* 📊 Tracking automatique des pages vues - WRAPPED IN SUSPENSE */}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>

        {/* ✅ NOUVEAU : Wrapper les children dans Suspense */}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
              <div className="text-sm text-gray-400 animate-pulse">
                loading...
              </div>
            </div>
          }
        >
          {children}
        </Suspense>

        {/* Vercel Analytics (garde pour la perf) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
