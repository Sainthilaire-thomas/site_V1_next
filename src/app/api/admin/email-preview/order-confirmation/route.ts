// src/app/api/email-preview/order-confirmation/route.ts
import { render } from '@react-email/render'
import { OrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { NextResponse } from 'next/server'

export async function GET() {
  // Props par défaut pour le preview
  const defaultProps = {
    orderNumber: 'BR-2025-0042',
    customerName: 'Marie',
    items: [
      {
        name: 'Robe longue noire',
        quantity: 1,
        price: 29500,
        imageUrl:
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      },
      {
        name: 'Sac à main cuir - Noir',
        quantity: 1,
        price: 18900,
        imageUrl:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      },
    ],
    subtotal: 48400,
    shipping: 0,
    total: 48400,
    shippingAddress: {
      line1: '123 rue de la Mode',
      line2: 'Appartement 4B',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
  }

  // Rendu du composant React en HTML
  const html = await render(OrderConfirmationEmail(defaultProps))

  // Retourner le HTML avec le bon Content-Type
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
