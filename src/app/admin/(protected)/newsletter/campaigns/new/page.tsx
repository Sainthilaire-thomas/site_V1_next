// src/app/admin/(protected)/newsletter/campaigns/new/page.tsx

import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CampaignFormClient from './CampaignFormClient'

export default async function NewCampaignPage() {
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

  // Récupérer les produits actifs pour la sélection
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      price,
      product_images!product_images_product_id_fkey (
        id,
        sort_order,
        is_primary
      )
    `
    )
    .eq('is_active', true)
    .order('name')

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  // Formatter les produits avec leur première image (avec fallback sécurisé)
  const formattedProducts = (products || []).map((p) => {
    // Trouver l'image primaire ou prendre la première
    const images = Array.isArray(p.product_images) ? p.product_images : []
    const primaryImage = images.find((img) => img.is_primary) || images[0]

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      image_id: primaryImage?.id || null,
    }
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Nouvelle Campagne Newsletter</h1>
          <p className="text-muted-foreground mt-1">
            Créez une campagne email avec le template Jacquemus
          </p>
        </div>

        {/* Toujours passer un array, même vide */}
        <CampaignFormClient products={formattedProducts || []} />
      </div>
    </div>
  )
}
