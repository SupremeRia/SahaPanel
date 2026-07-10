import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Gauge,
  ShieldCheck,
  Siren,
  Users
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, Badge, PageHeader, Panel, SectionTitle, StatCard, ghostButtonClass } from "@/components/ui";
import { DashboardCharts, type BarItem } from "@/app/(dashboard)/dashboard/dashboard-charts";

export const metadata = { title: "Demo Önizleme" };

const taskStatus: BarItem[] = [
  { label: "Bekliyor", value: 8, tone: "amber" },
  { label: "Yapılıyor", value: 5, tone: "blue" },
  { label: "Tamamlandı", value: 17, tone: "green" }
];

const faultStatus: BarItem[] = [
  { label: "Açık", value: 4, tone: "red" },
  { label: "Servise Bildirildi", value: 2, tone: "amber" },
  { label: "Çözüldü", value: 11, tone: "green" }
];

const faultCategory: BarItem[] = [
  { label: "Pompa", value: 4, tone: "red" },
  { label: "Market", value: 3, tone: "purple" },
  { label: "Elektrik", value: 2, tone: "amber" },
  { label: "Saha", value: 1, tone: "blue" }
];

const overdueTasks = [
  { title: "Market soğutucu sıcaklık kontrolü", assignee: "Zeynep Kaya", due: "Bugün" },
  { title: "Pompa 3 çevre güvenlik şeridi", assignee: "Emre Yılmaz", due: "Dün" },
  { title: "Gece vardiyası kasa kapanışı", assignee: "Mert Arslan", due: "Dün" }
];

const shifts = [
  { name: "Ayşe Demir", time: "09:00-17:00", state: "Vardiyada" },
  { name: "Emre Yılmaz", time: "17:00-01:00", state: "Vardiyada" },
  { name: "Mert Arslan", time: "01:00-09:00", state: "Planlandı" }
];

const onlinePeople = [
  { name: "Ayşe Demir", role: "Takım Lideri" },
  { name: "Zeynep Kaya", role: "Market" },
  { name: "Emre Yılmaz", role: "Saha" },
  { name: "Mert Arslan", role: "Gece vardiyası" }
];

const demoNavItems = [
  { label: "Ana Sayfa", icon: Gauge },
  { label: "Duyurular", icon: Bell },
  { label: "Görevler", icon: ClipboardList },
  { label: "Arızalar", icon: Siren },
  { label: "Vardiyalar", icon: CalendarDays },
  { label: "Yetkili", icon: ShieldCheck }
];

const attentionItems = [
  { label: "Geciken görev", value: 3, hint: "Hemen takip edilmeli", href: "/demo", icon: Clock3 },
  { label: "Açık arıza", value: 4, hint: "Çözüm bekliyor", href: "/demo", icon: Siren },
  { label: "Okunmamış duyuru", value: 2, hint: "Ekip bilgisi var", href: "/demo", icon: Bell }
];

