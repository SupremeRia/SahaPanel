"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function createClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseConfig();
  const client = createBrowserClient<Database>(url, anonKey);
  return client as unknown as SupabaseClient<Database>;
}
