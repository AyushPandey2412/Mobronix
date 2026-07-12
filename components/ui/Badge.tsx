import { cn } from "@/lib/utils";

type Intent = "neutral" | "brand" | "success" | "warning" | "error" | "info";

const intents: Record<Intent, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  brand: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  error: "bg-error-50 text-error-700",
  info: "bg-primary-50 text-primary-700",
};

export function Badge({
  intent = "neutral",
  className,
  children,
  icon,
}: {
  intent?: Intent;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold",
        intents[intent],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
