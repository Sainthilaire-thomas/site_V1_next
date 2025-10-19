// src/app/api/admin/social/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET : Récupérer un post spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params // ✅ AWAIT params

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

    // Récupérer le post avec ses performances
    const { data: post, error } = await supabase
      .from('social_posts_performance')
      .select('*')
      .eq('id', id) // ✅ Utiliser id déstructuré
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    console.error('Error in GET /api/admin/social/posts/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH : Mettre à jour un post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params // ✅ AWAIT params

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

    // Mettre à jour le post
    const { data: post, error } = await supabase
      .from('social_posts')
      .update({
        post_type: body.post_type,
        account_type: body.account_type,
        account_handle: body.account_handle,
        caption: body.caption,
        image_url: body.image_url,
        post_url: body.post_url,
        utm_campaign: body.utm_campaign,
        tracking_link: body.tracking_link,
        featured_product_ids: body.featured_product_ids,
        impressions: body.impressions,
        reach: body.reach,
        likes: body.likes,
        comments: body.comments,
        shares: body.shares,
        saves: body.saves,
        published_at: body.published_at,
      })
      .eq('id', id) // ✅ Utiliser id déstructuré
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/social/posts/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE : Supprimer un post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<>
) {
  try {
    const supabase = await createServerClient()
    const { id } = await params // ✅ AWAIT params

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

    // Supprimer le post
    const { error } = await supabase.from('social_posts').delete().eq('id', id) // ✅ Utiliser id déstructuré

    if (error) {
      console.error('Error deleting post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/social/posts/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
