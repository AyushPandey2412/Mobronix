import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-md bg-neutral-200/70",
        className
      )}
    />
  );
}

/** A full-screen skeleton placeholder mirroring the app shell. */
export function ScreenSkeleton() {
  return (
    <div className="container-app space-y-4 py-6">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}
