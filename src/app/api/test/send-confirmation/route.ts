import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/email/send'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Données de test
    const testData = {
      orderNumber: 'BR-TEST-001',
      customerName: 'Marie',
      items: [
        {
          name: 'Robe longue noire',
          quantity: 1,
          price: 29500,
        },
        {
          name: 'Sac en cuir',
          quantity: 1,
          price: 19900,
        },
      ],
      subtotal: 49400,
      shipping: 0,
      total: 49400,
      shippingAddress: {
        line1: '123 rue de la Mode',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
      },
    }

    await sendOrderConfirmationEmail(email, testData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 }
    )
  }
}
