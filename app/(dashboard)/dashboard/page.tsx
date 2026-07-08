import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Gauge,
  ShieldCheck,
  Siren,
  UserRound,
  Users,
  Wifi
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import {
  canManageAdmin,
  canManageOperations,
  faultCategories,
  faultCategoryLabels,
  faultStatuses,
  faultStatusLabels,
  faultStatusTone,
  roleLabels,
  taskStatuses,
  taskStatusLabels,
  taskStatusTone,
  type FaultCategory,
  type FaultStatus,
  type ShiftWithRelations,
  type TaskWithRelations,
  type Tone,
  type UserRole
} from "@/lib/types";
import { formatDate, formatTime, greeting, isOverdue, timeAgo } from "@/lib/utils";
import {
  Avatar,
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  SectionTitle,
  StatCard,
  ghostButtonClass
} from "@/components/ui";
import { DashboardCharts, type BarItem } from "./dashboard-charts";

export const metadata = { title: "Ana Sayfa" };

type FaultBreakdownRow = { status: FaultStatus; category: FaultCategory };
type AnnouncementCard = {
  id: string;
  title: string;
  pinned: boolean;
  created_at: string;
  profiles?: { full_name: string } | null;
};
type OnlinePerson = { id: string; full_name: string; role: UserRole; title: string | null };

// Bir kullanicinin heartbeat'i bu sureden eski ise cevrimdisi sayilir (kapanan sekme vb.).
const ONLINE_THRESHOLD_MS = 3 * 60 * 1000;

