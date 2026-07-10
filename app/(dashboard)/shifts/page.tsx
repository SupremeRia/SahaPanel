import { CalendarDays } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, type ShiftBoard } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { ShiftsClient } from "./shifts-client";

export const metadata = { title: "Vardiyalar" };

export default async function ShiftsPage() {
  const { supabase, profile } = await getCurrentProfile();
  const isManager = canManageOperations(profile?.role);

  const { data: boards } = await supabase
    .from("shift_boards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={CalendarDays}
        title="Vardiyalar"
        description="Excel'den oluşturduğunuz haftalık vardiya planını görsel olarak paylaşın."
      />
      <ShiftsClient boards={(boards ?? []) as ShiftBoard[]} isManager={isManager} />
    </div>
  );
}
