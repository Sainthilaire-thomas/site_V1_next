import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server"; // ⬅️ remplace l'import

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params
  const supabase = await getServerSupabase() // ⬅️ init par requête

  const { data: coll, error: collErr } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  if (collErr)
    return NextResponse.json({ error: collErr.message }, { status: 500 })
  if (!coll) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const { data: cps, error: cpsErr } = await supabase
    .from('collection_products')
    .select(
      `
      sort_order,
      product:products(
        *,
        images:product_images(*),
        category:categories(*)
      )
    `
    )
    .eq('collection_id', coll.id)
    .order('sort_order', { ascending: true })

  if (cpsErr)
    return NextResponse.json({ error: cpsErr.message }, { status: 500 })

  const products = (cps ?? []).map((cp: any) => cp.product).filter(Boolean)
  return NextResponse.json({ collection: coll, products })
}
