"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, Wallet, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { PhoneOtpLogin } from "@/components/shared/PhoneOtpLogin";
import { useStore } from "@/lib/store";

const PERKS = [
  { icon: Wallet, text: "Same-day payout via UPI or cash" },
  { icon: Truck, text: "Free insured doorstep pickup" },
  { icon: ShieldCheck, text: "IMEI-verified, safe transactions" },
];

export default function LoginPage() {
  const router         = useRouter();
  const user           = useStore((s) => s.user);
  const selectedModel  = useStore((s) => s.selectedModelId);

  // Already logged in → redirect
  useEffect(() => {
    if (user) router.replace(user.role === "admin" ? "/admin" : "/");
  }, [user, router]);

  const onSellerSuccess = () => router.replace(selectedModel ? "/sell/storage" : "/");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo className="text-white [&_span]:text-white" />
        <div>
          <h1
            className="max-w-md text-[2.75rem] font-extrabold leading-[1.1] tracking-[-0.02em] animate-m-fade-up"
          >
            Your iPhone.
Your Choice.
No Pressure.
          </h1>
          <div
            className="mt-8 space-y-3"
          >
            {PERKS.map((p, i) => (
              <div key={p.text} className="flex items-center gap-3 text-white/90 animate-m-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                  <p.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-body-md">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-white/80">
          <Sparkles className="h-4 w-4" /> 12,400+ devices bought across Mumbai, Navi Mumbai &amp; Thane
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-12 h-60 w-60 rounded-full bg-secondary-400/20 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div
          className="w-full max-w-sm animate-m-fade-up"
        >
          <div className="lg:hidden mb-8"><Logo /></div>

          <h2 className="text-h2 font-extrabold text-text-primary tracking-tight">Welcome</h2>
          <p className="mb-8 mt-2 text-body-md text-text-secondary">
            Honest Deals. Trusted Buyback.
          </p>

          <PhoneOtpLogin onSuccess={onSellerSuccess} />

          <p className="mt-6 text-caption text-text-tertiary text-center">
            Admin accounts are automatically redirected to the dashboard after sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
