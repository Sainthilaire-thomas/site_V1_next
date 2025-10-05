// src/lib/email/send.ts
import type { Database } from '@/lib/database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']

interface OrderWithItems extends Order {
  items?: OrderItem[]
}

// Note: Pour l'instant, retournons juste le HTML
// L'envoi réel sera implémenté plus tard avec Resend ou SendGrid
export async function sendOrderConfirmation(order: OrderWithItems) {
  const { OrderConfirmationEmail } = await import('./order-confirmation')
  const html = OrderConfirmationEmail({ order })

  // TODO: Implémenter l'envoi avec Resend/SendGrid
  console.log('Email à envoyer:', {
    to: order.customer_email,
    subject: `Confirmation de commande ${order.order_number}`,
    html,
  })

  return { success: true }
}

export async function sendOrderShipped(order: OrderWithItems) {
  // TODO: Implémenter
  console.log('Email expédition à envoyer')
  return { success: true }
}
