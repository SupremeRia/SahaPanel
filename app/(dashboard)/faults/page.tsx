import { Siren } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, type FaultWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { FaultsClient } from "./faults-client";

export const metadata = { title: "Arızalar" };

export default async function FaultsPage() {
  const { supabase, profile, user } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);

  const { data: faults } = await supabase
    .from("faults")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Siren}
        title="Arızalar"
        description="Sahadan gelen arıza kayıtlarını kategori, önem ve durum bazlı takip edin."
      />
      <FaultsClient
        faults={(faults ?? []) as unknown as FaultWithRelations[]}
        canManage={canManage}
        currentUserId={user.id}
      />
    </div>
  );
}
