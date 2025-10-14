import { render } from '@react-email/render'
import { OrderDeliveredEmail } from '@/lib/email/order-delivered'
import { NextResponse } from 'next/server'

export async function GET() {
  const defaultProps = {
    orderNumber: 'BR-2025-0042',
    customerName: 'Marie',
    deliveredAt: 'mercredi 16 octobre à 14h32',
  }

  const html = await render(OrderDeliveredEmail(defaultProps))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
