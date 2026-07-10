import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Servis rolu (secret) anahtariyla olusturulan yonetici istemcisi. RLS'i baypas
// eder, bu yuzden YALNIZCA sunucu tarafinda ve guvenilir islemlerde kullanilir
// (ornegin kayit onayinda kullanicinin e-postasini "dogrulanmis" isaretlemek).
//
// GUVENLIK: SUPABASE_SECRET_KEY asla istemciye sizmamali; bu dosya yalnizca
// sunucu aksiyonlarindan (app/actions.ts) import edilir. Anahtar tanimli degilse
// null doner; cagiranlar bu durumu zarifce ele almalidir.
export function createAdminClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;

  return createClient<Database>(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
