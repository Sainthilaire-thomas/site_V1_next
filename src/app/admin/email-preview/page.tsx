// src/app/admin/email-preview/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mail,
  Package,
  Truck,
  CheckCircle,
  Key,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EmailPreviewPage() {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  // ✅ Plus de restriction : vous pouvez entrer n'importe quel email
  const [testEmail, setTestEmail] = useState('sonearthomas@gmail.com')

  const emailTemplates = [
    {
      name: 'Order confirmation',
      href: '/api/admin/email-preview/order-confirmation',
      description: 'Sent after payment validation',
      icon: Package,
      type: 'order-confirmation',
    },
    {
      name: 'Order shipped',
      href: '/api/admin/email-preview/order-shipped',
      description: 'Tracking email after shipment',
      icon: Truck,
      type: 'order-shipped',
    },
    {
      name: 'Order delivered',
      href: '/api/admin/email-preview/order-delivered',
      description: 'Delivery confirmation email',
      icon: CheckCircle,
      type: 'order-delivered',
    },
    {
      name: 'Welcome',
      href: '/api/admin/email-preview/welcome',
      description: 'Welcome email for new customers',
      icon: Sparkles,
      type: 'welcome',
    },
    {
      name: 'Password reset',
      href: '/api/admin/email-preview/password-reset',
      description: 'Email with reset link',
      icon: Key,
      type: 'password-reset',
    },
  ]

  const handleSendTest = async (type: string, templateName: string) => {
    // ✅ Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    console.log('🚀 Sending test email', {
      type,
      templateName,
      email: testEmail,
    })
    setSendingEmail(type)

    try {
      const response = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, type }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to send email')
      }

      toast.success(`✅ ${templateName} sent to ${testEmail}!`, {
        description: 'Check your inbox (and spam folder)',
      })
      console.log('✅ Email sent successfully', data)
    } catch (error) {
      console.error('❌ Error sending email:', error)

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to send email`, {
        description: errorMessage,
      })
    } finally {
      setSendingEmail(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Email Templates</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Preview and test all transactional email templates
          </p>

          {/* ✅ Statut du domaine vérifié */}
          <Alert className="mb-6 max-w-2xl bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong className="text-green-900">Domain verified!</strong> You
              can now send emails from{' '}
              <strong>contact@blancherenaudin.com</strong> to any email address.
            </AlertDescription>
          </Alert>

          {/* Email input */}
          <div className="max-w-md">
            <label className="text-sm font-medium mb-2 block">
              Test email address:
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Emails will be sent from{' '}
              <strong>contact@blancherenaudin.com</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8 px-4">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Templates</CardDescription>
              <CardTitle className="text-2xl">
                {emailTemplates.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sender</CardDescription>
              <CardTitle className="text-lg">
                contact@blancherenaudin.com
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Style</CardDescription>
              <CardTitle className="text-2xl">Minimal</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {emailTemplates.map((template) => {
            const Icon = template.icon
            const isLoading = sendingEmail === template.type

            return (
              <Card key={template.type} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Preview
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Link
                      href={template.href}
                      target="_blank"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>

                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleSendTest(template.type, template.name)
                      }
                      disabled={isLoading || !testEmail}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Integration guide
            </CardTitle>
            <div className="space-y-4 mt-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground mb-2">
                  How to use in your code:
                </div>
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                  {`import { sendEmail } from '@/lib/email/send'

// Send order confirmation
await sendEmail({
  type: 'order-confirmation',
  to: customer.email,
  props: {
    orderNumber: order.id,
    customerName: customer.name,
    items: order.items,
    total: order.total,
  }
})`}
                </pre>
              </div>

              <div className="pt-2 border-t">
                <div className="font-medium text-foreground mb-2">
                  Files structure:
                </div>
                <ul className="space-y-1 text-xs">
                  <li>
                    📧{' '}
                    <code className="bg-muted px-1 rounded">
                      src/lib/email/config.ts
                    </code>{' '}
                    - Email configuration
                  </li>
                  <li>
                    📤{' '}
                    <code className="bg-muted px-1 rounded">
                      src/lib/email/send.ts
                    </code>{' '}
                    - Send function
                  </li>
                  <li>
                    🎨{' '}
                    <code className="bg-muted px-1 rounded">
                      src/lib/email/*.tsx
                    </code>{' '}
                    - Templates
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t text-xs">
                📚 Docs:{' '}
                <a
                  href="https://react.email"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70"
                >
                  react.email
                </a>
                {' • '}
                <a
                  href="https://resend.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70"
                >
                  resend.com/docs
                </a>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
