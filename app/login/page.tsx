import { createClient } from "@/lib/supabase/server";
import { AuthTabs } from "@/components/auth-tabs";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Giriş yap" };

export default async function LoginPage() {
  // Kayit formundaki departman listesi (anonim okumaya acik).
  const supabase = await createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[1fr_0.9fr]">
      <section className="relative flex items-center px-6 py-10 md:px-12">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600 font-bold text-white">
              AP
            </div>
            <div>
              <p className="text-xl font-bold text-ink">Aytemiz Petrol Yakutiye Şubesi</p>
              <p className="text-sm text-muted">Saha ekipleri için düzenli iş takibi</p>
            </div>
          </div>
          <AuthTabs departments={departments ?? []} />
          <p className="mt-6 text-center text-xs text-muted-2">
            Kayıt olduktan sonra yetkili onayı ile girişiniz aktifleşir.
          </p>
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-ink px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(1200px 600px at 80% -10%, rgba(34,197,94,0.28), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(59,130,246,0.22), transparent 55%)"
          }}
          aria-hidden
        />
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-100">Operasyon paneli</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
            Duyuru, görev, arıza ve vardiya akışı tek yerde.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-200">
            WhatsApp mesaj kalabalığı yerine okunma takibi, rol bazlı yetki ve vardiya odaklı iş akışı.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-3 text-sm font-medium">
          {["Petrol istasyonu", "Market ekipleri", "Vardiyalı saha"].map((item) => (
            <div key={item} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
