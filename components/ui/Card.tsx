"use client";

import { cn } from "@/lib/utils";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  interactive?: boolean;
  padded?: boolean;
  children?: React.ReactNode;
}

export function Card({ interactive, padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-xs",
        interactive &&
          "cursor-pointer transition-transform hover:-translate-y-1 active:scale-[0.98] hover:border-border-strong hover:shadow-sm",
        padded && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
