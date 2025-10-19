// src/app/api/admin/newsletter/campaigns/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  updateCampaignSchema,
  type UpdateCampaignInput,
} from '@/lib/newsletter/validation'
import {
  generateUtmCampaign,
  isUtmCampaignUnique,
  generateUtmCampaignWithVersion,
} from '@/lib/newsletter/utils'
import { deleteNewsletterCampaignImages } from '@/lib/newsletter/images'
import { z } from 'zod'

/**
 * GET /api/admin/newsletter/campaigns/[id]
 * Récupérer une campagne spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    const supabase = await createServerClient()
    const { id: campaignId } = await params // ✅ AWAIT params

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

    // 2. Récupérer la campagne
    const { data: campaign, error } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error || !campaign) {
      console.error('❌ Campaign not found:', campaignId)
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    console.log('✅ Campaign fetched:', campaign.id)

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error) {
    console.error('❌ GET /campaigns/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la campagne' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/newsletter/campaigns/[id]
 * Modifier une campagne existante
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    const supabase = await createServerClient()
    const { id: campaignId } = await params // ✅ AWAIT params

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
    const { data: existingCampaign, error: fetchError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('id, name, status, utm_campaign')
      .eq('id', campaignId)
      .single()

    if (fetchError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    // 3. Vérifier que la campagne n'est pas déjà envoyée
    if (existingCampaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Impossible de modifier une campagne déjà envoyée' },
        { status: 400 }
      )
    }

    // 4. Valider le body
    const body = await req.json()
    const validatedData: UpdateCampaignInput = updateCampaignSchema.parse(body)

    // 5. Préparer les données à mettre à jour
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Si le nom change, régénérer utm_campaign
    if (validatedData.name && validatedData.name !== existingCampaign.name) {
      let newUtmCampaign = generateUtmCampaign(validatedData.name)

      // Vérifier unicité (en excluant la campagne actuelle)
      let isUnique = await isUtmCampaignUnique(
        supabaseAdmin,
        newUtmCampaign,
        campaignId
      )

      let version = 2
      while (!isUnique) {
        newUtmCampaign = generateUtmCampaignWithVersion(
          generateUtmCampaign(validatedData.name),
          version
        )
        isUnique = await isUtmCampaignUnique(
          supabaseAdmin,
          newUtmCampaign,
          campaignId
        )
        version++

        if (version > 10) {
          return NextResponse.json(
            {
              error:
                'Trop de campagnes avec ce nom ce mois-ci. Changez le nom.',
            },
            { status: 409 }
          )
        }
      }

      updateData.utm_campaign = newUtmCampaign
      updateData.name = validatedData.name
      console.log('✅ UTM campaign updated:', newUtmCampaign)
    }

    // Ajouter les autres champs modifiés
    if (validatedData.subject !== undefined) {
      updateData.subject = validatedData.subject
    }
    if (validatedData.preview_text !== undefined) {
      updateData.preview_text = validatedData.preview_text
    }
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content
    }

    // 6. Mettre à jour en DB
    const { data: updatedCampaign, error: updateError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update campaign error:', updateError)
      throw updateError
    }

    console.log('✅ Campaign updated:', updatedCampaign.id)

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: 'Campagne mise à jour avec succès',
    })
  } catch (error) {
    console.error('❌ PATCH /campaigns/[id] error:', error)

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
      { error: 'Erreur lors de la mise à jour de la campagne' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/newsletter/campaigns/[id]
 * Supprimer une campagne
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    const supabase = await createServerClient()
    const { id: campaignId } = await params // ✅ AWAIT params

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
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('id, name, status')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    // 3. Vérifier que la campagne n'est pas déjà envoyée
    if (campaign.status === 'sent') {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une campagne envoyée. Vous pouvez l'archiver à la place.",
        },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting campaign: ${campaign.name} (${campaign.id})`)

    // 4. Supprimer les images associées du storage
    console.log('📸 Deleting campaign images from storage...')
    const imageDeleteResult = await deleteNewsletterCampaignImages(campaignId)

    if (!imageDeleteResult.success) {
      console.error(
        '⚠️ Warning: Failed to delete some images:',
        imageDeleteResult.error
      )
      // On continue quand même la suppression de la campagne
    } else {
      console.log('✅ Campaign images deleted')
    }

    // 5. Supprimer la campagne de la DB
    // Les newsletter_sends et newsletter_clicks sont supprimés en cascade
    const { error: deleteError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .delete()
      .eq('id', campaignId)

    if (deleteError) {
      console.error('❌ Delete campaign error:', deleteError)
      throw deleteError
    }

    console.log('✅ Campaign deleted from database')

    return NextResponse.json({
      success: true,
      message: `Campagne "${campaign.name}" supprimée avec succès`,
    })
  } catch (error) {
    console.error('❌ DELETE /campaigns/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la campagne' },
      { status: 500 }
    )
  }
}
