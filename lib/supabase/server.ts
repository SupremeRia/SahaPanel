import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  const client = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware refreshes sessions.
        }
      }
    }
  });

  // @supabase/ssr'in Schema generic'i eski surumlerde dogru yayilmadigi icin
  // istemciyi acikca tiplenmis Database istemcisine ceviriyoruz.
  return client as unknown as SupabaseClient<Database>;
}
