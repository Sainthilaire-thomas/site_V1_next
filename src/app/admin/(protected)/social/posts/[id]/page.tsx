// src/app/admin/(protected)/social/posts/[id]/page.tsx

import type { Metadata } from 'next' // ✅ Import de type
import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { PostFormClient } from '../PostFormClient' // ✅ Chemin corrigé

export const metadata: Metadata = {
  title: 'Éditer post | Social Media',
}

interface PageProps {
  params: Promise<{ id: string }> // ✅ Next.js 15: params est une Promise
}

export default async function EditPostPage({ params }: PageProps) {
  // ✅ Await params (Next.js 15)
  const { id } = await params

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

  // Récupérer le post avec ses performances
  const { data: post, error } = await supabase
    .from('social_posts_performance')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Récupérer les produits pour les suggestions
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  return <PostFormClient mode="edit" post={post} products={products || []} />
}