export default function DemoPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
        <Link href="/demo" className="focus-ring flex items-center gap-3 rounded-md">
          <BrandMark size="md" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">Aytemiz Petrol</p>
            <p className="truncate text-xs text-muted">Demo önizleme</p>
          </div>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <DemoNav />
        </div>
        <div className="mt-4 rounded-lg border border-line bg-surface-2 p-3">
          <div className="flex items-center gap-3">
            <Avatar name="Demo Yönetici" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">Demo Yönetici</p>
              <p className="truncate text-xs text-muted">Yerel önizleme</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/demo" className="focus-ring flex items-center gap-3 rounded-md">
          <BrandMark size="md" />
          <p className="text-base font-bold text-ink">Aytemiz Petrol</p>
        </Link>
        <ThemeToggle />
      </header>

      <main className="px-4 pb-24 pt-5 lg:ml-64 lg:px-6 lg:pb-8">
        <div className="mx-auto grid max-w-7xl gap-5">
          <PageHeader
            icon={Gauge}
            title="Günaydın, Demo"
            description="Saha operasyonunun güncel özetine göz atın; görev, arıza, vardiya ve duyurular tek bakışta."
            action={
              <Badge tone="blue" dot>
                Demo verisi
              </Badge>
            }
          />

          <Panel className="overflow-hidden p-0">
            <div className="grid lg:grid-cols-[0.95fr_2fr]">
              <div className="border-b border-line p-4 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-muted-2">Operasyon özeti</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">Bugünün saha nabzı</h2>
                  </div>
                  <Badge tone="red" dot>
                    9 takip
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-2">Çevrimiçi</p>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold text-ink">
                      <Activity className="h-4 w-4 text-brand-600" aria-hidden />4 personel
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-2">Aktif ekip</p>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold text-ink">
                      <Users className="h-4 w-4 text-brand-600" aria-hidden />
                      18 kişi
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-line sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {attentionItems.map(({ label, value, hint, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="focus-ring flex min-h-28 items-center justify-between gap-3 p-4 transition hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-muted-2">{label}</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
                      <p className="mt-1 truncate text-xs text-muted-2">{hint}</p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-2 text-muted">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-2" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Açık görev" value={13} icon={ClipboardList} tone="blue" hint="3 geciken görev" />
            <StatCard label="Açık arıza" value={4} icon={Siren} tone="red" hint="Çözüm bekliyor" />
            <StatCard
              label="Yaklaşan vardiya"
              value={6}
              icon={CalendarDays}
              tone="green"
              hint="18 aktif personel"
            />
            <StatCard label="Yeni duyuru" value={2} icon={Bell} tone="purple" hint="Okunmamış duyuru" />
          </div>

          <DashboardCharts taskStatus={taskStatus} faultStatus={faultStatus} faultCategory={faultCategory} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <SectionTitle
                title="Geciken görevler"
                description="Son tarihi geçmiş, tamamlanmamış görevler"
                action={<Badge tone="red">{overdueTasks.length}</Badge>}
              />
              <div className="grid gap-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted-2">{task.assignee}</p>
                    </div>
                    <Badge tone="red">{task.due}</Badge>
                  </div>
                ))}
              </div>
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
              <div className="grid gap-2">
                {shifts.map((shift) => (
                  <div
                    key={shift.name}
                    className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{shift.name}</p>
                      <p className="mt-0.5 text-xs text-muted-2">{shift.time}</p>
                    </div>
                    <Badge tone={shift.state === "Vardiyada" ? "green" : "amber"}>{shift.state}</Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel>
              <SectionTitle
                title="Çevrimiçi Personeller"
                description="Panele şu anda giriş yapmış olan ekip üyeleri"
                action={
                  <Badge tone="green" dot>
                    4 çevrimiçi
                  </Badge>
                }
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {onlinePeople.map((person) => (
                  <div
                    key={person.name}
                    className="flex items-center gap-3 border-b border-line py-2 last:border-b-0 sm:border-b-0"
                  >
                    <div className="relative shrink-0">
                      <Avatar name={person.name} size="sm" />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand-500"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{person.name}</p>
                      <p className="truncate text-xs text-muted-2">{person.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="border-brand-600 bg-brand-600 text-white">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/15">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">Rol yetkiniz</h2>
                  <p className="text-xs text-white/70">Admin</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Yönetici olarak duyuru, görev ve arıza akışlarını yönetebilir; vardiya, personel ve departman
                ayarlarını düzenleyebilirsiniz.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-3 text-sm text-white/80">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                <span>RLS ve yetki kontrolleri aktif</span>
              </div>
            </Panel>
          </div>

          <Panel>
            <SectionTitle
              title="Son duyurular"
              description="En güncel üç duyuru"
              action={
                <Link href="/demo" className={ghostButtonClass}>
                  Tümü
                </Link>
              }
            />
            <div className="grid gap-2 md:grid-cols-3">
              {[
                "Pompa bakım planı güncellendi",
                "Market stok sayımı 21:00'de",
                "Yeni vardiya görseli yüklendi"
              ].map((title, index) => (
                <div
                  key={title}
                  className="border-b border-line pb-2 last:border-b-0 md:border-b-0 md:border-r md:pr-3 md:last:border-r-0"
                >
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium text-ink">{title}</p>
                    {index === 0 ? (
                      <Badge tone="amber" dot>
                        Sabit
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-2">Sistem · az önce</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 px-1 py-1.5 backdrop-blur lg:hidden">
        {demoNavItems.slice(0, 5).map(({ label, icon: Icon }) => (
          <Link
            key={label}
            href="/demo"
            className="focus-ring flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] font-medium text-muted-2 transition hover:text-ink"
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function DemoNav() {
  return (
    <nav className="mt-7 grid gap-0.5">
      {demoNavItems.map(({ label, icon: Icon }, index) => {
        const active = index === 0;
        return (
          <Link
            key={label}
            href="/demo"
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "focus-ring flex items-center gap-3 rounded-md border-l-2 border-brand-500 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition dark:bg-brand-500/15 dark:text-brand-200"
                : "focus-ring flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
