// src/app/admin/(protected)/social/page.tsx

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { SocialDashboardClient } from './SocialDashboardClient'

export const metadata: Metadata = {
  title: 'Social Media Analytics | Admin',
  description: 'Suivez les performances de vos posts Instagram',
}

export default async function SocialDashboardPage() {
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

  // Récupérer les statistiques initiales depuis la vue
  // On récupère les 30 derniers jours par défaut
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: posts } = await supabase
    .from('social_posts_performance')
    .select('*')
    .gte('published_at', since.toISOString())
    .order('published_at', { ascending: false })

  return <SocialDashboardClient initialData={posts || []} />
}
