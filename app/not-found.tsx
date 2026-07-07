import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui";

export const metadata = { title: "Sayfa bulunamadı" };

// 404 sayfasi. Sunucu bileseni.
export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
          <Compass className="h-7 w-7" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-200">404</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Sayfa bulunamadı</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>
        <Link href="/dashboard" className={`${buttonClass} mt-6`}>
          Panoya dön
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
