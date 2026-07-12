import { Skeleton } from "@/components/ui/Skeleton";

export default function SellLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3 py-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>

      <Skeleton className="mt-4 h-2 w-full rounded-full" />

      <div className="mt-8 space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="mt-6 space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Skeleton className="h-11 w-32 rounded-md" />
      </div>
    </div>
  );
}
