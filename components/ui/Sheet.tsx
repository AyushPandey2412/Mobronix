"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/useFocusTrap";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-overlay flex items-end justify-center sm:items-center animate-m-fade"
      onClick={onClose}
      style={{ background: "var(--overlay-scrim)" }}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-[460px] rounded-t-2xl bg-surface px-5 pb-8 pt-3 shadow-lg sm:rounded-2xl sm:pt-5",
          "max-h-[82vh] overflow-y-auto animate-m-sheet-up sm:animate-m-zoom-in",
          className
        )}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-neutral-200 sm:hidden" />
        {title && <h3 className="mb-3 text-h4 text-text-primary">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
