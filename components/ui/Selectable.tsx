"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** A large tappable option row used in the condition wizard. */
export function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3.5 text-left text-body-md font-medium transition-colors duration-fast",
        "transition-transform active:scale-[0.97]",
        selected
          ? "border-brand bg-primary-50 text-primary-800"
          : "border-border bg-surface text-text-primary hover:border-border-strong"
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all",
          selected ? "scale-100 bg-brand text-white" : "scale-0"
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

/** A pill toggle, used for storage / language / quick filters. */
export function Pill({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-body-sm font-semibold transition-colors duration-fast",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

/** A field that opens a bottom sheet to pick a value. */
export function SelectorRow({
  value,
  placeholder,
  onClick,
}: {
  value?: string | null;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="flex w-full items-center justify-between rounded-md border border-border-strong bg-surface px-3.5 py-3 text-left transition-colors hover:border-brand"
    >
      <span className={cn("text-body-md font-medium", value ? "text-text-primary" : "text-text-tertiary")}>
        {value || placeholder}
      </span>
      <ChevronRight className="h-5 w-5 text-text-tertiary" />
    </button>
  );
}
