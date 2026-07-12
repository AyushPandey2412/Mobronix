"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  onRate,
  size = 30,
  className,
}: {
  value: number;
  onRate?: (n: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = !!onRate;
  return (
    <div className={cn("flex items-center gap-2", className)} role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-checked={filled}
            role={interactive ? "radio" : undefined}
            className={cn(
              interactive
                ? "cursor-pointer transition-transform hover:scale-110 active:scale-95"
                : "cursor-default"
            )}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                "transition-colors",
                filled ? "fill-warning-400 text-warning-400 animate-m-pop" : "fill-transparent text-neutral-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Compact read-only review stars. */
export function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= value ? "fill-warning-400 text-warning-400" : "fill-transparent text-neutral-300"
          )}
        />
      ))}
    </div>
  );
}
