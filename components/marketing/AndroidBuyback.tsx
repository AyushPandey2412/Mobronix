"use client";

import { Smartphone, HelpCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useReveal } from "@/lib/useReveal";

export function AndroidBuyback() {
  const router = useRouter();
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="bg-primary-50/25 border-y border-primary-100/40 py-16 md:py-24 scroll-mt-24 relative overflow-hidden"
    >
      {/* Subtle light-blue glow background circle for depth */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-brand/5 blur-[100px] -z-10" />

      <div className="container-app grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        {/* Left column */}
        <div className={shown ? "animate-m-fade-up" : "opacity-0"}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand md:text-overline">
            Android buyback
          </span>
          <h2 className="mt-2 bg-gradient-to-br from-primary-900 to-primary-600 bg-clip-text text-[1.8rem] font-extrabold leading-tight tracking-[-0.02em] text-transparent md:text-[2.5rem]">
            Sell Samsung, OnePlus, Oppo &amp; more
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-text-secondary md:mt-4 md:text-body-lg">
            Got an Android phone? We buy all popular Android devices. Get a custom callback quote, schedule your doorstep inspection, and receive same-day instant payout.
          </p>
          <div className="mt-6">
            <Button
              size="lg"
              onClick={() => router.push("/sell/manual?brand=Other")}
              className="bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/15"
            >
              Sell Android device
            </Button>
          </div>
        </div>

        {/* Right column (Bento features grid with light glassmorphic cards) */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Smartphone,
              title: "All Brands Accepted",
              desc: "From Samsung S-series and OnePlus to Xiaomi, Vivo, and Realme — sell any Android model.",
              delay: "50ms",
              badgeClass: "bg-brand text-white shadow-[0_4px_15px_rgba(26,86,219,0.25)]",
            },
            {
              icon: HelpCircle,
              title: "No Catalog Limits",
              desc: "Don't see your specific variant? Simply enter your details manually to get a custom call quote.",
              delay: "100ms",
              badgeClass: "bg-brand text-white shadow-[0_4px_15px_rgba(26,86,219,0.25)]",
            },
            {
              icon: Truck,
              title: "Doorstep Pickup & Inspection",
              desc: "We pick up from your home across Mumbai, Navi Mumbai, Thane, and Sangli. Fast inspection at your gate.",
              delay: "150ms",
              badgeClass: "bg-emerald-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.25)]",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              style={shown ? { animationDelay: item.delay } : undefined}
              className={`${
                shown ? "animate-m-fade-up" : "opacity-0"
              } rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-5 shadow-[0_8px_30px_rgba(26,86,219,0.02)] flex flex-col justify-between hover:border-brand/20 hover:bg-white hover:shadow-[0_8px_30px_rgba(26,86,219,0.06)] transition-all duration-300 ${
                idx === 2 ? "sm:col-span-2 flex-row gap-4 items-center" : ""
              }`}
            >
              <div className="flex gap-4 items-start">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.badgeClass}`}>
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-body-md font-bold text-text-primary">{item.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
