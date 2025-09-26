// src/lib/supabase-admin.ts (service role — serveur uniquement)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/database.types";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // jamais côté client
  { auth: { persistSession: false, autoRefreshToken: false } }
);
