"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref" | "children"> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-text-on-brand shadow-sm hover:bg-brand-hover active:bg-brand-active",
  secondary:
    "bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200",
  outline:
    "bg-surface text-text-primary border border-border-strong hover:bg-neutral-50 active:bg-neutral-100",
  ghost: "bg-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary",
  whatsapp: "bg-whatsapp text-white shadow-sm hover:bg-whatsapp-hover",
  danger: "bg-error-50 text-error-700 hover:bg-error-100 active:bg-error-200",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-body-sm gap-1.5 rounded-md",
  md: "h-11 px-5 text-body-sm gap-2 rounded-md",
  lg: "h-[52px] px-6 text-body-md gap-2 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      suppressHydrationWarning
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold tracking-[-0.003em] transition-colors duration-instant",
        "transition-transform active:scale-[0.98] disabled:active:scale-100",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

export default Button;
