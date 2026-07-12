"use client";

import { OptionCard } from "@/components/ui/Selectable";
import { cn } from "@/lib/utils";
import type { Question, Answer } from "@/lib/types";

interface Props {
  question: Question;
  answer: Answer | undefined;
  onAnswer: (a: Answer) => void;
}

export function QuestionBody({ question, answer, onAnswer }: Props) {
  if (question.type === "matrix" && question.items) {
    const ans = (answer as Record<number, "yes" | "no">) || {};
    return (
      <div className="flex flex-col gap-2">
        {question.items.map((item, ii) => (
          <div
            key={item.label}
            style={{ animationDelay: `${ii * 30}ms` }}
            className="animate-m-fade-up flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5"
          >
            <span className="text-body-md font-medium text-text-primary">{item.label}</span>
            <div className="flex gap-1.5">
              {(["yes", "no"] as const).map((val) => {
                const active = ans[ii] === val;
                return (
                  <button
                    key={val}
                    onClick={() => onAnswer({ ...ans, [ii]: val })}
                    className={cn(
                      "rounded-md border px-4 py-1.5 text-body-sm font-bold capitalize transition-colors",
                      active && val === "yes" && "border-success-200 bg-success-50 text-success-700",
                      active && val === "no" && "border-error-200 bg-error-50 text-error-600",
                      !active && "border-border text-text-tertiary hover:border-border-strong"
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "multi" && question.opts) {
    const ans = (answer as number[]) || [];
    const toggle = (oi: number) => {
      const label = question.opts![oi].label;
      const exists = ans.includes(oi);
      let next: number[];
      if (exists) {
        next = ans.filter((x) => x !== oi);
      } else if (question.exclusive && label === question.exclusive) {
        next = [oi];
      } else {
        next = ans.filter((x) => question.opts![x] && question.opts![x].label !== question.exclusive);
        next.push(oi);
      }
      onAnswer(next);
    };
    return (
      <div className="flex flex-col gap-2.5">
        {question.opts.map((o, oi) => (
          <div key={o.label} style={{ animationDelay: `${oi * 40}ms` }} className="animate-m-fade-up">
            <OptionCard selected={ans.includes(oi)} onClick={() => toggle(oi)}>
              {o.label}
            </OptionCard>
          </div>
        ))}
      </div>
    );
  }

  // single
  const selected = answer as number | undefined;
  return (
    <div className="flex flex-col gap-2.5">
      {question.opts?.map((o, oi) => (
        <div key={o.label} style={{ animationDelay: `${oi * 40}ms` }} className="animate-m-fade-up">
          <OptionCard selected={selected === oi} onClick={() => onAnswer(oi)}>
            {o.label}
          </OptionCard>
        </div>
      ))}
    </div>
  );
}

/** Whether the given answer satisfies the question (for enabling "Next"). */
export function canProceed(question: Question, answer: Answer | undefined): boolean {
  if (question.type === "matrix" && question.items) {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) return false;
    const ans = answer as Record<number, "yes" | "no">;
    return question.items.every((_, ii) => ans[ii] !== undefined);
  }
  if (question.type === "multi") return true; // multi can be empty (e.g. no accessories)
  return answer !== undefined && answer !== null;
}
