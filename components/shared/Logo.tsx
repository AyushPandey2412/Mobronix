import { cn } from "@/lib/utils";

export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-[-0.02em]", className)}>
      {mark && (
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-[15px] font-extrabold text-white">
          M
        </span>
      )}
      <span className="text-text-primary">
        Mobronix
      </span>
    </span>
  );
}
