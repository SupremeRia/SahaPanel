"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  Gauge,
  Menu,
  ShieldCheck,
  Siren,
  UserCheck,
  UserRound,
  UsersRound
} from "lucide-react";
import { Modal, useDisclosure } from "@/components/modal";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType; managerOnly?: boolean };

const items: NavItem[] = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Gauge },
  { href: "/announcements", label: "Duyurular", icon: Bell },
  { href: "/tasks", label: "Görevler", icon: ClipboardList },
  { href: "/faults", label: "Arızalar", icon: Siren },
  { href: "/shifts", label: "Vardiyalar", icon: CalendarDays },
  { href: "/registrations", label: "Kayıt İstekleri", icon: UserCheck, managerOnly: true },
  { href: "/personnel", label: "Personeller", icon: UsersRound, managerOnly: true },
  { href: "/admin", label: "Yetkili", icon: ShieldCheck, managerOnly: true },
  { href: "/profile", label: "Profil", icon: UserRound }
];

function useVisible(isManager: boolean) {
  return items.filter((item) => !item.managerOnly || isManager);
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavList({ isManager }: { isManager: boolean }) {
  const pathname = usePathname();
  const visible = useVisible(isManager);
  return (
    <nav className="mt-8 grid gap-1">
      {visible.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                : "text-muted hover:bg-surface-2 hover:text-ink"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ isManager }: { isManager: boolean }) {
  const pathname = usePathname();
  const visible = useVisible(isManager).slice(0, 5);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 px-1 py-1.5 backdrop-blur lg:hidden">
      {visible.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] font-medium transition",
              active ? "text-brand-700 dark:text-brand-200" : "text-muted-2 hover:text-ink"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Mobil basliktan acilan tam menu (alt cubukta yer olmayan sayfalara — ozellikle
// yetkili ekranlarina — erisim icin).
export function MobileMenu({ isManager }: { isManager: boolean }) {
  const pathname = usePathname();
  const { open, onOpen, onClose } = useDisclosure();
  const visible = useVisible(isManager);
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <Modal open={open} onClose={onClose} title="Menü" size="sm">
        <nav className="grid gap-1">
          {visible.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      </Modal>
    </>
  );
}
