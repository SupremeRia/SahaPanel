"use client";

import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { cn } from "@/lib/utils";

type DepartmentOption = { id: string; name: string };
type Mode = "login" | "register";

export function AuthTabs({ departments, mode = "login" }: { departments: DepartmentOption[]; mode?: Mode }) {
  const tab = (value: Mode, label: string) => {
    const active = mode === value;
    return (
      <Link
        href={value === "login" ? "/login" : "/login?mode=register"}
        role="tab"
        aria-selected={active}
        className={cn(
          "focus-ring flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold transition",
          active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <div role="tablist" className="mb-4 flex gap-1 rounded-lg border border-line bg-surface-2 p-1">
        {tab("login", "Giriş yap")}
        {tab("register", "Kayıt ol")}
      </div>
      {mode === "login" ? <LoginForm /> : <RegisterForm departments={departments} />}
    </div>
  );
}