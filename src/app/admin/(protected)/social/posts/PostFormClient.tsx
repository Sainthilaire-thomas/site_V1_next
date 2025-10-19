// src/app/admin/(protected)/social/posts/PostFormClient.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Calendar,
  Instagram,
  Link as LinkIcon,
  Image as ImageIcon,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Product {
  id: string
  name: string
  slug: string
}

// ✅ Interface Post pour les données de la DB (avec null)
interface Post {
  id?: string | null
  post_type: string | null
  account_type: string | null
  account_handle: string | null
  caption?: string | null
  image_url?: string | null
  post_url?: string | null
  utm_campaign: string | null
  tracking_link?: string | null
  featured_product_ids?: string[] | null
  impressions?: number | null
  reach?: number | null
  likes?: number | null
  comments?: number | null
  shares?: number | null
  saves?: number | null
  published_at: string | null

  // Métriques web (lecture seule)
  web_visits?: number | null
  web_add_to_cart?: number | null
  web_purchases?: number | null
  web_revenue?: number | null
  web_conversion_rate?: number | null
}

// ✅ NOUVEAU : Interface FormData (sans null, pour les inputs)
interface FormData {
  post_type: string
  account_type: string
  account_handle: string
  caption: string
  image_url: string
  post_url: string
  utm_campaign: string
  tracking_link: string
  featured_product_ids: string[]
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  published_at: string
}

interface PostFormClientProps {
  mode: 'create' | 'edit'
  post?: Post
  products: Product[]
}

