// src/app/admin/(protected)/newsletter/page.tsx

import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Eye, Copy, Trash2 } from 'lucide-react'

type Campaign = {
  id: string
  name: string
  subject: string
  status: 'draft' | 'sending' | 'sent' | 'cancelled'
  sent: number | null
  open_rate: number | null
  click_rate: number | null
  sent_at: string | null
  created_at: string
}

export default async function NewsletterPage() {
  const supabase = await createServerClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Récupérer campagnes
  const { data: campaigns } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  const typedCampaigns = (campaigns || []) as Campaign[]

  // Compter abonnés actifs
  const { count: totalSubscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">
            {totalSubscribers || 0} abonnés actifs
          </p>
        </div>
        <Link href="/admin/newsletter/campaigns/new">
          <Button size="lg">
            <Mail className="mr-2 h-5 w-5" />
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      {/* Liste des campagnes */}
      <div className="space-y-4">
        {typedCampaigns.length > 0 ? (
          typedCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {campaign.subject}
                    </p>
                  </div>
                  <Badge
                    variant={
                      campaign.status === 'sent'
                        ? 'default'
                        : campaign.status === 'sending'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {campaign.status === 'sent' && '✅ Envoyée'}
                    {campaign.status === 'sending' && '⏳ En cours'}
                    {campaign.status === 'draft' && '📝 Brouillon'}
                  </Badge>
                </div>
              </CardHeader>

              {campaign.status === 'sent' && (
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Envoyés</p>
                      <p className="text-2xl font-bold">{campaign.sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux ouverture</p>
                      <p className="text-2xl font-bold">
                        {campaign.open_rate || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux clic</p>
                      <p className="text-2xl font-bold">
                        {campaign.click_rate || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Envoyé le</p>
                      <p className="font-medium">
                        {campaign.sent_at
                          ? new Date(campaign.sent_at).toLocaleDateString(
                              'fr-FR'
                            )
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/newsletter/campaigns/${campaign.id}/stats`}
                    >
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les stats
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              )}

              {campaign.status === 'draft' && (
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/admin/newsletter/campaigns/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        Éditer
                      </Button>
                    </Link>
                    <Button variant="default" size="sm">
                      Envoyer
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucune campagne pour le moment
              </p>
              <Link href="/admin/newsletter/campaigns/new">
                <Button>Créer la première campagne</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
