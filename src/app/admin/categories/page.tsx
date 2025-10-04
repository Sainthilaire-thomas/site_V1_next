// src/app/admin/categories/page.tsx
import { CategoriesClient } from './CategoriesClient'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export default async function CategoriesAdminPage() {
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return <CategoriesClient initialCategories={categories ?? []} />
}
