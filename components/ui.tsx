import Link from "next/link";
import { cn, initials } from "@/lib/utils";
import type { Tone } from "@/lib/types";

// ---------------------------------------------------------------------------
// Ortak sinif dizeleri (client/server her yerde kullanilabilir)
// ---------------------------------------------------------------------------
export const inputClass =
  "focus-ring min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted-2 transition";

export const selectClass = cn(inputClass, "cursor-pointer");

export const textareaClass = cn(inputClass, "min-h-24 resize-y leading-6");

export const labelClass = "grid gap-1.5 text-sm font-medium text-ink";

export const buttonClass =
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClass =
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-signal-red/30 bg-signal-red/10 px-4 py-2 text-sm font-semibold text-signal-red transition hover:bg-signal-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300";

export const ghostButtonClass =
  "focus-ring inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink";

export const iconButtonClass =
  "focus-ring inline-grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink";

// ---------------------------------------------------------------------------
// Sayfa basligi
// ---------------------------------------------------------------------------
export function PageHeader({
  title,
  description,
  action,
  icon: Icon
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel / kart
// ---------------------------------------------------------------------------
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-line bg-surface p-4 shadow-card", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rozet
// ---------------------------------------------------------------------------
const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300",
  green: "bg-brand-500/12 text-brand-700 dark:bg-brand-400/15 dark:text-brand-200",
  amber: "bg-amber-500/12 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300",
  red: "bg-signal-red/12 text-signal-red dark:bg-signal-red/20 dark:text-red-300",
  blue: "bg-signal-blue/12 text-signal-blue dark:bg-signal-blue/20 dark:text-sky-300",
  purple: "bg-signal-purple/12 text-signal-purple dark:bg-signal-purple/20 dark:text-violet-300"
};

const dotClasses: Record<Tone, string> = {
  neutral: "bg-slate-400",
  green: "bg-brand-500",
  amber: "bg-amber-500",
  red: "bg-signal-red",
  blue: "bg-signal-blue",
  purple: "bg-signal-purple"
};

export function Badge({
  children,
  tone = "neutral",
  dot = false
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone]
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form alani
// ---------------------------------------------------------------------------
export function Field({
  label,
  children,
  hint,
  error
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={labelClass}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-normal text-signal-red dark:text-red-300">{error}</span> : null}
      {hint && !error ? <span className="text-xs font-normal text-muted-2">{hint}</span> : null}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Istatistik karti
// ---------------------------------------------------------------------------
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  hint,
  href
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  tone?: Tone;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <Panel className={cn("h-full transition", href && "hover:border-brand-200 hover:shadow-panel")}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
          {hint ? <p className="mt-1 truncate text-xs text-muted-2">{hint}</p> : null}
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Panel>
  );
  return href ? (
    <Link href={href} className="focus-ring block rounded-xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ---------------------------------------------------------------------------
// Bos durum
// ---------------------------------------------------------------------------
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line bg-surface-2/50 px-6 py-12 text-center">
      {Icon ? (
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-surface text-muted-2 shadow-sm">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
export function Avatar({ name, size = "md" }: { name?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl"
  };
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white",
        sizes[size]
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Ilerleme cubugu
// ---------------------------------------------------------------------------
export function ProgressBar({ value, max, tone = "green" }: { value: number; max: number; tone?: Tone }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all", dotClasses[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
