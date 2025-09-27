import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await getServerSupabase();

  const { data: cols, error: colsErr } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url, is_featured, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (colsErr)
    return NextResponse.json({ error: colsErr.message }, { status: 500 });
  if (!cols?.length) return NextResponse.json({ collections: [] });

  const ids = cols.map((c) => c.id);
  const { data: pivots, error: pivErr } = await supabase
    .from("collection_products")
    .select("collection_id")
    .in("collection_id", ids);

  if (pivErr)
    return NextResponse.json({ error: pivErr.message }, { status: 500 });

  const counts = new Map<string, number>();
  for (const p of pivots ?? [])
    counts.set(p.collection_id, (counts.get(p.collection_id) ?? 0) + 1);

  const collections = cols.map((c) => ({
    ...c,
    product_count: counts.get(c.id) ?? 0,
  }));
  return NextResponse.json({ collections });
}
