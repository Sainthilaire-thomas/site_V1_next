// src/app/admin/(protected)/social/compare/page.tsx

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { CompareClient } from './CompareClient'

export const metadata: Metadata = {
  title: 'Comparaison | Social Media',
  description: 'Comparez les performances de vos posts Instagram',
}

export default async function ComparePage() {
  const supabase = await createServerClient()

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

  // Récupérer tous les posts avec performances
  const { data: posts } = await supabase
    .from('social_posts_performance')
    .select('*')
    .order('published_at', { ascending: false })

  return <CompareClient posts={posts || []} />
}
