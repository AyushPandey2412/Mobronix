"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  q: string;
  a: string;
}

export function Accordion({ items, className }: { items: AccordionItemData[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="overflow-hidden rounded-lg border border-border bg-surface">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-body-md font-semibold text-text-primary">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-brand transition-transform duration-fast",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="animate-m-fade">
                <p className="px-4 pb-4 text-body-sm leading-relaxed text-text-secondary">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
