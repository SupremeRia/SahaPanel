import { cn } from "@/lib/utils";

// Kurumsal marka amblemi ("AP" monogrami — favicon ile ayni kimlik).
// Tum uygulamada tek gorsel dil icin login, kenar cubugu, mobil baslik ve
// bekleme ekraninda ayni bilesen kullanilir. Sunucu/istemci her yerde calisir.
const sizeMap = {
  sm: "h-9 w-9 rounded-lg text-xs",
  md: "h-10 w-10 rounded-xl text-sm",
  lg: "h-14 w-14 rounded-2xl text-xl"
} as const;

export function BrandMark({ size = "md", className }: { size?: keyof typeof sizeMap; className?: string }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center bg-gradient-to-br from-brand-500 to-brand-700 font-bold tracking-tight text-white shadow-sm ring-1 ring-gold-400/40",
        sizeMap[size],
        className
      )}
      aria-hidden
    >
      <span className="relative z-10">AP</span>
      {/* Ust-alt yumusak parlaklik: duz kutu yerine hafif hacim hissi */}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/15 to-white/10" />
    </span>
  );
}
