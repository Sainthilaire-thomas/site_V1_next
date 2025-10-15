import type { Metadata } from "next";
import Script from 'next/script'
import { Archivo_Black, Archivo_Narrow } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

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
        {children}

        <Analytics />
        <SpeedInsights />

        {/* Google Analytics - Implémentation manuelle */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KFPKFQ45J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KFPKFQ45J');
          `}
        </Script>
      </body>
    </html>
  )
}
