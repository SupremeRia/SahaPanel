"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { buttonClass } from "@/components/ui";

// Pano rotalari icin hata siniri. Bir sey ters gittiginde kullaniciya gosterilir.
export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Gelistirme sirasinda hatayi konsola yaz; production'da izleme aracina gidebilir.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-signal-red/12 text-signal-red dark:bg-signal-red/20 dark:text-red-300">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="text-xl font-semibold text-ink">Bir şeyler ters gitti.</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin; sorun sürerse birazdan yeniden
          yükleyin.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted-2">Hata kodu: {error.digest}</p>
        ) : null}
        <button type="button" onClick={() => reset()} className={`${buttonClass} mt-6`}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
