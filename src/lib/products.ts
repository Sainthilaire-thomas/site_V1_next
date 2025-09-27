import { supabase } from '@/lib/supabase' // tu utilises bien ce nom d'import dans ton projet

export async function fetchProductsByIds(ids: string[]) {
  if (!ids?.length) return []
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, price,
      product_images ( url )
    `)
    .in('id', ids)

  if (error) {
    console.error('[fetchProductsByIds]', error)
    return []
  }

  // Aplatis les images pour correspondre à l’usage dans l’exemple
  return (data || []).map((p: any) => ({
    ...p,
    images: p.product_images || [],
  }))
}
