import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-6xl fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Table + sidebar */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-4">
        {/* Table */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-neutral-50/50">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-md" />
              ))}
              <Skeleton className="h-7 w-28 rounded-md ml-auto" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="text-right space-y-1.5">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="h-20 flex items-end gap-1.5">
              {/* Deterministic heights — avoids SSR/client hydration mismatch */}
              {[34, 52, 28, 60, 40, 48, 36].map((h, i) => (
                <div key={i} className="flex-1 flex items-end" style={{ height: h }}>
                  <Skeleton className="w-full h-full rounded-t" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <Skeleton className="h-4 w-32 mb-2" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="flex-1 h-1.5 rounded-full" />
                <Skeleton className="h-3 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
