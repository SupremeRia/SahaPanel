"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Field, buttonClass, inputClass, labelClass, secondaryButtonClass } from "@/components/ui";
import { cn } from "@/lib/utils";

// Auth katmanindan gelen hatayi kullaniciya uygun mesaja cevir.
function describeSignInError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  // E-posta dogrulanmamis: bu panelde giris, yetkili onayindan sonra acilir.
  if (m.includes("not confirmed") || m.includes("email not confirmed")) {
    return "Girişiniz henüz etkin değil. Kaydınız yetkili tarafından onaylandıktan sonra tekrar deneyin.";
  }
  return "E-posta veya şifre hatalı.";
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function LoginForm({ onBack }: { onBack?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError(describeSignInError(signInError.message));
      return;
    }

    // Tam sayfa yönlendirme kullanıyoruz: taze oturum çerezi üst düzey istekle
    // birlikte sunucuya gider; proxy (middleware) oturumu görüp bizi panele alır.
    // Önceki router.replace()+router.refresh() akışı, çerez yazımı ile RSC
    // getirmesi yarıştığı için "girişe takılı kalma / yenilemeden geçmeme"
    // sorununa yol açıyordu. Çevrimiçi durumu paneldeki PresenceHeartbeat tazeler.
    window.location.assign("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-line bg-surface p-6 shadow-card">
      <h2 className="text-2xl font-semibold text-ink">Giriş yap</h2>
      <p className="mt-1 text-sm text-muted">Ekip hesabınızla devam edin.</p>

      <div className="mt-6 grid gap-4">
        <Field label="E-posta">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
              aria-hidden
            />
            <input
              className={cn(inputClass, "pl-9")}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="ornek@aytemiz.com"
              required
            />
          </div>
        </Field>

        <label className={labelClass}>
          <span>Şifre</span>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
              aria-hidden
            />
            <input
              className={cn(inputClass, "pl-9 pr-10")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="focus-ring absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-2 transition hover:bg-surface-2 hover:text-ink"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-signal-red/30 bg-signal-red/10 px-3 py-2 text-sm font-medium text-signal-red dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button className={cn(buttonClass, "mt-6 w-full")} disabled={loading} aria-busy={loading}>
        {loading ? <Spinner /> : <LogIn className="h-4 w-4" aria-hidden />}
        {loading ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>

      {onBack ? (
        <button type="button" onClick={onBack} className={cn(secondaryButtonClass, "mt-3 w-full")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Geri Dön
        </button>
      ) : null}
    </form>
  );
}
