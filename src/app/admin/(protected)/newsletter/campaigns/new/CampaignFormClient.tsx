// src/app/admin/(protected)/newsletter/campaigns/new/CampaignFormClient.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, Mail, Send, Eye } from 'lucide-react'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  image_url: string | null
}

type Props = {
  products: Product[]
}

export default function CampaignFormClient({ products }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [heroImage, setHeroImage] = useState<string>('')
  const [heroFile, setHeroFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preview_text: '',
    title: '',
    subtitle: '',
    cta_text: 'Découvrir',
    cta_link: '/products',
    product_1: '',
    product_2: '',
    product_3: '',
    product_4: '',
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setHeroImage(reader.result as string)
    }
    reader.readAsDataURL(file)
    setHeroFile(file)
  }

  const handleSubmit = async (action: 'save' | 'test' | 'send') => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom de la campagne est requis')
      return
    }
    if (!formData.subject.trim()) {
      toast.error("L'objet de l'email est requis")
      return
    }
    if (!heroImage) {
      toast.error("L'image hero est requise")
      return
    }
    if (
      !formData.product_1 ||
      !formData.product_2 ||
      !formData.product_3 ||
      !formData.product_4
    ) {
      toast.error('Veuillez sélectionner 4 produits')
      return
    }

    setLoading(true)

    try {
      // 1. Upload image hero si nécessaire
      let heroImageUrl = heroImage
      if (heroFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', heroFile)

        const uploadRes = await fetch('/api/admin/newsletter/upload-hero', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!uploadRes.ok) throw new Error('Erreur upload image')

        const { url } = await uploadRes.json()
        heroImageUrl = url
      }

      // 2. Créer la campagne
      const campaignData = {
        name: formData.name,
        subject: formData.subject,
        preview_text: formData.preview_text,
        content: {
          hero_image_url: heroImageUrl,
          title: formData.title,
          subtitle: formData.subtitle,
          cta_text: formData.cta_text,
          cta_link: formData.cta_link,
          products: [
            { id: formData.product_1, position: 1 },
            { id: formData.product_2, position: 2 },
            { id: formData.product_3, position: 3 },
            { id: formData.product_4, position: 4 },
          ],
        },
      }

      const createRes = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      })

      if (!createRes.ok) throw new Error('Erreur création campagne')

      const { campaign } = await createRes.json()

      if (action === 'save') {
        toast.success('Campagne sauvegardée')
        router.push('/admin/newsletter')
        router.refresh()
      } else if (action === 'test') {
        // TODO: Implémenter modal email de test
        toast.info('Email de test à implémenter')
      } else if (action === 'send') {
        // TODO: Implémenter modal confirmation envoi
        toast.info('Envoi à implémenter')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la campagne (interne)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Collection Hiver 2025"
            />
          </div>

          <div>
            <Label htmlFor="subject">Objet de l'email</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="❄️ Nouvelle Collection Hiver"
            />
          </div>

          <div>
            <Label htmlFor="preview">Texte de prévisualisation</Label>
            <Input
              id="preview"
              value={formData.preview_text}
              onChange={(e) =>
                setFormData({ ...formData, preview_text: e.target.value })
              }
              placeholder="Découvrez nos pièces essentielles pour l'hiver"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contenu de l'email */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu de l'email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Image */}
          <div>
            <Label>Image Hero</Label>
            <div className="mt-2">
              {heroImage ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={heroImage}
                    alt="Hero"
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setHeroImage('')
                      setHeroFile(null)
                    }}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Glisser une image ou cliquer pour parcourir
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Titre et sous-titre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre principal</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="NOUVELLE COLLECTION"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="Les essentiels de l'hiver"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_text">Texte du bouton</Label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) =>
                  setFormData({ ...formData, cta_text: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="cta_link">Lien du bouton</Label>
              <Input
                id="cta_link"
                value={formData.cta_link}
                onChange={(e) =>
                  setFormData({ ...formData, cta_link: e.target.value })
                }
                placeholder="/products/hauts"
              />
            </div>
          </div>

          {/* Sélection produits */}
          <div>
            <Label>Sélectionner 4 produits</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {(
                ['product_1', 'product_2', 'product_3', 'product_4'] as const
              ).map((key, index) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">
                    Produit {index + 1}
                  </Label>
                  <select
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionner...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.price}€ (Stock:{' '}
                        {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit('save')}
          disabled={loading}
        >
          <Mail className="mr-2 h-4 w-4" />
          Sauvegarder brouillon
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit('test')}
          disabled={loading}
        >
          <Eye className="mr-2 h-4 w-4" />
          Envoyer un test
        </Button>
        <Button onClick={() => handleSubmit('send')} disabled={loading}>
          <Send className="mr-2 h-4 w-4" />
          Envoyer maintenant
        </Button>
      </div>
    </div>
  )
}
