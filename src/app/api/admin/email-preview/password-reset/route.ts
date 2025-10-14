import { render } from '@react-email/render'
import { PasswordResetEmail } from '@/lib/email/password-reset'
import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const defaultProps = {
    resetUrl: `${baseUrl}/auth/reset-password?token=example-token-12345`,
    expiresIn: '1 heure',
  }

  const html = await render(PasswordResetEmail(defaultProps))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
