import { Skeleton } from "@/components/ui/Skeleton";

export default function TrackLoading() {
  return (
    <div className="container-app mx-auto max-w-2xl pb-24 pt-2 md:pb-12">
      <div className="flex items-center gap-3 py-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Search card */}
      <div className="mt-2 space-y-4 rounded-xl border border-border bg-surface p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 flex-1 rounded-md" />
          <Skeleton className="h-12 w-full rounded-md sm:w-32" />
        </div>
      </div>

      {/* Current enquiry */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
