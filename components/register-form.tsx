"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, UserPlus, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Field, buttonClass, inputClass, labelClass, secondaryButtonClass, selectClass } from "@/components/ui";
import { cn } from "@/lib/utils";

type DepartmentOption = { id: string; name: string };

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function RegisterForm({
  departments,
  onSwitchToLogin
}: {
  departments: DepartmentOption[];
  onSwitchToLogin?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("İsim soyisim zorunludur.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          department_id: departmentId || null
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      setError(
        signUpError.message.toLowerCase().includes("registered")
          ? "Bu e-posta ile zaten bir kayıt var."
          : "Kayıt oluşturulamadı. Bilgileri kontrol edip tekrar deneyin."
      );
      return;
    }

    // E-posta dogrulamasi kapaliysa Supabase otomatik oturum acar; kullanicinin
    // onaysiz sekilde panele girmemesi icin oturumu hemen kapatiyoruz.
    if (data.session) await supabase.auth.signOut();

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 shadow-card text-center">
        <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-brand-500/12 text-brand-700 dark:text-brand-200">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink">Kaydınız alındı</h2>
        <p className="mt-2 text-sm text-muted">
          Talebiniz yetkiliye iletildi. Onaylandıktan sonra e-posta ve şifrenizle giriş yapabilirsiniz.
        </p>
        <button type="button" onClick={onSwitchToLogin} className={cn(secondaryButtonClass, "mt-5 w-full")}>
          Giriş ekranına dön
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-line bg-surface p-6 shadow-card">
      <h2 className="text-2xl font-semibold text-ink">Kayıt ol</h2>
      <p className="mt-1 text-sm text-muted">Bilgilerinizi girin; yetkili onayından sonra giriş yapabilirsiniz.</p>

      <div className="mt-6 grid gap-4">
        <Field label="E-posta">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
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

        <Field label="İsim soyisim">
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
            <input
              className={cn(inputClass, "pl-9")}
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              placeholder="Ad Soyad"
              required
            />
          </div>
        </Field>

        <Field label="Telefon numarası">
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
            <input
              className={cn(inputClass, "pl-9")}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              placeholder="05xx xxx xx xx"
              required
            />
          </div>
        </Field>

        <Field label="Çalıştığı departman">
          <select
            className={selectClass}
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            required
          >
            <option value="" disabled>
              Departman seçin
            </option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </Field>

        <label className={labelClass}>
          <span>Şifre</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
            <input
              className={cn(inputClass, "pl-9 pr-10")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="En az 6 karakter"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="focus-ring absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-2 transition hover:bg-surface-2 hover:text-ink"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </label>

        <Field label="Şifre (tekrar)">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden />
            <input
              className={cn(inputClass, "pl-9")}
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              placeholder="Şifreyi tekrar girin"
              required
            />
          </div>
        </Field>
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
        {loading ? <Spinner /> : <UserPlus className="h-4 w-4" aria-hidden />}
        {loading ? "Kaydınız oluşturuluyor..." : "Kayıt ol"}
      </button>
    </form>
  );
}
