import { NextRequest, NextResponse } from 'next/server'
import { sendOrderShippedEmail } from '@/lib/email/send'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    await sendOrderShippedEmail(email, {
      orderNumber: 'BR-TEST-001',
      customerName: 'Marie',
      trackingNumber: '3SBRCP00012345',
      carrier: 'Colissimo',
      trackingUrl:
        'https://www.laposte.fr/outils/suivre-vos-envois?code=3SBRCP00012345',
      estimatedDelivery: 'mercredi 16 octobre',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
