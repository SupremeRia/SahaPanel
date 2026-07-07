import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, type Department } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { AdminClient } from "./admin-client";

export const metadata = { title: "Yetkili Paneli" };

export default async function AdminPage() {
  const { supabase, profile } = await getCurrentProfile();
  if (!canManageOperations(profile?.role)) redirect("/dashboard");

  const { data: departments } = await supabase.from("departments").select("*").order("name", { ascending: true });

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={ShieldCheck}
        title="Yetkili Paneli"
        description="Departmanları ve personel temel kayıtlarını yönetin."
      />
      <AdminClient departments={(departments ?? []) as Department[]} />
    </div>
  );
}
