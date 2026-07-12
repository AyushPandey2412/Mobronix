"use client";

import { cn } from "@/lib/utils";

/**
 * Conversion-focused sticky action bar for flow screens.
 * Sits above the mobile bottom nav; becomes an inline footer bar on desktop.
 */
export function StickyBar({
  label,
  value,
  children,
  className,
}: {
  label?: string;
  value?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Mobile: full-width action bar pinned to the very bottom (with safe-area
        // padding for home-indicator phones) so it never collides with other chrome.
        "fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface/95 px-5 pt-3 backdrop-blur-md animate-m-fade",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        // Desktop: becomes an inline, centered, rounded footer card.
        "shadow-[0_-8px_24px_rgba(16,24,40,0.06)] md:static md:mx-auto md:w-full md:max-w-content md:rounded-2xl md:border md:px-5 md:py-3 md:pb-3 md:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {(label || value) && (
          <div className="shrink-0">
            {label && <span className="block text-caption font-semibold text-text-tertiary">{label}</span>}
            {value && <span className="text-h4 font-extrabold text-text-primary tabular-nums">{value}</span>}
          </div>
        )}
        <div className="flex flex-1 justify-end gap-2">{children}</div>
      </div>
    </div>
  );
}
