// src/app/api/admin/newsletter/campaigns/[id]/test/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { renderNewsletterPreview } from '@/lib/newsletter/render'
import { resend } from '@/lib/email/config' // ✅ Import corrigé
import { z } from 'zod'

const testEmailSchema = z.object({
  test_email: z.string().email('Email invalide'),
})

// ✅ Type pour le contenu de campagne
type CampaignContent = {
  hero_image_url?: string
  title: string
  subtitle?: string
  cta_text: string
  cta_link: string
  products: Array<{
    id: string
    position: number
  }>
}

/**
 * POST /api/admin/newsletter/campaigns/[id]/test
 * Envoyer un email de test pour prévisualiser la campagne
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { id: campaignId } = await params

    // 1. Vérifier auth admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // 2. Valider le body
    const body = await req.json()
    const { test_email } = testEmailSchema.parse(body)

    console.log(
      `📧 Sending test email for campaign ${campaignId} to ${test_email}`
    )

    // 3. Récupérer la campagne
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    // ✅ 4. Typage et validation du contenu
    if (!campaign.content) {
      return NextResponse.json(
        { error: "La campagne n'a pas de contenu défini" },
        { status: 400 }
      )
    }

    // Parser le contenu JSON si nécessaire
    const content: CampaignContent =
      typeof campaign.content === 'string'
        ? JSON.parse(campaign.content)
        : (campaign.content as CampaignContent)

    if (!content.products || content.products.length === 0) {
      return NextResponse.json(
        { error: "La campagne n'a pas de produits définis" },
        { status: 400 }
      )
    }

    // ✅ 5. Créer un objet campagne typé pour renderNewsletterPreview
    const typedCampaign = {
      ...campaign,
      content: content,
    }

    // 6. Générer le HTML de l'email
    console.log('🎨 Rendering email HTML...')
    const html = await renderNewsletterPreview(typedCampaign as any, test_email)

    console.log('✅ HTML rendered, sending via Resend...')

    // 7. Envoyer via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'newsletter@blancherenaudin.com',
      to: test_email,
      subject: `[TEST] ${campaign.subject}`,
      html: html,
      headers: {
        'X-Campaign-ID': campaign.id,
        'X-Campaign-Name': campaign.name,
        'X-Test-Email': 'true',
      },
    })

    if (emailError) {
      console.error('❌ Resend error:', emailError)
      throw emailError
    }

    console.log('✅ Test email sent successfully:', emailData?.id)

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé à ${test_email}`,
      email_id: emailData?.id,
    })
  } catch (error) {
    console.error('❌ POST /test error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email de test" },
      { status: 500 }
    )
  }
}
