import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = await getServerSupabase();
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  let q = supabase
    .from("products")
    .select(
      `
      *,
      images:product_images(*),
      category:categories(*)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (categorySlug) q = q.eq("category_slug", categorySlug);

  const { data, error, count } = await q.range(offset, offset + limit - 1);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data ?? [], total: count ?? 0 });
}
