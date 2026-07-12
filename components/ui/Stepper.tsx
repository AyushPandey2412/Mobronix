"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact horizontal stepper for order cards. */
export function MiniStepper({
  steps,
  shortLabels,
  current,
}: {
  steps: string[];
  shortLabels: string[];
  current: number;
}) {
  return (
    <div className="flex items-start px-1 pt-3">
      {steps.map((_, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <div key={i} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                className={cn(
                  "absolute left-[-50%] top-[13px] z-0 h-[3px] w-full",
                  i <= current ? "bg-success-500" : "bg-neutral-200"
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 grid h-[26px] w-[26px] place-items-center rounded-full text-caption font-bold",
                (isDone || isCurrent) && "animate-m-pop",
                isDone
                  ? "bg-success-500 text-white"
                  : isCurrent
                  ? "bg-primary-600 text-white ring-4 ring-primary-100"
                  : "bg-neutral-200 text-neutral-500"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "mt-1.5 px-0.5 text-center text-[9px] font-bold leading-tight",
                isCurrent ? "text-primary-700" : isDone ? "text-success-700" : "text-text-tertiary"
              )}
            >
              {shortLabels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface TimelineStep {
  title: string;
  description: string;
  extra?: React.ReactNode;
}

/** Vertical status timeline. */
export function Timeline({ steps, current }: { steps: TimelineStep[]; current: number }) {
  return (
    <div>
      {steps.map((step, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-body-sm font-bold",
                  isDone
                    ? "bg-success-500 text-white"
                    : isCurrent
                    ? "bg-primary-600 text-white ring-[5px] ring-primary-100"
                    : "bg-neutral-200 text-neutral-500"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {!isLast && (
                <span className={cn("min-h-[30px] w-0.5 flex-1", isDone ? "bg-success-500" : "bg-neutral-200")} />
              )}
            </div>
            <div className={cn("flex-1", isLast ? "pb-1" : "pb-6")}>
              <h4 className={cn("text-body-md font-semibold", isCurrent ? "text-primary-700" : "text-text-primary")}>
                {step.title}
              </h4>
              <p className="mt-1 text-body-sm leading-relaxed text-text-secondary">{step.description}</p>
              {step.extra}
            </div>
          </div>
        );
      })}
    </div>
  );
}
