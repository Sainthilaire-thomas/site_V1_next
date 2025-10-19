// src/app/admin/(protected)/social/posts/page.tsx

import type { Metadata } from 'next' // ✅ Import de type
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { PostsListClient } from './PostListClient' // ✅ Chemin relatif correct

export const metadata: Metadata = {
  title: 'Posts Instagram | Social Media',
}

export default async function PostsListPage() {
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

  // Récupérer tous les posts avec performances
  const { data: posts } = await supabase
    .from('social_posts_performance')
    .select('*')
    .order('published_at', { ascending: false })

  return <PostsListClient initialPosts={posts || []} />
}
