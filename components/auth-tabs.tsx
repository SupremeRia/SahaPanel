"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { cn } from "@/lib/utils";

type DepartmentOption = { id: string; name: string };
type Mode = "login" | "register";

export function AuthTabs({ departments }: { departments: DepartmentOption[] }) {
  const [mode, setMode] = useState<Mode>("login");

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => setMode(value)}
      className={cn(
        "focus-ring flex-1 rounded-md px-3 py-2 text-sm font-semibold transition",
        mode === value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div role="tablist" className="mb-4 flex gap-1 rounded-lg border border-line bg-surface-2 p-1">
        {tab("login", "Giriş yap")}
        {tab("register", "Kayıt ol")}
      </div>
      {mode === "login" ? (
        <LoginForm />
      ) : (
        <RegisterForm departments={departments} onSwitchToLogin={() => setMode("login")} />
      )}
    </div>
  );
}
