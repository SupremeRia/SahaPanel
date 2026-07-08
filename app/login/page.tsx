import { Bell, CalendarDays, ClipboardList, ShieldCheck, Siren } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AuthTabs } from "@/components/auth-tabs";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Giriş yap" };

const heroFeatures = [
  { icon: Bell, label: "Duyurular", hint: "Ekibe anlık bilgilendirme" },
  { icon: ClipboardList, label: "Görevler", hint: "Vardiya işlerini takip et" },
  { icon: Siren, label: "Arızalar", hint: "Saha sorunlarını raporla" },
  { icon: CalendarDays, label: "Vardiyalar", hint: "Haftalık planı görüntüle" }
];

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ mode?: string }> }) {
  const params = await searchParams;
  const mode = params?.mode === "register" ? "register" : "login";

  // Kayit formundaki departman listesi (anonim okumaya acik).
  const supabase = await createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <main className="relative min-h-screen bg-canvas">
      <ThemeToggle className="absolute right-4 top-4 z-20" />

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ------------------------------------------------------------------ */}
        {/* Sol: kurumsal marka paneli (yalnizca genis ekran)                  */}
        {/* ------------------------------------------------------------------ */}
        <aside className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:p-16">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(155deg, #7E2523 0%, #591a18 48%, #2b0d0c 100%)"
            }}
            aria-hidden
          />
          {/* Yumusak isik ve altin vurgu katmanlari */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(720px 480px at 85% -10%, rgba(212,175,55,0.16), transparent 60%), radial-gradient(640px 520px at -10% 110%, rgba(0,0,0,0.45), transparent 55%)"
            }}
            aria-hidden
          />
          {/* Ince nokta dokusu */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "22px 22px"
            }}
            aria-hidden
          />

          <div className="relative z-10 flex items-center gap-3">
            <BrandMark size="lg" />
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight">Aytemiz Petrol</p>
              <p className="text-sm text-white/70">Yakutiye Şubesi</p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="gold-hairline w-16" aria-hidden />
            <h2 className="mt-6 max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              Saha ekipleri için tek panelde düzenli iş takibi
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Duyurular, görevler, arıza bildirimleri ve vardiya planı — hepsi tek yerde,
              her cihazdan erişilebilir.
            </p>

            <ul className="mt-10 grid max-w-md grid-cols-2 gap-3">
              {heroFeatures.map(({ icon: Icon, label, hint }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-300">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="truncate text-xs text-white/60">{hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 flex items-center gap-2 text-xs text-white/55">
            <ShieldCheck className="h-4 w-4 text-gold-300" aria-hidden />
            Girişler yetkili onayı ile güvence altında.
          </p>
        </aside>

        {/* ------------------------------------------------------------------ */}
        {/* Sag: giris / kayit formu                                           */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-8">
          {/* Mobilde koyu zemine hafif derinlik */}
          <div
            className="pointer-events-none absolute inset-0 lg:hidden"
            style={{
              background:
                "radial-gradient(900px 520px at 50% -10%, rgba(154,47,44,0.20), transparent 60%)"
            }}
            aria-hidden
          />

          <div className="relative z-10 w-full max-w-md">
            {/* Mobil marka basligi (hero gizliyken) */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <BrandMark size="lg" />
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
                Aytemiz Petrol Yakutiye Şubesi
              </h1>
              <p className="mt-1.5 text-sm text-muted">Saha ekipleri için düzenli iş takibi</p>
              <div className="gold-hairline mt-5 w-24" aria-hidden />
            </div>

            {/* Genis ekranda form ustu kucuk baslik */}
            <div className="mb-6 hidden lg:block">
              <h1 className="text-2xl font-bold tracking-tight text-ink">Hoş geldiniz</h1>
              <p className="mt-1 text-sm text-muted">Devam etmek için hesabınızı seçin.</p>
            </div>

            <AuthTabs departments={departments ?? []} mode={mode} />

            <p className="mt-6 text-center text-xs text-muted-2">
              Kayıt olduktan sonra yetkili onayı ile girişiniz aktifleşir.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
