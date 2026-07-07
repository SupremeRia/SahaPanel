// Pano rotalari yuklenirken gosterilen iskelet. Sunucu bileseni (client degil).
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      {/* Baslik yer tutucu */}
      <div className="flex flex-col gap-3 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-surface-2" />
          <div className="space-y-2">
            <div className="h-7 w-52 rounded-md bg-surface-2" />
            <div className="h-4 w-72 rounded bg-surface-2" />
          </div>
        </div>
        <div className="h-10 w-32 rounded-md bg-surface-2" />
      </div>

      {/* Istatistik / kart izgarasi yer tutucu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="w-full space-y-3">
                <div className="h-4 w-24 rounded bg-surface-2" />
                <div className="h-8 w-16 rounded-md bg-surface-2" />
              </div>
              <div className="h-11 w-11 shrink-0 rounded-lg bg-surface-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Icerik kartlari yer tutucu */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="h-5 w-40 rounded bg-surface-2" />
              <div className="h-6 w-20 rounded-full bg-surface-2" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-surface-2" />
              <div className="h-4 w-5/6 rounded bg-surface-2" />
              <div className="h-4 w-2/3 rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
