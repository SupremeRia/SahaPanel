import { Plus } from "lucide-react";
import { createTask, updateTaskStatus } from "@/app/actions";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations, taskStatuses } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge, Field, PageHeader, Panel, buttonClass, inputClass } from "@/components/ui";

export default async function TasksPage() {
  const { supabase, profile } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);
  const [{ data: tasks }, { data: profiles }, { data: shifts }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, assignee:profiles!tasks_assigned_to_fkey(full_name), shifts(shift_date, starts_at, ends_at)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("is_active", true).order("full_name"),
    supabase.from("shifts").select("id, shift_date, starts_at, ends_at, profiles(full_name)").order("shift_date", { ascending: false }).limit(30)
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader title="Gorevler" description="Gorevleri personele veya vardiyaya atayin, durumlarini takip edin." />

      {canManage ? (
        <Panel>
          <form action={createTask} className="grid gap-4 xl:grid-cols-6 xl:items-end">
            <Field label="Gorev basligi">
              <input name="title" className={inputClass} required />
            </Field>
            <Field label="Personel">
              <select name="assigned_to" className={inputClass} defaultValue="">
                <option value="">Secilmedi</option>
                {profiles?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vardiya">
              <select name="shift_id" className={inputClass} defaultValue="">
                <option value="">Secilmedi</option>
                {shifts?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {formatDate(item.shift_date)} {item.starts_at}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Son tarih">
              <input name="due_date" type="date" className={inputClass} />
            </Field>
            <Field label="Aciklama">
              <input name="description" className={inputClass} />
            </Field>
            <button className={buttonClass}>
              <Plus className="h-4 w-4" aria-hidden />
              Ekle
            </button>
          </form>
        </Panel>
      ) : null}

      <div className="grid gap-4">
        {tasks?.map((task: any) => (
          <Panel key={task.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink">{task.title}</h2>
                  <Badge tone={task.status === "Tamamlandi" ? "green" : task.status === "Yapiliyor" ? "blue" : "amber"}>
                    {task.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{task.description || "Aciklama yok."}</p>
                <p className="mt-3 text-xs text-slate-500">
                  Atanan: {task.assignee?.full_name ?? "Vardiya/genel"} - Son tarih: {formatDate(task.due_date)}
                </p>
              </div>
              <form action={updateTaskStatus} className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <input type="hidden" name="task_id" value={task.id} />
                <select name="status" className={inputClass} defaultValue={task.status}>
                  {taskStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className={buttonClass}>Guncelle</button>
              </form>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
