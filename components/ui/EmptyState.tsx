"use client";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center px-6 py-14 text-center animate-m-fade-up", className)}
    >
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-brand">
          {icon}
        </div>
      )}
      <h3 className="text-h4 text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[32ch] text-body-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
