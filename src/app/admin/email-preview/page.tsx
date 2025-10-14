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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Mail,
  Package,
  Truck,
  CheckCircle,
  Key,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function EmailPreviewPage() {
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  const emailTemplates = [
    {
      name: 'Order confirmation',
      href: '/api/admin/email-preview/order-confirmation',
      description: 'Sent after payment validation',
      icon: Package,
      testEndpoint: '/api/admin/email/send-test',
      type: 'order-confirmation',
    },
    {
      name: 'Order shipped',
      href: '/api/admin/email-preview/order-shipped',
      description: 'Tracking email after shipment',
      icon: Truck,
      testEndpoint: '/api/admin/email/send-test',
      type: 'order-shipped',
    },
    {
      name: 'Order delivered',
      href: '/api/admin/email-preview/order-delivered',
      description: 'Delivery confirmation email',
      icon: CheckCircle,
      testEndpoint: '/api/admin/email/send-test',
      type: 'order-delivered',
    },
    {
      name: 'Welcome',
      href: '/api/admin/email-preview/welcome',
      description: 'Welcome email for new customers',
      icon: Sparkles,
      testEndpoint: '/api/admin/email/send-test',
      type: 'welcome',
    },
    {
      name: 'Password reset',
      href: '/api/admin/email-preview/password-reset',
      description: 'Email with reset link',
      icon: Key,
      testEndpoint: '/api/admin/email/send-test',
      type: 'password-reset',
    },
  ]

  const handleSendTest = async (
    email: string,
    type: string,
    templateName: string
  ) => {
    setSendingEmail(type)

    try {
      const response = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      toast.success(`${templateName} sent to ${email}`)
    } catch (error) {
      toast.error('Failed to send test email')
      console.error(error)
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
          <p className="text-muted-foreground">
            Preview of all transactional email templates
          </p>
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

                    <SendTestEmailDialog
                      templateName={template.name}
                      templateType={template.type}
                      onSend={handleSendTest}
                      isLoading={sendingEmail === template.type}
                    />
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

// Composant Dialog pour l'envoi de test
function SendTestEmailDialog({
  templateName,
  templateType,
  onSend,
  isLoading,
}: {
  templateName: string
  templateType: string
  onSend: (email: string, type: string, name: string) => Promise<void>
  isLoading: boolean
}) {
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    await onSend(email, templateType, templateName)
    setOpen(false)
    setEmail('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send test email</DialogTitle>
          <DialogDescription>
            Send a test version of <strong>{templateName}</strong> to your email
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
