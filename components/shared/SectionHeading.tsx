"use client";

import { cn } from "@/lib/utils";
import { useReveal } from "@/lib/useReveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(shown ? "animate-m-fade-up" : "opacity-0", center && "text-center", className)}
    >
      {eyebrow && (
        <span className="text-overline uppercase text-brand">{eyebrow}</span>
      )}
      <h2 className="mt-1 bg-gradient-to-br from-primary-900 to-primary-600 bg-clip-text text-[1.75rem] font-extrabold tracking-[-0.02em] text-transparent md:text-h2">
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-2 text-body-md text-text-secondary", center && "mx-auto max-w-xl")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
