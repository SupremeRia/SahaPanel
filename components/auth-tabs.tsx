"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { cn } from "@/lib/utils";

type DepartmentOption = { id: string; name: string };
type Mode = "login" | "register";
type View = "landing" | "login" | "register";

export function AuthTabs({ departments, mode = "login" }: { departments: DepartmentOption[]; mode?: Mode }) {
  // Ilk ekranda yalnizca iki buton gorunur; secime gore form yumusak acilir.
  const [view, setView] = useState<View>(mode === "register" ? "register" : "landing");
  // Gorunum degistiginde giris animasyonunu (animate-reveal) yeniden tetiklemek icin key.
  const [animKey, setAnimKey] = useState(0);

  const go = (next: View) => {
    setView(next);
    setAnimKey((k) => k + 1);
  };

  if (view === "landing") {
    return (
      <div key={animKey} className="animate-reveal grid gap-3">
        <button
          type="button"
          onClick={() => go("login")}
          className="focus-ring group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:bg-brand-500 hover:shadow-glow"
        >
          <LogIn className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Giriş Yap
        </button>
        <button
          type="button"
          onClick={() => go("register")}
          className="focus-ring group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink transition-all duration-200 hover:border-gold-400/50 hover:bg-surface-2"
        >
          <UserPlus
            className="h-4 w-4 text-gold-400 transition-transform group-hover:scale-110"
            aria-hidden
          />
          Kayıt Ol
        </button>
      </div>
    );
  }

  return (
    <div key={animKey} className="animate-reveal">
      {view === "login" ? (
        <LoginForm onBack={() => go("landing")} />
      ) : (
        <RegisterForm
          departments={departments}
          onBack={() => go("landing")}
          onSwitchToLogin={() => go("login")}
        />
      )}
    </div>
  );
}
