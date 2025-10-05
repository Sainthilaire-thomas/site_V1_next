// src/app/account/wishlist/page.tsx
import WishlistClient from './WishlistClient'
import { getServerSupabase } from '@/lib/supabase-server'

export default async function WishlistPage() {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from('wishlist_items')
    .select(
      `
      id,
      product:products(
        id, name, price, sale_price,
        images:product_images(*)
      )
    `
    )
    .eq('user_id', user!.id)

  return <WishlistClient initialItems={items ?? []} />
}
