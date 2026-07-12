"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** A back-button header used on inner flow screens (mobile-prominent, subtle on desktop). */
export function FlowHeader({
  title,
  back,
  onBack,
  right,
  sticky = true,
  className,
}: {
  title?: string;
  back?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    if (back) return router.push(back);
    router.back();
  };

  return (
    <div
      className={cn(
        "z-sticky flex h-14 items-center gap-3 bg-background/85 backdrop-blur-md",
        sticky && "sticky top-0 md:top-16",
        className
      )}
    >
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface text-text-primary transition-colors hover:bg-neutral-50"
      >
        <ArrowLeft className="h-[18px] w-[18px]" />
      </button>
      {title && <h1 className="flex-1 truncate text-h4 font-bold text-text-primary">{title}</h1>}
      {right}
    </div>
  );
}
