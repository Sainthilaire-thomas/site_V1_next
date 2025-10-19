// src/app/admin/(protected)/social/links/page.tsx

import type { Metadata } from 'next' // ✅ Import de type
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { UtmLinksClient } from './UtmLinksClient' // ✅ Chemin relatif correct

export const metadata: Metadata = {
  title: 'Générateur de liens UTM | Social Media',
}

export default async function UtmLinksPage() {
  const supabase = await createServerClient() // ✅ AWAIT

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Vérifier le rôle admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Récupérer les produits pour les suggestions
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')
    .limit(50)

  // Récupérer les collections
  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, slug')
    .order('name')

  return (
    <UtmLinksClient products={products || []} collections={collections || []} />
  )
}