export default async function DashboardPage() {
  const { supabase, profile, user } = await getCurrentProfile();
  const canManage = canManageOperations(profile?.role);
  const isAdmin = canManageAdmin(profile?.role);
  const today = new Date().toISOString().slice(0, 10);
  const onlineSince = new Date(new Date().getTime() - ONLINE_THRESHOLD_MS).toISOString();

  const [
    { count: openTaskCount },
    { count: openFaultCount },
    { count: announcementCount },
    { count: readAnnouncementCount },
    { count: activePersonnelCount },
    { data: shiftsData },
    { data: tasksData },
    { data: faultsData },
    { data: announcementsData },
    { data: onlineData }
  ] = await Promise.all([
    supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Tamamlandi"),
    supabase.from("faults").select("*", { count: "exact", head: true }).neq("status", "Cozuldu"),
    supabase.from("announcements").select("*", { count: "exact", head: true }),
    supabase
      .from("announcement_reads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("shifts")
      .select("id, shift_date, starts_at, ends_at, is_leave, profiles(full_name)")
      .gte("shift_date", today)
      .order("shift_date", { ascending: true })
      .limit(6),
    supabase
      .from("tasks")
      .select("id, status, priority, due_date, title, assigned_to, assignee:profiles!tasks_assigned_to_fkey(full_name)"),
    supabase.from("faults").select("id, status, severity, category"),
    supabase
      .from("announcements")
      .select("id, title, pinned, created_at, profiles!announcements_created_by_fkey(full_name)")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("profiles")
      .select("id, full_name, role, title")
      .eq("is_active", true)
      .eq("is_online", true)
      .gte("last_seen_at", onlineSince)
      .order("full_name")
  ]);

  const onlinePeople = (onlineData ?? []) as OnlinePerson[];

  // Okunmamış duyuru = toplam duyuru - kullanıcının okuduğu duyurular (kullanıcı bazlı)
  const unreadAnnouncementCount = Math.max(0, (announcementCount ?? 0) - (readAnnouncementCount ?? 0));

  const shifts = (shiftsData ?? []) as unknown as ShiftWithRelations[];
  const allTasks = (tasksData ?? []) as unknown as TaskWithRelations[];
  const allFaults = (faultsData ?? []) as unknown as FaultBreakdownRow[];
  const announcements = (announcementsData ?? []) as unknown as AnnouncementCard[];

  // Geciken görevler (son tarihi geçmiş, tamamlanmamış)
  const overdueTasks = allTasks
    .filter((task) => isOverdue(task.due_date, task.status === "Tamamlandi"))
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
    .slice(0, 6);

  // Grafik verileri (sunucuda topla, düz dizi olarak geç)
  const taskStatusItems: BarItem[] = taskStatuses.map((status) => ({
    label: taskStatusLabels[status],
    value: allTasks.filter((task) => task.status === status).length,
    tone: taskStatusTone[status]
  }));

  const faultStatusItems: BarItem[] = faultStatuses.map((status) => ({
    label: faultStatusLabels[status],
    value: allFaults.filter((fault) => fault.status === status).length,
    tone: faultStatusTone[status]
  }));

  const categoryPalette: Tone[] = ["blue", "purple", "amber", "green", "neutral", "red"];
  const faultCategoryItems: BarItem[] = faultCategories
    .map((category) => ({ category, value: allFaults.filter((fault) => fault.category === category).length }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((item, index) => ({
      label: faultCategoryLabels[item.category],
      value: item.value,
      tone: categoryPalette[index % categoryPalette.length]
    }));

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const roleDescription = isAdmin
    ? "Yönetici olarak duyuru, görev ve arıza akışlarını yönetebilir; vardiya, personel ve departman ayarlarını düzenleyebilirsiniz."
    : canManage
      ? "Takım lideri olarak duyuru, görev ve arıza akışlarını yönetebilir, ekibi yönlendirebilirsiniz."
      : "Duyuruları okuyabilir, size atanan görevleri takip edebilir ve arıza bildirimi oluşturabilirsiniz.";

  return (
    <div className="grid gap-6">
      <PageHeader
        icon={Gauge}
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description="Saha operasyonunun güncel özetine göz atın; görev, arıza, vardiya ve duyurular tek bakışta."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Açık görev"
          value={openTaskCount ?? 0}
          icon={ClipboardList}
          tone="blue"
          href="/tasks"
          hint={overdueTasks.length ? `${overdueTasks.length} geciken görev` : "Takipte"}
        />
        <StatCard
          label="Açık arıza"
          value={openFaultCount ?? 0}
          icon={Siren}
          tone="red"
          href="/faults"
          hint="Çözüm bekliyor"
        />
        <StatCard
          label="Yaklaşan vardiya"
          value={shifts.length}
          icon={CalendarDays}
          tone="green"
          href="/shifts"
          hint={`${activePersonnelCount ?? 0} aktif personel`}
        />
        <StatCard
          label="Yeni duyuru"
          value={unreadAnnouncementCount}
          icon={Bell}
          tone="purple"
          href="/announcements"
          hint={unreadAnnouncementCount ? "Okunmamış duyuru" : "Tümü okundu"}
        />
      </div>

      <DashboardCharts
        taskStatus={taskStatusItems}
        faultStatus={faultStatusItems}
        faultCategory={faultCategoryItems}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionTitle
            title="Geciken görevler"
            description="Son tarihi geçmiş, tamamlanmamış görevler"
            action={overdueTasks.length ? <Badge tone="red">{overdueTasks.length}</Badge> : undefined}
          />
          {overdueTasks.length ? (
            <div className="grid gap-2">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{task.title}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-2">
                      <UserRound className="h-3.5 w-3.5" aria-hidden />
                      {task.assignee?.full_name ?? "Atanmamış"}
                    </p>
                  </div>
                  <Badge tone="red">{formatDate(task.due_date)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Geciken görev yok"
              description="Tüm görevler zamanında ilerliyor, böyle devam!"
            />
          )}
        </Panel>

        <Panel>
          <SectionTitle
            title="Yaklaşan vardiyalar"
            description="Bugün ve sonrası için planlananlar"
            action={
              <Badge tone="blue" dot>
                Canlı takip
              </Badge>
            }
          />
          {shifts.length ? (
            <div className="grid gap-2">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{shift.profiles?.full_name ?? "Personel"}</p>
                    <p className="mt-0.5 text-xs text-muted-2">
                      {formatDate(shift.shift_date)} · {formatTime(shift.starts_at)}–{formatTime(shift.ends_at)}
                    </p>
                  </div>
                  <Badge tone={shift.is_leave ? "amber" : "green"}>
                    {shift.is_leave ? "İzinli" : "Vardiyada"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Yaklaşan vardiya yok"
              description="Planlanmış yaklaşan bir vardiya bulunmuyor."
            />
          )}
        </Panel>
      </div>

      <Panel>
        <SectionTitle
          title="Çevrimiçi Personeller"
          description="Panele şu anda giriş yapmış olan ekip üyeleri"
          action={
            onlinePeople.length ? (
              <Badge tone="green" dot>
                {onlinePeople.length} çevrimiçi
              </Badge>
            ) : undefined
          }
        />
        {onlinePeople.length ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {onlinePeople.map((person) => (
              <div key={person.id} className="flex items-center gap-3 rounded-md border border-line p-3">
                <div className="relative shrink-0">
                  <Avatar name={person.full_name} size="sm" />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand-500"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{person.full_name}</p>
                  <p className="truncate text-xs text-muted-2">
                    {roleLabels[person.role]}
                    {person.title ? ` · ${person.title}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wifi}
            title="Şu anda çevrimiçi personel yok"
            description="Panele giriş yapan ekip üyeleri burada görünecek."
          />
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SectionTitle
            title="Son duyurular"
            description="En güncel üç duyuru"
            action={
              <Link href="/announcements" className={ghostButtonClass}>
                Tümü
              </Link>
            }
          />
          {announcements.length ? (
            <div className="grid gap-2">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-md border border-line p-3">
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium text-ink">{announcement.title}</p>
                    {announcement.pinned ? (
                      <Badge tone="amber" dot>
                        Sabit
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-2">
                    {announcement.profiles?.full_name ?? "Sistem"} · {timeAgo(announcement.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="Duyuru yok"
              description="Henüz yayınlanmış bir duyuru bulunmuyor."
            />
          )}
        </Panel>

        <Panel className="border-brand-600 bg-brand-600 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Rol yetkiniz</h2>
              <p className="text-xs text-white/70">{profile?.role ? roleLabels[profile.role] : "Misafir"}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/85">{roleDescription}</p>
          <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-3 text-sm text-white/80">
            <Users className="h-4 w-4" aria-hidden />
            <span>
              <span className="font-semibold text-white">{activePersonnelCount ?? 0}</span> aktif personel
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
