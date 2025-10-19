// src/app/api/newsletter/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  // 🐛 DEBUG
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 NEWSLETTER CONFIRM ROUTE')
  console.log('Token reçu:', token)
  console.log('URL complète:', req.url)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!token) {
    console.log('❌ Token manquant')
    return NextResponse.redirect(
      new URL('/newsletter/confirmed?error=missing_token', req.url)
    )
  }

  try {
    // Décoder token
    console.log('🔓 Décodage du token...')
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    console.log('✅ Payload décodé:', payload)

    // Vérifier expiration
    const now = Date.now()
    console.log('⏰ Now:', now)
    console.log('⏰ Exp:', payload.exp)
    console.log('⏰ Différence (ms):', payload.exp - now)

    if (payload.exp < now) {
      console.log('❌ Token expiré')
      return NextResponse.redirect(
        new URL('/newsletter/confirmed?error=expired', req.url)
      )
    }

    console.log("✅ Token valide, activation de l'abonné...")

    // Activer l'abonné
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        status: 'active',
        consent_given_at: new Date().toISOString(),
      })
      .eq('email', payload.email)
      .eq('status', 'pending')
      .select()

    console.log('📊 Résultat update:', { data, error })

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.redirect(
        new URL('/newsletter/confirmed?error=database', req.url)
      )
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Aucun abonné trouvé ou déjà activé')
    }

    console.log('✅ Succès ! Redirection vers confirmation')

    // Rediriger vers page de confirmation
    return NextResponse.redirect(new URL('/newsletter/confirmed', req.url))
  } catch (error) {
    console.error('❌ Erreur parsing token:', error)
    return NextResponse.redirect(
      new URL('/newsletter/confirmed?error=invalid_token', req.url)
    )
  }
}
