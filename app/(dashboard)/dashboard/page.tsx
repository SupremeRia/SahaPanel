import { Bell, CalendarDays, ClipboardList, Siren } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageOperations } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge, PageHeader, Panel } from "@/components/ui";

export default async function DashboardPage() {
  const { supabase, profile } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);

  const [{ count: announcementCount }, { count: openTaskCount }, { count: openFaultCount }, { data: shifts }] =
    await Promise.all([
      supabase.from("announcements").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Tamamlandi"),
      supabase.from("faults").select("*", { count: "exact", head: true }).neq("status", "Cozuldu"),
      supabase
        .from("shifts")
        .select("*, profiles(full_name)")
        .gte("shift_date", new Date().toISOString().slice(0, 10))
        .order("shift_date", { ascending: true })
        .limit(canManage ? 6 : 3)
    ]);

  const stats = [
    { label: "Duyuru", value: announcementCount ?? 0, icon: Bell },
    { label: "Acik gorev", value: openTaskCount ?? 0, icon: ClipboardList },
    { label: "Acik ariza", value: openFaultCount ?? 0, icon: Siren },
    { label: "Yaklasan vardiya", value: shifts?.length ?? 0, icon: CalendarDays }
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Ana Sayfa"
        description="Saha operasyonunun duyuru, gorev, ariza ve vardiya ozetini hizlica kontrol edin."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Panel key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stat.value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded bg-brand-50 text-brand-700">
                <stat.icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Yaklasan vardiyalar</h2>
            <Badge tone="blue">Canli takip</Badge>
          </div>
          <div className="grid gap-3">
            {shifts?.length ? (
              shifts.map((shift: any) => (
                <div key={shift.id} className="grid gap-2 rounded-md border border-line p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-ink">{shift.profiles?.full_name ?? "Personel"}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(shift.shift_date)} - {shift.starts_at} / {shift.ends_at}
                    </p>
                  </div>
                  <Badge tone={shift.is_leave ? "amber" : "green"}>{shift.is_leave ? "Izinli" : "Vardiyada"}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Yaklasan vardiya bulunmuyor.</p>
            )}
          </div>
        </Panel>

        <Panel className="bg-ink text-white">
          <h2 className="text-lg font-semibold">Rol yetkiniz</h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {canManage
              ? "Duyuru, gorev ve ariza akislarini yonetebilirsiniz. Admin rolu vardiya ve personel ayarlarini da acabilir."
              : "Duyurulari okuyabilir, gorevlerinizi takip edebilir ve ariza bildirimi olusturabilirsiniz."}
          </p>
        </Panel>
      </div>
    </div>
  );
}
