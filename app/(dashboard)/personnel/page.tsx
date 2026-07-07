import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canGrantAdmin, canManageOperations, type Department, type ProfileWithDepartment } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { PersonnelClient } from "./personnel-client";

export const metadata = { title: "Personeller" };

export default async function PersonnelPage() {
  const { supabase, profile } = await getCurrentProfile();
  if (!canManageOperations(profile?.role)) redirect("/dashboard");

  const [{ data: personnel }, { data: departments }] = await Promise.all([
    // Yalnizca onaylanmis personeli goster; onay bekleyenler "Kayit Istekleri"nde.
    supabase
      .from("profiles")
      .select("*, departments(name)")
      .neq("registration_status", "pending")
      .order("full_name", { ascending: true }),
    supabase.from("departments").select("id, name").order("name", { ascending: true })
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={UsersRound}
        title="Personeller"
        description="Personel rolünü, departmanını ve aktiflik durumunu yönetin."
      />
      <PersonnelClient
        personnel={(personnel ?? []) as unknown as ProfileWithDepartment[]}
        departments={(departments ?? []) as Pick<Department, "id" | "name">[]}
        canGrantAdmin={canGrantAdmin(profile?.role)}
      />
    </div>
  );
}
