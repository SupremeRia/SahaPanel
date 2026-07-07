import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAdmin, type ShiftWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { ShiftsClient } from "./shifts-client";

export const metadata = { title: "Vardiyalar" };

export default async function ShiftsPage() {
  const { supabase, profile } = await getCurrentProfile();
  const isAdmin = canManageAdmin(profile?.role);

  const query = supabase
    .from("shifts")
    .select("*, profiles(full_name)")
    .order("shift_date", { ascending: false });
  const { data: shifts } = isAdmin ? await query : await query.eq("profile_id", profile?.id ?? "");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={CalendarDays}
        title="Vardiyalar"
        description="Personel bazlı çalışma, izin ve not bilgilerini liste ya da takvim görünümünde takip edin."
      />
      <ShiftsClient
        shifts={(shifts ?? []) as unknown as ShiftWithRelations[]}
        profiles={profiles ?? []}
        isAdmin={isAdmin}
      />
    </div>
  );
}
