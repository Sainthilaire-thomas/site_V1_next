import { render } from '@react-email/render'
import { OrderShippedEmail } from '@/lib/email/order-shipped'
import { NextResponse } from 'next/server'

export async function GET() {
  const defaultProps = {
    orderNumber: 'BR-2025-0042',
    customerName: 'Marie',
    trackingNumber: '3SBRCP00012345',
    carrier: 'Colissimo',
    trackingUrl:
      'https://www.laposte.fr/outils/suivre-vos-envois?code=3SBRCP00012345',
    estimatedDelivery: 'mercredi 16 octobre',
  }

  const html = await render(OrderShippedEmail(defaultProps))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
