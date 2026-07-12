"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { StickyBar } from "@/components/shared/StickyBar";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/sell/PhotoUploader";
import { useStore, useActiveModel } from "@/lib/store";
import { PHOTO_SLOTS } from "@/lib/data";

export default function PhotosPage() {
  const router = useRouter();
  const model = useActiveModel();
  const quote = useStore((s) => s.quote);
  const photos = useStore((s) => s.photos);
  const setPhoto = useStore((s) => s.setPhoto);

  useEffect(() => {
    if (!model || !quote) router.replace("/");
  }, [model, quote, router]);

  if (!model || !quote) return null;

  const uploaded = PHOTO_SLOTS.filter((s) => photos[s.id]?.done).length;
  const allDone  = uploaded === PHOTO_SLOTS.length;
  const allSynced = PHOTO_SLOTS.every((s) => !photos[s.id]?.done || photos[s.id]?.path);

  return (
    <div className="mx-auto max-w-3xl">
      <FlowHeader title="Verify your device" back="/sell/quote" />

      <div className="pt-2">
        <p className="text-body-md text-text-secondary">
          Add a few clear photos so we can verify your device condition. This keeps your final offer accurate and the
          pickup fast.
        </p>
        <div className="mt-4">
          <Progress
            value={(uploaded / PHOTO_SLOTS.length) * 100}
            label={`${uploaded} of ${PHOTO_SLOTS.length} photos added`}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PHOTO_SLOTS.map((slot) => (
          <PhotoUploader
            key={slot.id}
            slot={slot}
            done={!!photos[slot.id]?.done}
            preview={photos[slot.id]?.preview ?? null}
            onToggle={(d) => setPhoto(slot.id, { done: d })}
          />
        ))}
      </div>

      <div
        className="mt-5 flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-body-sm text-text-secondary animate-m-fade"
      >
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
        Your photos are used only for verification and are never shared. You can re-take any photo by tapping it.
      </div>

      <StickyBar className="mt-6">
        <Button
          fullWidth
          onClick={() => router.push("/sell/checkout")}
          rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}
        >
          {allDone ? "Continue to schedule pickup" : "Skip photos & continue"}
        </Button>
      </StickyBar>
    </div>
  );
}
