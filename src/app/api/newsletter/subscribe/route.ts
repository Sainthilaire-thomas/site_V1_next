// src/app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/email/send'
import { z } from 'zod'
import NewsletterConfirmation from '@/lib/email/newsletter-confirmation'

const subscribeSchema = z.object({
  email: z.string().email('Email invalide'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = subscribeSchema.parse(body)

    // Vérifier si email existe déjà
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', data.email)
      .single()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà inscrit' },
          { status: 409 }
        )
      }

      // Réactiver si désabonné
      if (existing.status === 'unsubscribed') {
        await supabaseAdmin
          .from('newsletter_subscribers')
          .update({ status: 'pending', unsubscribed_at: null })
          .eq('id', existing.id)
      }
    } else {
      // Créer nouvel abonné
      const { error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          status: 'pending',
          consent_ip: req.headers.get('x-forwarded-for') || null,
          consent_source: 'website_footer',
        })

      if (error) throw error
    }

    // Générer token de confirmation
    const confirmToken = Buffer.from(
      JSON.stringify({
        email: data.email,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
      })
    ).toString('base64')

    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.blancherenaudin.com'}/newsletter/confirm?token=${confirmToken}`

    // Envoyer email de confirmation
    await sendEmail({
      to: data.email,
      subject: 'Confirmez votre inscription à la newsletter',
      from: 'newsletter@blancherenaudin.com',
      react: NewsletterConfirmation({
        firstName: data.first_name,
        confirmUrl,
      }),
    })

    return NextResponse.json({
      success: true,
      message: `Email de confirmation envoyé à ${data.email}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Subscribe error:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}
