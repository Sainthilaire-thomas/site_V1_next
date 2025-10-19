// src/app/admin/(protected)/social/posts/new/page.tsx

import type { Metadata } from 'next' // ✅ Import de type
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { PostFormClient } from '../PostFormClient' // ✅ Chemin corrigé

export const metadata: Metadata = {
  title: 'Nouveau post | Social Media',
}

export default async function NewPostPage() {
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

  return <PostFormClient mode="create" products={products || []} />
}
