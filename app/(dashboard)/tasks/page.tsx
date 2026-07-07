import { ClipboardList } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, type TaskWithRelations } from "@/lib/types";
import { PageHeader } from "@/components/ui";
import { TasksClient } from "./tasks-client";

export const metadata = { title: "Görevler" };

export default async function TasksPage() {
  const { supabase, profile, user } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);

  const [{ data: tasks }, { data: profiles }, { data: shifts }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, assignee:profiles!tasks_assigned_to_fkey(full_name), shifts(shift_date, starts_at, ends_at)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name"),
    supabase
      .from("shifts")
      .select("id, shift_date, starts_at, ends_at")
      .order("shift_date", { ascending: false })
      .limit(60)
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={ClipboardList}
        title="Görevler"
        description="Görevleri personele veya vardiyaya atayın, önceliklendirin ve durumlarını takip edin."
      />
      <TasksClient
        tasks={(tasks ?? []) as unknown as TaskWithRelations[]}
        profiles={profiles ?? []}
        shifts={shifts ?? []}
        canManage={canManage}
        currentUserId={user.id}
      />
    </div>
  );
}
