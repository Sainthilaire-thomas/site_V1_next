// src/app/api/newsletter/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL('/newsletter/confirmed?error=missing_token', req.url)
    )
  }

  try {
    // Décoder token
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))

    // Vérifier expiration
    if (payload.exp < Date.now()) {
      return NextResponse.redirect(
        new URL('/newsletter/confirmed?error=expired', req.url)
      )
    }

    // Activer l'abonné
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        status: 'active',
        consent_given_at: new Date().toISOString(),
      })
      .eq('email', payload.email)
      .eq('status', 'pending')

    if (error) {
      console.error('Confirm error:', error)
      return NextResponse.redirect(
        new URL('/newsletter/confirmed?error=database', req.url)
      )
    }

    // Rediriger vers page de confirmation
    return NextResponse.redirect(new URL('/newsletter/confirmed', req.url))
  } catch (error) {
    console.error('Token parsing error:', error)
    return NextResponse.redirect(
      new URL('/newsletter/confirmed?error=invalid_token', req.url)
    )
  }
}
