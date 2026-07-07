import { Megaphone } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, type AnnouncementWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { AnnouncementsClient } from "./announcements-client";

export const metadata = { title: "Duyurular" };

export default async function AnnouncementsPage() {
  const { supabase, profile, user } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);

  const [{ data: announcements }, { count: totalActive }] = await Promise.all([
    supabase
      .from("announcements")
      .select("*, profiles(full_name), announcement_reads(user_id, profiles(full_name))")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true)
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Megaphone}
        title="Duyurular"
        description="Resmi ekip duyurularını paylaşın; okundu bilgisini kişi bazında takip edin."
      />
      <AnnouncementsClient
        announcements={(announcements ?? []) as unknown as AnnouncementWithRelations[]}
        canManage={canManage}
        currentUserId={user.id}
        totalActive={totalActive ?? 0}
      />
    </div>
  );
}
