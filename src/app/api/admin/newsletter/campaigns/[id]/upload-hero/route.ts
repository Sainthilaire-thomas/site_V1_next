// src/app/api/admin/newsletter/campaigns/[id]/upload-hero/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { uploadNewsletterHeroImage } from '@/lib/newsletter/images'

/**
 * POST /api/admin/newsletter/campaigns/[id]/upload-hero
 * Upload l'image hero d'une campagne et génère les variantes
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

    // 2. Vérifier que la campagne existe
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('id, name, content, status')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    // 3. Vérifier que la campagne est en draft
    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Impossible de modifier une campagne déjà envoyée' },
        { status: 400 }
      )
    }

    // 4. Récupérer le fichier depuis FormData
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // 5. Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // 6. Valider la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10MB)' },
        { status: 400 }
      )
    }

    console.log(`📸 Uploading hero image for campaign ${campaignId}...`)
    console.log(
      `   File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    )

    // 7. Upload et génération des variantes
    const result = await uploadNewsletterHeroImage(campaignId, file)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload échoué' },
        { status: 500 }
      )
    }

    console.log('✅ Hero image uploaded:', result.image_id)
    console.log('✅ Variants generated')

    // 8. Mettre à jour le content de la campagne avec la nouvelle URL
    const updatedContent = {
      ...(campaign.content as any),
      hero_image_url: result.urls!.xl_jpg, // URL principale (JPEG XL en fallback)
      hero_image_id: result.image_id,
      hero_variants: result.urls, // Toutes les variantes disponibles
    }

    const { error: updateError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .update({ content: updatedContent })
      .eq('id', campaignId)

    if (updateError) {
      console.error('❌ Update campaign content error:', updateError)
      throw updateError
    }

    console.log('✅ Campaign content updated with hero image URLs')

    return NextResponse.json({
      success: true,
      image_id: result.image_id,
      urls: result.urls,
      message: 'Image hero uploadée avec succès',
    })
  } catch (error) {
    console.error('❌ POST /upload-hero error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    )
  }
}
