"use client";

import { Timeline } from "@/components/ui/Stepper";
import { TRACK_STEPS, TRACK_DESC } from "@/lib/data";

export function StatusTimeline({ step, exec }: { step: number; exec?: string }) {
  const steps = TRACK_STEPS.map((title, i) => ({
    title,
    description: TRACK_DESC[title],
    extra:
      title === "Pickup Scheduled" && i <= step ? (
        <div className="mt-2 rounded-lg bg-primary-50 px-3 py-2 text-body-sm font-medium text-primary-700">
          Executive: {exec || "to be assigned shortly"}
        </div>
      ) : undefined,
  }));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-label text-text-primary">Status timeline</h3>
      <Timeline steps={steps} current={step} />
    </div>
  );
}
