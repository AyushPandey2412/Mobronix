"use client";

import { Share2, Gift } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";

const STEPS = [
  { title: "Share your code", text: "Send your referral code to a friend via WhatsApp or any app." },
  { title: "They sell a device", text: "Your friend enters the code while submitting their first enquiry." },
  { title: "You both get ₹500", text: "Credited once their device is picked up and paid for." },
];

export default function ReferralPage() {
  const user = useStore((s) => s.user);
  const code = ((user?.name || "SELL").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5) || "SELL") + "500";

  const share = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* ignore */
    }
    toast("Referral code copied — share it with a friend!", "success");
  };

  return (
    <>
      <FlowHeader title="Refer & Earn" back="/account" />

      <div
        className="relative mt-2 overflow-hidden rounded-2xl bg-brand-gradient p-6 text-center text-white animate-m-scale-in"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
          <Gift className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-h3 font-extrabold">Refer a friend, get ₹500</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-body-sm text-white/85">
          Share your code. When they sell their first device, you both get ₹500 credited.
        </p>
        <div className="mx-auto mt-5 max-w-xs rounded-xl border-2 border-dashed border-white/50 bg-white/15 py-3.5 font-mono text-h4 font-extrabold tracking-[0.2em]">
          {code}
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className="bg-white text-brand hover:bg-white/90"
            onClick={share}
            leftIcon={<Share2 className="h-[18px] w-[18px]" />}
          >
            Share code
          </Button>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      <h3 className="mt-8 text-h4 font-bold text-text-primary">How it works</h3>
      <div className="mt-4 space-y-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 font-mono font-bold text-brand">
              {i + 1}
            </span>
            <div>
              <h4 className="text-body-md font-bold text-text-primary">{s.title}</h4>
              <p className="mt-0.5 text-body-sm text-text-secondary">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
