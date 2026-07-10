import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default function Home() {
  if (!hasSupabaseConfig() && process.env.NODE_ENV !== "production") {
    redirect("/demo");
  }

  redirect("/dashboard");
}
