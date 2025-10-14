import { render } from '@react-email/render'
import { WelcomeEmail } from '@/lib/email/welcome'
import { NextResponse } from 'next/server'

export async function GET() {
  const defaultProps = {
    firstName: 'Marie',
  }

  const html = await render(WelcomeEmail(defaultProps))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
