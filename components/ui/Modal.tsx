"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/useFocusTrap";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
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
      className="fixed inset-0 z-modal flex items-end justify-center sm:items-center sm:p-4 animate-m-fade"
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
          "w-full max-w-[460px] rounded-t-2xl bg-surface p-5 shadow-lg sm:rounded-2xl",
          "max-h-[88vh] overflow-y-auto animate-m-zoom-in",
          className
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-h4 text-text-primary">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full text-text-tertiary hover:bg-neutral-100"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
