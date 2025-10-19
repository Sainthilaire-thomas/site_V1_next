// src/app/api/admin/newsletter/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  createCampaignSchema,
  type CreateCampaignInput,
} from '@/lib/newsletter/validation'
import {
  generateUtmCampaign,
  isUtmCampaignUnique,
  generateUtmCampaignWithVersion,
} from '@/lib/newsletter/utils'
import { z } from 'zod'

/**
 * POST /api/admin/newsletter/campaigns
 * Créer une nouvelle campagne newsletter
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()

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
    const validatedData: CreateCampaignInput = createCampaignSchema.parse(body)

    // 3. Générer utm_campaign unique
    let utmCampaign = generateUtmCampaign(validatedData.name)

    // Vérifier unicité et ajouter version si conflit
    let isUnique = await isUtmCampaignUnique(supabaseAdmin, utmCampaign)
    let version = 2

    while (!isUnique) {
      utmCampaign = generateUtmCampaignWithVersion(
        generateUtmCampaign(validatedData.name),
        version
      )
      isUnique = await isUtmCampaignUnique(supabaseAdmin, utmCampaign)
      version++

      // Sécurité : éviter boucle infinie
      if (version > 10) {
        return NextResponse.json(
          {
            error: 'Trop de campagnes avec ce nom ce mois-ci. Changez le nom.',
          },
          { status: 409 }
        )
      }
    }

    console.log('✅ Generated unique UTM campaign:', utmCampaign)

    // 4. Créer la campagne en DB
    const { data: campaign, error: insertError } = await supabaseAdmin
      .from('newsletter_campaigns')
      .insert({
        name: validatedData.name,
        subject: validatedData.subject,
        preview_text: validatedData.preview_text || null,
        content: validatedData.content,
        utm_campaign: utmCampaign,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert campaign error:', insertError)
      throw insertError
    }

    console.log('✅ Campaign created:', campaign.id)

    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          subject: campaign.subject,
          utm_campaign: campaign.utm_campaign,
          status: campaign.status,
          created_at: campaign.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ POST /campaigns error:', error)

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
      { error: 'Erreur lors de la création de la campagne' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/newsletter/campaigns
 * Lister toutes les campagnes (avec pagination et filtres)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()

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

    // 2. Parser query params
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') // 'draft', 'sent', 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') // Recherche par nom/sujet

    // 3. Construire la query
    let query = supabaseAdmin
      .from('newsletter_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtrer par status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Recherche textuelle
    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    const { data: campaigns, error, count } = await query

    if (error) {
      console.error('❌ Fetch campaigns error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaigns || [],
        total: count || 0,
        limit,
        offset,
        has_more: count ? offset + limit < count : false,
      },
    })
  } catch (error) {
    console.error('❌ GET /campaigns error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des campagnes' },
      { status: 500 }
    )
  }
}
