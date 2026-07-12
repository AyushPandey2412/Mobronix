"use client";

import { Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast";

export function Toaster() {
  const toasts = useToast((s) => s.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-24 left-1/2 z-toast flex w-full max-w-[440px] -translate-x-1/2 flex-col items-center gap-2 px-5"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-2.5 rounded-xl bg-neutral-900 px-4 py-3 text-body-sm font-medium text-white shadow-lg",
            t.leaving ? "animate-m-toast-out" : "animate-m-fade-up"
          )}
        >
          <span
            className={
              t.tone === "success"
                ? "text-success-300"
                : t.tone === "error"
                ? "text-error-300"
                : "text-primary-300"
            }
          >
            {t.tone === "success" ? (
              <Check className="h-[18px] w-[18px]" />
            ) : t.tone === "error" ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Info className="h-[18px] w-[18px]" />
            )}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
