// src/app/api/admin/coupons/route.ts (Node runtime de préférence)
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const bodySchema = z.object({
  code: z.string().min(3),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime(),
});

export async function POST(req: Request) {
  const supabase = getServerSupabase();

  // 1) Auth via cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2) Vérifie rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3) Valide entrée
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 4) Écrit avec service_role (bypass RLS)
  const { error } = await supabaseAdmin
    .from("coupons")
    .upsert([parsed.data], { onConflict: "code" });

  if (error) {
    return NextResponse.json(
      { error: "DB error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
