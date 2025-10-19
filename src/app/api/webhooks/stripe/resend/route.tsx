// src/app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Webhook } from 'svix'

export const runtime = 'nodejs'

/**
 * Webhook handler pour les événements Resend
 * Documentation: https://resend.com/docs/dashboard/webhooks/introduction
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier la signature Resend
    const payload = await req.text()
    const headers = {
      'svix-id': req.headers.get('svix-id') || '',
      'svix-timestamp': req.headers.get('svix-timestamp') || '',
      'svix-signature': req.headers.get('svix-signature') || '',
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ RESEND_WEBHOOK_SECRET manquant')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Vérifier la signature avec Svix
    const wh = new Webhook(webhookSecret)
    let event: any

    try {
      event = wh.verify(payload, headers)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('🔔 Resend webhook event:', event.type)

    // 2. Récupérer le newsletter_send via resend_email_id
    const emailId = event.data.email_id
    if (!emailId) {
      console.warn('⚠️ No email_id in webhook payload')
      return NextResponse.json({ received: true })
    }

    const { data: send } = await supabaseAdmin
      .from('newsletter_sends')
      .select('id, campaign_id, subscriber_id')
      .eq('resend_email_id', emailId)
      .single()

    if (!send) {
      console.warn('⚠️ Send not found for email_id:', emailId)
      return NextResponse.json({ received: true })
    }

    // 3. Traiter selon le type d'événement
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(send)
        break

      case 'email.delivered':
        await handleEmailDelivered(send)
        break

      case 'email.opened':
        await handleEmailOpened(send)
        break

      case 'email.clicked':
        await handleEmailClicked(send, event.data)
        break

      case 'email.bounced':
        await handleEmailBounced(send, event.data)
        break

      case 'email.complained':
        await handleEmailComplained(send)
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// Handlers pour chaque type d'événement
// ============================================

async function handleEmailSent(send: any) {
  console.log('📤 Email sent:', send.id)

  await supabaseAdmin
    .from('newsletter_sends')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', send.id)
}

async function handleEmailDelivered(send: any) {
  console.log('✅ Email delivered:', send.id)

  // Mettre à jour le send
  await supabaseAdmin
    .from('newsletter_sends')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', send.id)

  // Incrémenter le compteur de la campagne
  await supabaseAdmin.rpc('increment_campaign_counter', {
    p_campaign_id: send.campaign_id,
    p_counter: 'delivered',
  })
}

async function handleEmailOpened(send: any) {
  console.log('👁️ Email opened:', send.id)

  // Récupérer l'état actuel
  const { data: currentSend } = await supabaseAdmin
    .from('newsletter_sends')
    .select('first_opened_at, opens_count')
    .eq('id', send.id)
    .single()

  const isFirstOpen = !currentSend?.first_opened_at

  // Mettre à jour le send
  await supabaseAdmin
    .from('newsletter_sends')
    .update({
      status: 'opened',
      first_opened_at: currentSend?.first_opened_at || new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      opens_count: (currentSend?.opens_count || 0) + 1,
    })
    .eq('id', send.id)

  // Incrémenter uniquement si première ouverture
  if (isFirstOpen) {
    await supabaseAdmin.rpc('increment_campaign_counter', {
      p_campaign_id: send.campaign_id,
      p_counter: 'opened',
    })
  }

  // Mettre à jour le subscriber
  await supabaseAdmin.rpc('increment_subscriber_counter', {
    p_subscriber_id: send.subscriber_id,
    p_counter: 'total_opens',
  })

  await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', send.subscriber_id)
}

async function handleEmailClicked(send: any, eventData: any) {
  console.log('🖱️ Email clicked:', send.id)

  // Récupérer l'état actuel
  const { data: currentSend } = await supabaseAdmin
    .from('newsletter_sends')
    .select('first_clicked_at, clicks_count')
    .eq('id', send.id)
    .single()

  const isFirstClick = !currentSend?.first_clicked_at

  // Mettre à jour le send
  await supabaseAdmin
    .from('newsletter_sends')
    .update({
      status: 'clicked',
      first_clicked_at:
        currentSend?.first_clicked_at || new Date().toISOString(),
      last_clicked_at: new Date().toISOString(),
      clicks_count: (currentSend?.clicks_count || 0) + 1,
    })
    .eq('id', send.id)

  // Enregistrer le clic
  if (eventData.link) {
    await supabaseAdmin.from('newsletter_clicks').insert({
      send_id: send.id,
      link_url: eventData.link,
      clicked_at: new Date().toISOString(),
    })
  }

  // Incrémenter uniquement si premier clic
  if (isFirstClick) {
    await supabaseAdmin.rpc('increment_campaign_counter', {
      p_campaign_id: send.campaign_id,
      p_counter: 'clicked',
    })
  }

  // Mettre à jour le subscriber
  await supabaseAdmin.rpc('increment_subscriber_counter', {
    p_subscriber_id: send.subscriber_id,
    p_counter: 'total_clicks',
  })

  await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ last_clicked_at: new Date().toISOString() })
    .eq('id', send.subscriber_id)
}

async function handleEmailBounced(send: any, eventData: any) {
  console.log('⚠️ Email bounced:', send.id)

  await supabaseAdmin
    .from('newsletter_sends')
    .update({
      status: 'bounced',
      bounce_reason: eventData.reason || 'Unknown',
    })
    .eq('id', send.id)

  await supabaseAdmin.rpc('increment_campaign_counter', {
    p_campaign_id: send.campaign_id,
    p_counter: 'bounced',
  })

  // Marquer le subscriber comme bounced
  await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ status: 'bounced' })
    .eq('id', send.subscriber_id)
}

async function handleEmailComplained(send: any) {
  console.log('🚫 Email complained:', send.id)

  await supabaseAdmin
    .from('newsletter_sends')
    .update({ status: 'complained' })
    .eq('id', send.id)

  await supabaseAdmin.rpc('increment_campaign_counter', {
    p_campaign_id: send.campaign_id,
    p_counter: 'complained',
  })

  await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ status: 'complained' })
    .eq('id', send.subscriber_id)
}
