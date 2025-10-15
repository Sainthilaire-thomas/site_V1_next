// src/app/api/launch-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, cartItems, cartTotal } = body

    const supabase = await getServerSupabase()

    // Enregistrer la notification dans Supabase
    const { data, error } = await supabase
      .from('launch_notifications')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        cart_items: cartItems,
        cart_total: cartTotal,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save notification request' },
        { status: 500 }
      )
    }

    // TODO: Envoyer un email de confirmation au client
    // TODO: Envoyer une notification à l'admin

    return NextResponse.json({
      success: true,
      message: 'Notification request saved successfully',
      id: data.id,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET pour récupérer les notifications (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerSupabase()

    // Vérifier que l'utilisateur est admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Récupérer toutes les notifications
    const { data: notifications, error } = await supabase
      .from('launch_notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notifications })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
