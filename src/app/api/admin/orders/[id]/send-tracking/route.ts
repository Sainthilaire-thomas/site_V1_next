// src/app/api/admin/orders/[id]/send-tracking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { sendOrderShippedEmail } from '@/lib/email/send'
import { z } from 'zod'

// Schéma de validation
const trackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Numéro de suivi requis'),
  carrier: z.string().min(1, 'Transporteur requis'),
  trackingUrl: z.string().url('URL de suivi invalide'),
  estimatedDelivery: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier les permissions admin
    const adminCheck = await requireAdmin()

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.message || 'Non autorisé' },
        { status: adminCheck.status }
      )
    }

    const supabase = adminCheck.supabase
    const orderId = params.id
    const body = await request.json()

    // Valider les données
    const validatedData = trackingSchema.parse(body)

    // ✅ Récupérer les informations de la commande SANS la relation profiles
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_number, customer_email, customer_name, user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // ✅ Récupérer le profil séparément si user_id existe
    let customerFirstName = 'Client'

    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', order.user_id)
        .single()

      customerFirstName = profile?.first_name || order.customer_name || 'Client'
    } else if (order.customer_name) {
      // Si pas d'user_id, utiliser customer_name de la commande
      customerFirstName = order.customer_name.split(' ')[0] || 'Client'
    }

    // Mettre à jour la commande avec les infos de tracking
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number: validatedData.trackingNumber,
        carrier: validatedData.carrier,
        tracking_url: validatedData.trackingUrl,
        status: 'shipped',
        shipped_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Erreur mise à jour commande:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la commande' },
        { status: 500 }
      )
    }

    // ✅ Vérifier que customer_email existe
    if (!order.customer_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun email client trouvé pour cette commande',
        },
        { status: 400 }
      )
    }

    // Envoyer l'email
    try {
      await sendOrderShippedEmail(order.customer_email, {
        orderNumber: order.order_number,
        customerName: customerFirstName,
        trackingNumber: validatedData.trackingNumber,
        carrier: validatedData.carrier,
        trackingUrl: validatedData.trackingUrl,
        estimatedDelivery: validatedData.estimatedDelivery,
      })

      return NextResponse.json({
        success: true,
        message: 'Email de tracking envoyé avec succès',
      })
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)

      // La commande a été mise à jour mais l'email a échoué
      return NextResponse.json(
        {
          success: false,
          error: "Commande mise à jour mais échec de l'envoi de l'email",
          details:
            emailError instanceof Error
              ? emailError.message
              : 'Erreur inconnue',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
