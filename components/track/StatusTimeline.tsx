"use client";

import { Timeline } from "@/components/ui/Stepper";
import { TRACK_STEPS, TRACK_DESC } from "@/lib/data";

export function StatusTimeline({ step }: { step: number }) {
  const steps = TRACK_STEPS.map((title, i) => ({
    title,
    description: TRACK_DESC[title],
  }));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-label text-text-primary">Status timeline</h3>
      <Timeline steps={steps} current={step} />
    </div>
  );
}
