"use client";

import { AlertTriangle, ClipboardList, Layers } from "lucide-react";
import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/types";

export type BarItem = { label: string; value: number; tone: Tone };

// ui.tsx içindeki dotClasses desenini yerelde tekrar ediyoruz.
const barColor: Record<Tone, string> = {
  neutral: "bg-slate-400",
  green: "bg-brand-500",
  amber: "bg-amber-500",
  red: "bg-signal-red",
  blue: "bg-signal-blue",
  purple: "bg-signal-purple"
};

function BarList({
  title,
  description,
  icon: Icon,
  items
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  items: BarItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const max = items.reduce((peak, item) => Math.max(peak, item.value), 0);

  return (
    <Panel className="h-full">
      <div className="mb-4 flex items-center gap-2">
        {Icon ? (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2 text-muted">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description ? <p className="truncate text-xs text-muted-2">{description}</p> : null}
        </div>
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted-2">Henüz veri yok.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const pct = max > 0 ? Math.round((item.value / max) * 100) : 0;
            const width = item.value > 0 ? Math.max(pct, 6) : 0;
            return (
              <div key={item.label} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink">{item.label}</span>
                  <span className="tabular-nums font-semibold text-muted">{item.value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor[item.tone])}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function DashboardCharts({
  taskStatus,
  faultStatus,
  faultCategory
}: {
  taskStatus: BarItem[];
  faultStatus: BarItem[];
  faultCategory: BarItem[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <BarList
        title="Görev durumu"
        description="Duruma göre görev dağılımı"
        icon={ClipboardList}
        items={taskStatus}
      />
      <BarList
        title="Arıza durumu"
        description="Duruma göre arıza dağılımı"
        icon={AlertTriangle}
        items={faultStatus}
      />
      <BarList
        title="Arıza kategorisi"
        description="En çok bildirilen kategoriler"
        icon={Layers}
        items={faultCategory}
      />
    </div>
  );
}
