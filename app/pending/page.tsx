import { redirect } from "next/navigation";
import { Clock, ShieldX } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Onay bekleniyor" };

export default async function PendingPage() {
  // getCurrentProfile, oturum yoksa /login'e yonlendirir.
  const { profile } = await getCurrentProfile();
  if (profile?.is_active) redirect("/dashboard");

  const rejected = profile?.registration_status === "rejected";

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 py-10">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center shadow-card">
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600 font-bold text-white">
            AP
          </div>
          <div className="text-left">
            <p className="text-base font-bold text-ink">Aytemiz Petrol</p>
            <p className="text-xs text-muted">Yakutiye Şubesi</p>
          </div>
        </div>

        <span
          className={
            "mt-4 inline-grid h-14 w-14 place-items-center rounded-full " +
            (rejected
              ? "bg-signal-red/10 text-signal-red dark:text-red-300"
              : "bg-amber-500/12 text-amber-600 dark:text-amber-300")
          }
        >
          {rejected ? <ShieldX className="h-7 w-7" aria-hidden /> : <Clock className="h-7 w-7" aria-hidden />}
        </span>

        {rejected ? (
          <>
            <h1 className="mt-5 text-xl font-semibold text-ink">Kaydınız reddedildi</h1>
            <p className="mt-2 text-sm text-muted">
              Kayıt talebiniz yetkili tarafından reddedildi. Bir hata olduğunu düşünüyorsanız lütfen ekip
              yöneticinizle iletişime geçin.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-xl font-semibold text-ink">Kaydınız onay bekliyor</h1>
            <p className="mt-2 text-sm text-muted">
              {profile?.full_name ? `${profile.full_name}, ` : ""}kayıt talebiniz alındı. Yetkili onayladıktan
              sonra panele giriş yapabilirsiniz. Onay sonrası bu sayfayı yenilemeniz yeterli.
            </p>
          </>
        )}

        <form action={signOut} className="mt-6">
          <button className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink">
            Çıkış yap
          </button>
        </form>
      </div>
    </main>
  );
}
