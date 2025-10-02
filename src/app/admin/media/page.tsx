// src/app/admin/media/page.tsx
import { MediaGridClient } from './MediaGridClient'

export default async function AdminMediaPage({
  searchParams,
}: {
  // En Next 15 App Router, searchParams est une Promise
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { product_id } = await searchParams // ✅ on attend la Promise
  return <MediaGridClient productId={product_id ?? null} />
}
