import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await getServerSupabase()

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
      *,
      images:product_images(*),
      variants:product_variants(*),
      category:categories(*)
    `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!product)
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  return NextResponse.json({ product })
}
