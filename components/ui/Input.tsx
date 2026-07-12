"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
  className?: string;
}

function FieldShell({ label, hint, error, children, className }: FieldShellProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={id} className="text-label text-text-primary">
          {label}
        </label>
      )}
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-body-sm font-medium text-error-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-body-sm text-text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const baseField =
  "w-full rounded-md border bg-surface px-3.5 text-body-md text-text-primary placeholder:text-text-tertiary " +
  "transition-shadow duration-fast focus:outline-none focus-visible:outline-none " +
  "focus:border-brand focus:shadow-focus disabled:opacity-60";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, className, containerClassName, ...props },
  ref
) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={containerClassName}>
      {(id, describedBy) => (
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={!!error}
            suppressHydrationWarning
            className={cn(
              baseField,
              "h-12",
              leftIcon && "pl-11",
              error && "border-error-300 focus:border-error-500 focus:shadow-focus-error",
              className
            )}
            {...props}
          />
        </div>
      )}
    </FieldShell>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, containerClassName, ...props },
  ref
) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={containerClassName}>
      {(id, describedBy) => (
        <textarea
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          suppressHydrationWarning
          className={cn(
            baseField,
            "min-h-[88px] resize-none py-3",
            error && "border-error-300 focus:border-error-500 focus:shadow-focus-error",
            className
          )}
          {...props}
        />
      )}
    </FieldShell>
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, containerClassName, children, ...props },
  ref
) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={containerClassName}>
      {(id, describedBy) => (
        <select
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          suppressHydrationWarning
          className={cn(baseField, "h-12 appearance-none bg-no-repeat pr-10", className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            backgroundPosition: "right 12px center",
          }}
          {...props}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
});

export default Input;
