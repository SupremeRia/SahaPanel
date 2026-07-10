"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

// FOUC (yanip sonme) olmasin diye layout <head> icine yerlestirilir.
// Kurumsal koyu tema varsayilandir; kullanici acikca "light" secmediyse koyu kalir.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('sp-theme');if(t!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("sp-theme", isDark ? "dark" : "light");
    } catch {
      // yoksay
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "focus-ring inline-grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink",
        className
      )}
      aria-label="Temayı değiştir"
      title="Temayı değiştir"
    >
      {/* Ikon tema sinifina gore CSS ile secilir; hidrasyon uyumsuzlugu olmaz */}
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden />
    </button>
  );
}
