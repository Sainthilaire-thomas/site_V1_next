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
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EmailPreviewPage() {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  // ✅ CHANGEZ ICI : Mettez votre email par défaut
  const [testEmail, setTestEmail] = useState('sonearthomas@gmail.com')

  // ✅ L'email autorisé en mode gratuit Resend
  const ALLOWED_EMAIL = 'sonearthomas@gmail.com'

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
    // ✅ Vérification : l'email doit correspondre à l'email autorisé
    if (testEmail !== ALLOWED_EMAIL) {
      toast.error(`You can only send to ${ALLOWED_EMAIL} with free Resend plan`)
      return
    }

    console.log('🚀 handleSendTest appelé', {
      type,
      templateName,
      email: testEmail,
    })
    setSendingEmail(type)

    try {
      console.log('📡 Envoi de la requête...')
      const response = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, type }),
      })

      console.log('📥 Réponse reçue:', response.status, response.statusText)

      let data
      try {
        data = await response.json()
        console.log('📦 Data:', data)
      } catch (e) {
        console.error('❌ Impossible de parser la réponse JSON:', e)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        console.error('❌ Erreur serveur:', data)
        throw new Error(data.error || data.details || 'Failed to send email')
      }

      toast.success(`✅ ${templateName} sent! Check your inbox at ${testEmail}`)
      console.log('✅ Success!', data)
    } catch (error) {
      console.error('❌ Erreur complète:', error)

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed: ${errorMessage}`)
    } finally {
      setSendingEmail(null)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Email preview</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Preview of all transactional email templates
          </p>

          {/* ✅ Alerte Resend */}
          <Alert className="mb-4 max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Free Resend plan:</strong> You can only send test emails
              to <strong>{ALLOWED_EMAIL}</strong>. To send to other addresses,
              verify a domain at{' '}
              <a
                href="https://resend.com/domains"
                target="_blank"
                className="underline"
              >
                resend.com/domains
              </a>
            </AlertDescription>
          </Alert>

          {/* Email input */}
          <div className="max-w-md">
            <label className="text-sm font-medium mb-2 block">
              Test email address:
            </label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={testEmail !== ALLOWED_EMAIL ? 'border-orange-500' : ''}
            />
            {testEmail !== ALLOWED_EMAIL && (
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                This email won't work with free plan
              </p>
            )}
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
              <CardDescription>Design system</CardDescription>
              <CardTitle className="text-2xl">React Email</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Style</CardDescription>
              <CardTitle className="text-2xl">Minimal</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {emailTemplates.map((template) => {
            const Icon = template.icon
            const isLoading = sendingEmail === template.type

            return (
              <Card key={template.type} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <Icon className="h-6 w-6" />
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

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Integration guide
            </CardTitle>
            <div className="space-y-3 mt-3 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">
                To send emails in production:
              </div>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Configure Resend or SendGrid in{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    src/lib/email/send.ts
                  </code>
                </li>
                <li>
                  Call{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    sendEmail()
                  </code>{' '}
                  with appropriate props
                </li>
                <li>
                  Templates are in{' '}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    src/lib/email/*.tsx
                  </code>
                </li>
              </ol>
              <div className="pt-2 border-t text-xs">
                📁 Files:{' '}
                <code className="bg-muted px-1 rounded">src/lib/email/</code> •
                📚 Docs:{' '}
                <a
                  href="https://react.email"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-70"
                >
                  react.email
                </a>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
