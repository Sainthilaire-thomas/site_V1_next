// src/app/api/admin/social/posts/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET : Liste des posts
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient() // ✅ AWAIT ajouté

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Récupérer les paramètres de requête
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const accountType = searchParams.get('account_type')
    const postType = searchParams.get('post_type')

    // Construire la requête
    let query = supabase
      .from('social_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (accountType) {
      query = query.eq('account_type', accountType)
    }

    if (postType) {
      query = query.eq('post_type', postType)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, posts })
  } catch (error: any) {
    console.error('Error in GET /api/admin/social/posts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST : Créer un nouveau post
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient() // ✅ AWAIT ajouté

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Validation des champs requis
    if (
      !body.post_type ||
      !body.account_type ||
      !body.utm_campaign ||
      !body.published_at
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insérer le post
    const { data: post, error } = await supabase
      .from('social_posts')
      .insert({
        post_type: body.post_type,
        account_type: body.account_type,
        account_handle: body.account_handle || '@blancherenaudin',
        caption: body.caption || null,
        image_url: body.image_url || null,
        post_url: body.post_url || null,
        utm_campaign: body.utm_campaign,
        tracking_link: body.tracking_link || null,
        featured_product_ids: body.featured_product_ids || null,
        impressions: body.impressions || 0,
        reach: body.reach || 0,
        likes: body.likes || 0,
        comments: body.comments || 0,
        shares: body.shares || 0,
        saves: body.saves || 0,
        published_at: body.published_at,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/admin/social/posts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
