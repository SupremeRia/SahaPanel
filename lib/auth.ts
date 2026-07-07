import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileWithDepartment } from "@/lib/types";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*, departments(name)")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile: (data as ProfileWithDepartment | null) ?? null,
    supabase
  };
}
