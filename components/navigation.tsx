import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canManageAdmin, roleLabels } from "@/lib/types";
import { Avatar } from "@/components/ui";
import { MobileNav, NavList } from "@/components/nav-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/actions";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentProfile();
  if (!profile?.is_active) redirect("/login");
  const isAdmin = canManageAdmin(profile.role);

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavList isAdmin={isAdmin} />
        </div>
        <div className="mt-4 rounded-lg border border-line bg-surface-2 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={profile.full_name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{profile.full_name}</p>
              <p className="truncate text-xs text-muted">
                {roleLabels[profile.role]}
                {profile.title ? ` · ${profile.title}` : ""}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <form action={signOut} className="mt-3">
            <button className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink">
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Avatar name={profile.full_name} size="sm" />
        </div>
      </header>

      <main className="px-4 pb-24 pt-5 lg:ml-72 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <MobileNav isAdmin={isAdmin} />
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="focus-ring flex items-center gap-3 rounded-md">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 font-bold text-white shadow-sm">SP</div>
      {compact ? (
        <p className="text-lg font-bold text-ink">SahaPanel</p>
      ) : (
        <div>
          <p className="text-lg font-bold text-ink">SahaPanel</p>
          <p className="text-xs text-muted">İş takip ve vardiya sistemi</p>
        </div>
      )}
    </Link>
  );
}