export function PostFormClient({ mode, post, products }: PostFormClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const safeString = (value: string | null | undefined): string => value ?? ''
  const safeNumber = (value: number | null | undefined): number => value ?? 0
  const safeArray = (value: string[] | null | undefined): string[] =>
    value ?? []

  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    post_type: safeString(post?.post_type) || 'story',
    account_type: safeString(post?.account_type) || 'pro',
    account_handle: safeString(post?.account_handle) || '@blancherenaudin',
    caption: safeString(post?.caption),
    image_url: safeString(post?.image_url),
    post_url: safeString(post?.post_url),
    utm_campaign: safeString(post?.utm_campaign),
    tracking_link: safeString(post?.tracking_link),
    featured_product_ids: safeArray(post?.featured_product_ids),
    impressions: safeNumber(post?.impressions),
    reach: safeNumber(post?.reach),
    likes: safeNumber(post?.likes),
    comments: safeNumber(post?.comments),
    shares: safeNumber(post?.shares),
    saves: safeNumber(post?.saves),
    published_at:
      safeString(post?.published_at) || new Date().toISOString().split('T')[0],
  })

  // Générer automatiquement le nom de campagne
  useEffect(() => {
    if (mode === 'create' && !formData.utm_campaign) {
      const date = new Date().toISOString().split('T')[0]
      const type = formData.post_type
      const account = formData.account_type

      setFormData((prev) => ({
        ...prev,
        utm_campaign: `${type}-${account}-${date}`,
      }))
    }
  }, [formData.post_type, formData.account_type, mode])

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.post_type) {
      newErrors.post_type = 'Type de post requis'
    }

    if (!formData.account_type) {
      newErrors.account_type = 'Compte requis'
    }

    if (!formData.utm_campaign) {
      newErrors.utm_campaign = 'Campagne UTM requise'
    }

    if (!formData.published_at) {
      newErrors.published_at = 'Date de publication requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Veuillez corriger les erreurs')
      return
    }

    setLoading(true)

    try {
      const url =
        mode === 'create'
          ? '/api/admin/social/posts'
          : `/api/admin/social/posts/${post?.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          published_at: new Date(formData.published_at!).toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(
        mode === 'create'
          ? 'Post créé avec succès'
          : 'Post mis à jour avec succès'
      )
      router.push('/admin/social/posts')
      router.refresh()
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  // Calculer l'engagement rate
  const calculateEngagementRate = () => {
    const impressions = formData.impressions || 0
    if (impressions === 0) return 0

    const engagements =
      (formData.likes || 0) +
      (formData.comments || 0) +
      (formData.shares || 0) +
      (formData.saves || 0)

    return ((engagements / impressions) * 100).toFixed(2)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Instagram className="h-8 w-8" />
            {mode === 'create' ? 'Nouveau post Instagram' : 'Éditer le post'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'create'
              ? 'Ajoutez un post pour suivre ses performances'
              : 'Mettez à jour les métriques du post'}
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/social/posts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du post</CardTitle>
            <CardDescription>
              Détails de la publication Instagram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type de post */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post_type">
                  Type de post <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.post_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, post_type: value })
                  }
                >
                  <SelectTrigger id="post_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story (24h)</SelectItem>
                    <SelectItem value="feed">Post feed</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="carousel">Carrousel</SelectItem>
                  </SelectContent>
                </Select>
                {errors.post_type && (
                  <p className="text-sm text-destructive">{errors.post_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_type">
                  Compte <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, account_type: value })
                  }
                >
                  <SelectTrigger id="account_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro">@blancherenaudin (Pro)</SelectItem>
                    <SelectItem value="perso">@blanche.rnd (Perso)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.account_type && (
                  <p className="text-sm text-destructive">
                    {errors.account_type}
                  </p>
                )}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Texte de votre post Instagram..."
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post_url">
                  <ExternalLink className="h-4 w-4 inline mr-1" />
                  URL du post Instagram
                </Label>
                <Input
                  id="post_url"
                  type="url"
                  placeholder="https://instagram.com/p/..."
                  value={formData.post_url}
                  onChange={(e) =>
                    setFormData({ ...formData, post_url: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">
                  <ImageIcon className="h-4 w-4 inline mr-1" />
                  URL de l'image
                </Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Date de publication */}
            <div className="space-y-2">
              <Label htmlFor="published_at">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date de publication <span className="text-destructive">*</span>
              </Label>
              <Input
                id="published_at"
                type="date"
                value={formData.published_at?.split('T')[0]}
                onChange={(e) =>
                  setFormData({ ...formData, published_at: e.target.value })
                }
              />
              {errors.published_at && (
                <p className="text-sm text-destructive">
                  {errors.published_at}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>
              <LinkIcon className="h-5 w-5 inline mr-2" />
              Tracking UTM
            </CardTitle>
            <CardDescription>
              Paramètres pour suivre l'impact sur le site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="utm_campaign">
                Nom de campagne UTM <span className="text-destructive">*</span>
              </Label>
              <Input
                id="utm_campaign"
                placeholder="Ex: story-nouvelle-collection"
                value={formData.utm_campaign}
                onChange={(e) =>
                  setFormData({ ...formData, utm_campaign: e.target.value })
                }
              />
              {errors.utm_campaign && (
                <p className="text-sm text-destructive">
                  {errors.utm_campaign}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Utilisé pour relier ce post aux visites sur le site
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking_link">Lien de tracking complet</Label>
              <Input
                id="tracking_link"
                type="url"
                placeholder="https://blancherenaudin.com/...?utm_campaign=..."
                value={formData.tracking_link}
                onChange={(e) =>
                  setFormData({ ...formData, tracking_link: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Lien avec paramètres UTM utilisé dans le post
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Utilisez le{' '}
                <Link href="/admin/social/links" className="underline">
                  générateur de liens UTM
                </Link>{' '}
                pour créer un lien tracké
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Métriques Instagram */}
        <Card>
          <CardHeader>
            <CardTitle>
              <BarChart3 className="h-5 w-5 inline mr-2" />
              Métriques Instagram
            </CardTitle>
            <CardDescription>
              Statistiques depuis l'application Instagram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impressions">Impressions</Label>
                <Input
                  id="impressions"
                  type="number"
                  min="0"
                  value={formData.impressions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      impressions: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reach">Portée</Label>
                <Input
                  id="reach"
                  type="number"
                  min="0"
                  value={formData.reach}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reach: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={formData.likes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      likes: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Commentaires</Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  value={formData.comments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      comments: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares">Partages</Label>
                <Input
                  id="shares"
                  type="number"
                  min="0"
                  value={formData.shares}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shares: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saves">Sauvegardes</Label>
                <Input
                  id="saves"
                  type="number"
                  min="0"
                  value={formData.saves}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saves: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Taux d'engagement calculé */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taux d'engagement</span>
                <Badge variant="secondary" className="text-lg">
                  {calculateEngagementRate()}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Calculé automatiquement : (likes + comments + shares + saves) /
                impressions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performances web (en édition uniquement) */}
        {mode === 'edit' && post && (
          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp className="h-5 w-5 inline mr-2" />
                Performances sur le site
              </CardTitle>
              <CardDescription>
                Impact généré depuis ce post Instagram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Visites</div>
                  <div className="text-2xl font-bold">
                    {post.web_visits || 0}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Ajouts panier
                  </div>
                  <div className="text-2xl font-bold">
                    {post.web_add_to_cart || 0}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Achats</div>
                  <div className="text-2xl font-bold">
                    {post.web_purchases || 0}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Chiffre d'affaires
                  </div>
                  <div className="text-2xl font-bold">
                    {(post.web_revenue || 0).toFixed(2)} €
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Taux de conversion
                </span>
                <Badge variant="default" className="text-lg">
                  {(post.web_conversion_rate || 0).toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/social/posts')}
            disabled={loading}
          >
            Annuler
          </Button>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {mode === 'create'
              ? 'Créer le post'
              : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}
