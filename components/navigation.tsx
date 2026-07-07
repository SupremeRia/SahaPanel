import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  Gauge,
  ShieldCheck,
  Siren,
  UserRound,
  UsersRound
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAdmin, roleLabels } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { signOut } from "@/app/actions";

const items = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Gauge },
  { href: "/announcements", label: "Duyurular", icon: Bell },
  { href: "/tasks", label: "Gorevler", icon: ClipboardList },
  { href: "/faults", label: "Arizalar", icon: Siren },
  { href: "/shifts", label: "Vardiyalar", icon: CalendarDays },
  { href: "/personnel", label: "Personeller", icon: UsersRound, adminOnly: true },
  { href: "/admin", label: "Yetkili", icon: ShieldCheck, adminOnly: true },
  { href: "/profile", label: "Profil", icon: UserRound }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentProfile();
  if (!profile?.is_active) redirect("/login");
  const visibleItems = items.filter((item) => !item.adminOnly || canManageAdmin(profile.role));

  return (
    <div className="min-h-screen bg-field">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white px-4 py-5 lg:block">
        <Brand />
        <nav className="mt-8 grid gap-1">
          {visibleItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-5 rounded-lg border border-line bg-field p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-brand-600 text-sm font-bold text-white">
              {initials(profile.full_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{profile.full_name}</p>
              <p className="text-xs text-slate-500">{roleLabels[profile.role]}</p>
            </div>
          </div>
          <form action={signOut} className="mt-3">
            <button className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cikis yap
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Brand compact />
          <div className="grid h-9 w-9 place-items-center rounded bg-brand-600 text-xs font-bold text-white">
            {initials(profile.full_name)}
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 pt-5 lg:ml-72 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white px-2 py-2 lg:hidden">
        {visibleItems.slice(0, 5).map((item) => (
          <NavLink key={item.href} {...item} mobile />
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded bg-brand-600 font-bold text-white">SP</div>
      {!compact ? (
        <div>
          <p className="text-lg font-bold text-ink">SahaPanel</p>
          <p className="text-xs text-slate-500">Is takip ve vardiya sistemi</p>
        </div>
      ) : (
        <p className="text-lg font-bold text-ink">SahaPanel</p>
      )}
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  mobile
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700",
        mobile && "flex-col gap-1 px-1 py-1 text-[11px]"
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}
