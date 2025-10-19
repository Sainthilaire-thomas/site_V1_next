// src/app/api/admin/orders/[id]/mark-delivered/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { sendOrderDeliveredEmail } from '@/lib/email/send'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: orderId } = await params

    // Récupérer les informations de la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_number, customer_email, customer_name, user_id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que la commande est bien expédiée
    if (order.status !== 'shipped') {
      return NextResponse.json(
        {
          error:
            "La commande doit être expédiée avant d'être marquée comme livrée",
        },
        { status: 400 }
      )
    }

    // Récupérer le prénom du client
    let customerFirstName = 'Client'

    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', order.user_id)
        .single()

      customerFirstName = profile?.first_name || order.customer_name || 'Client'
    } else if (order.customer_name) {
      customerFirstName = order.customer_name.split(' ')[0] || 'Client'
    }

    // Mettre à jour la commande
    const deliveredAt = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: deliveredAt,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Erreur mise à jour commande:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la commande' },
        { status: 500 }
      )
    }

    // Vérifier que customer_email existe
    if (!order.customer_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun email client trouvé pour cette commande',
        },
        { status: 400 }
      )
    }

    // Envoyer l'email de livraison
    try {
      await sendOrderDeliveredEmail(order.customer_email, {
        orderNumber: order.order_number,
        customerName: customerFirstName,
        deliveredAt: new Date(deliveredAt).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })

      return NextResponse.json({
        success: true,
        message: 'Commande marquée comme livrée et email envoyé',
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
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
