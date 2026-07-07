import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-lg border border-line bg-white p-4 shadow-sm", className)}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    green: "bg-brand-50 text-brand-700",
    amber: "bg-amber-500/10 text-amber-500",
    red: "bg-signal-red/10 text-signal-red",
    blue: "bg-signal-blue/10 text-signal-blue"
  };

  return <span className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "focus-ring min-h-10 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400";

export const buttonClass =
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700";

export const secondaryButtonClass =
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-field";
