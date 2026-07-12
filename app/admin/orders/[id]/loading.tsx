import { Skeleton } from "@/components/ui/Skeleton";

export default function OrderLoading() {
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3"><Skeleton className="h-4 w-16"/><Skeleton className="h-4 w-4"/><Skeleton className="h-6 w-48"/></div>
      <div className="rounded-xl border border-border bg-surface p-5"><Skeleton className="h-4 w-32 mb-4"/><div className="flex items-center gap-1">{Array.from({length:5}).map((_,i)=><><Skeleton key={i} className="h-7 w-7 rounded-full"/>{i<4&&<Skeleton className="flex-1 h-0.5"/>}</>)}</div></div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border bg-surface p-5 space-y-3"><Skeleton className="h-4 w-24 mb-2"/>{Array.from({length:6}).map((_,i)=><div key={i} className="flex justify-between"><Skeleton className="h-3 w-16"/><Skeleton className="h-3 w-24"/></div>)}</div>
        <div className="rounded-xl border border-border bg-surface p-5 space-y-3"><Skeleton className="h-4 w-16 mb-2"/><div className="rounded-lg bg-neutral-50 border border-border p-3 space-y-2"><Skeleton className="h-4 w-40"/><Skeleton className="h-3 w-28"/></div></div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4"><Skeleton className="h-4 w-28"/><div className="grid sm:grid-cols-2 gap-4"><Skeleton className="h-10 rounded-md"/><Skeleton className="h-10 rounded-md"/></div><Skeleton className="h-16 rounded-md"/><Skeleton className="h-10 w-32 rounded-md"/></div>
    </div>
  );
}
