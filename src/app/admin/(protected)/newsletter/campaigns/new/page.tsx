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
  const { data: products } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      price,
      total_stock,
      product_images (
        image_url,
        sort_order
      )
    `
    )
    .eq('status', 'active')
    .gt('total_stock', 0)
    .order('name')

  // Formatter les produits avec leur première image
  const formattedProducts =
    products?.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.total_stock,
      image_url: p.product_images?.[0]?.image_url || null,
    })) || []

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Nouvelle Campagne Newsletter</h1>
          <p className="text-muted-foreground mt-1">
            Créez une campagne email avec le template Jacquemus
          </p>
        </div>

        <CampaignFormClient products={formattedProducts} />
      </div>
    </div>
  )
}
