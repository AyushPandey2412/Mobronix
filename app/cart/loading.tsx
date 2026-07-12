import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div className="container-app mx-auto max-w-2xl py-6">
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-12 w-full rounded-md" />
    </div>
  );
}
