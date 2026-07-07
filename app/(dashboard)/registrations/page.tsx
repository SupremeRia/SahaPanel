import { redirect } from "next/navigation";
import { UserCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import {
  canGrantAdmin,
  canManageOperations,
  type Department,
  type ProfileWithDepartment
} from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { RegistrationsClient } from "./registrations-client";

export const metadata = { title: "Kayıt İstekleri" };

export default async function RegistrationsPage() {
  const { supabase, profile } = await getCurrentProfile();
  if (!canManageOperations(profile?.role)) redirect("/dashboard");

  const [{ data: pending }, { data: departments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, departments(name)")
      .eq("registration_status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("departments").select("id, name").order("name", { ascending: true })
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={UserCheck}
        title="Kayıt İstekleri"
        description="Kaydolmak isteyen personelin taleplerini inceleyin; onaylayınca girişleri aktifleşir."
      />
      <RegistrationsClient
        pending={(pending ?? []) as unknown as ProfileWithDepartment[]}
        departments={(departments ?? []) as Pick<Department, "id" | "name">[]}
        canGrantAdmin={canGrantAdmin(profile?.role)}
      />
    </div>
  );
}
