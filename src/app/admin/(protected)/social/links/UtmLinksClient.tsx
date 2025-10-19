// src/app/admin/(protected)/social/links/UtmLinksClient.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Link as LinkIcon,
  Sparkles,
  History,
  Instagram,
} from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
}

interface Collection {
  id: string
  name: string
  slug: string
}

interface UtmLinksClientProps {
  products: Product[]
  collections: Collection[]
}

export function UtmLinksClient({ products, collections }: UtmLinksClientProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  const [formData, setFormData] = useState({
    destinationType: 'collection',
    destination: '/collections/new-in',
    customUrl: '',
    postType: 'story',
    account: 'pro',
    campaign: '',
    productId: '',
    description: '',
  })

  // Générer le nom de campagne automatique
  const generateCampaignName = () => {
    if (formData.campaign) return formData.campaign

    const date = new Date().toISOString().split('T')[0]
    const type = formData.postType
    const dest = formData.destinationType

    return `${type}-${dest}-${date}`
  }

  // Générer le lien complet
  const generateLink = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://blancherenaudin.com'

    let destination = formData.destination

    // Si destination custom
    if (formData.destinationType === 'custom' && formData.customUrl) {
      destination = formData.customUrl.startsWith('/')
        ? formData.customUrl
        : '/' + formData.customUrl
    }

    // Si produit spécifique
    if (formData.destinationType === 'product' && formData.productId) {
      destination = `/product/${formData.productId}`
    }

    const url = new URL(destination, baseUrl)

    url.searchParams.set('utm_source', 'instagram')
    url.searchParams.set('utm_medium', formData.postType)
    url.searchParams.set('utm_campaign', generateCampaignName())
    url.searchParams.set('utm_content', `${formData.account}-account`)

    return url.toString()
  }

  const fullLink = generateLink()

  // Copier dans le presse-papiers
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLink)
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers !')

      // Sauvegarder dans l'historique (localStorage)
      saveToHistory()

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erreur lors de la copie')
    }
  }

  // Générer un QR Code
  const handleGenerateQR = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(fullLink, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      setQrCodeUrl(qrDataUrl)
      setShowQrModal(true)
      toast.success('QR Code généré !')
    } catch (error) {
      toast.error('Erreur lors de la génération du QR Code')
    }
  }

  // Télécharger le QR Code
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = `qr-${generateCampaignName()}.png`
    link.href = qrCodeUrl
    link.click()

    toast.success('QR Code téléchargé !')
  }

  // Sauvegarder dans l'historique
  const saveToHistory = () => {
    try {
      const history = JSON.parse(
        localStorage.getItem('utm_links_history') || '[]'
      )

      const newEntry = {
        link: fullLink,
        campaign: generateCampaignName(),
        type: formData.postType,
        account: formData.account,
        destination: formData.destination,
        description: formData.description,
        createdAt: new Date().toISOString(),
      }

      // Garder les 20 derniers
      const updatedHistory = [newEntry, ...history].slice(0, 20)

      localStorage.setItem('utm_links_history', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to save to history:', error)
    }
  }

  // Charger l'historique
  const [history, setHistory] = useState<any[]>([])

  useState(() => {
    try {
      const stored = localStorage.getItem('utm_links_history')
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  })

  // Générer des suggestions intelligentes
  const suggestions = [
    {
      icon: Sparkles,
      title: 'Lancement collection',
      description: 'Annonce nouvelle collection',
      config: {
        destinationType: 'collection',
        destination: '/collections/new-in',
        postType: 'reel',
        campaign: 'launch-collection-' + new Date().toISOString().split('T')[0],
      },
    },
    {
      icon: Instagram,
      title: 'Story produit',
      description: 'Mise en avant produit spécifique',
      config: {
        destinationType: 'product',
        postType: 'story',
        campaign: 'story-product-' + new Date().toISOString().split('T')[0],
      },
    },
    {
      icon: LinkIcon,
      title: 'Lien bio',
      description: 'Lien permanent dans la bio',
      config: {
        destinationType: 'collection',
        destination: '/',
        postType: 'bio',
        campaign: 'bio-homepage',
      },
    },
  ]

  const applySuggestion = (config: any) => {
    setFormData({ ...formData, ...config })
    toast.success('Configuration appliquée !')
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LinkIcon className="h-8 w-8" />
            Générateur de liens UTM
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez des liens trackés pour mesurer l'impact de vos posts Instagram
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/social">Retour au dashboard</Link>
        </Button>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator">Générateur</TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Suggestions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggestions rapides</CardTitle>
              <CardDescription>
                Templates pré-configurés pour gagner du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySuggestion(suggestion.config)}
                    className="p-4 rounded-lg border hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <suggestion.icon className="h-6 w-6 mb-2 text-primary" />
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formulaire principal */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration du lien</CardTitle>
              <CardDescription>
                Tous les paramètres UTM sont générés automatiquement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type de destination */}
              <div className="space-y-2">
                <Label>Type de destination</Label>
                <Select
                  value={formData.destinationType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, destinationType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage">Page d'accueil</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="product">Produit spécifique</SelectItem>
                    <SelectItem value="lookbook">Lookbook</SelectItem>
                    <SelectItem value="custom">URL personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination selon le type */}
              {formData.destinationType === 'homepage' && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    Destination : <span className="font-mono">/</span>
                  </p>
                </div>
              )}

              {formData.destinationType === 'collection' && (
                <div className="space-y-2">
                  <Label>Collection</Label>
                  <Select
                    value={formData.destination}
                    onValueChange={(value) =>
                      setFormData({ ...formData, destination: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/collections/new-in">
                        New In
                      </SelectItem>
                      <SelectItem value="/collections/hauts">Hauts</SelectItem>
                      <SelectItem value="/collections/bas">Bas</SelectItem>
                      <SelectItem value="/collections/accessories">
                        Accessoires
                      </SelectItem>
                      {collections.map((col) => (
                        <SelectItem
                          key={col.id}
                          value={`/collections/${col.slug}`}
                        >
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.destinationType === 'product' && (
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.destinationType === 'lookbook' && (
                <div className="space-y-2">
                  <Label>Lookbook</Label>
                  <Select
                    value={formData.destination}
                    onValueChange={(value) =>
                      setFormData({ ...formData, destination: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/silhouettes">
                        Tous les lookbooks
                      </SelectItem>
                      <SelectItem value="/silhouettes/printemps-2025">
                        Printemps 2025
                      </SelectItem>
                      <SelectItem value="/silhouettes/ete-2025">
                        Été 2025
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.destinationType === 'custom' && (
                <div className="space-y-2">
                  <Label>URL personnalisée</Label>
                  <Input
                    placeholder="/impact ou /about"
                    value={formData.customUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, customUrl: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Entrez une URL relative (ex: /impact) ou complète
                  </p>
                </div>
              )}

              <Separator />

              {/* Type de post */}
              <div className="space-y-2">
                <Label>Type de post Instagram</Label>
                <Select
                  value={formData.postType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, postType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story (24h)</SelectItem>
                    <SelectItem value="feed">Post feed</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="carousel">Carrousel</SelectItem>
                    <SelectItem value="bio">Lien bio (permanent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compte */}
              <div className="space-y-2">
                <Label>Compte Instagram</Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) =>
                    setFormData({ ...formData, account: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro">@blancherenaudin (Pro)</SelectItem>
                    <SelectItem value="perso">@blanche.rnd (Perso)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Campagne (optionnel) */}
              <div className="space-y-2">
                <Label>Nom de campagne (optionnel)</Label>
                <Input
                  placeholder="Ex: launch-collection-printemps"
                  value={formData.campaign}
                  onChange={(e) =>
                    setFormData({ ...formData, campaign: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Si vide, sera généré automatiquement :{' '}
                  <span className="font-mono">{generateCampaignName()}</span>
                </p>
              </div>

              {/* Description (optionnel) */}
              <div className="space-y-2">
                <Label>Description (pour votre référence)</Label>
                <Textarea
                  placeholder="Ex: Post annonçant la nouvelle collection printemps avec Léa en robe noire"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lien généré */}
          <Card>
            <CardHeader>
              <CardTitle>Lien généré</CardTitle>
              <CardDescription>
                Prêt à copier et utiliser sur Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL complète */}
              <div className="space-y-2">
                <Label>URL complète</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={fullLink}
                    className="font-mono text-sm"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={fullLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateQR}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Preview des paramètres UTM */}
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <Badge>UTM</Badge>
                  Paramètres de tracking
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground mt-2">
                  <div>utm_source:</div>
                  <div className="font-mono">instagram</div>

                  <div>utm_medium:</div>
                  <div className="font-mono">{formData.postType}</div>

                  <div>utm_campaign:</div>
                  <div className="font-mono">{generateCampaignName()}</div>

                  <div>utm_content:</div>
                  <div className="font-mono">{formData.account}-account</div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2">
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </Button>
                <Button variant="outline" onClick={handleGenerateQR}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des liens générés</CardTitle>
              <CardDescription>Les 20 derniers liens créés</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun lien généré pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg border space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge>{item.type}</Badge>
                            <Badge variant="outline">{item.account}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString(
                                'fr-FR',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>
                          <div className="font-mono text-sm text-muted-foreground">
                            {item.campaign}
                          </div>
                          {item.description && (
                            <p className="text-sm mt-1">{item.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(item.link)
                            toast.success('Lien copié !')
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground truncate">
                        {item.link}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal QR Code */}
      {showQrModal && qrCodeUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrModal(false)}
        >
          <Card
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>QR Code généré</CardTitle>
              <CardDescription>Scanner pour accéder au lien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadQR} className="flex-1">
                  Télécharger
                </Button>
                <Button variant="outline" onClick={() => setShowQrModal(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
