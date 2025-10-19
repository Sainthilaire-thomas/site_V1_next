// src/app/api/admin/email-preview/newsletter-confirmation/route.ts
import { render } from '@react-email/render'
import NewsletterConfirmation from '@/lib/email/newsletter-confirmation'
import { NextResponse } from 'next/server'

export async function GET() {
  const defaultProps = {
    firstName: 'thomas',
    confirmUrl:
      'https://www.blancherenaudin.com/api/newsletter/confirm?token=DEMO_TOKEN_123456',
  }

  const html = await render(NewsletterConfirmation(defaultProps))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
