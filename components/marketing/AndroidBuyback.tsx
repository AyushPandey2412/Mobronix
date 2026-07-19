"use client";

import { Smartphone, HelpCircle, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useReveal } from "@/lib/useReveal";

export function AndroidBuyback() {
  const router = useRouter();
  const { ref, shown } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-neutral-50 border-y border-border py-12 md:py-20 scroll-mt-24">
      <div className="container-app grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
              rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}
            >
              Sell Android device
            </Button>
          </div>
        </div>

        {/* Right column (Bento features grid) */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Smartphone,
              title: "All Brands Accepted",
              desc: "From Samsung S-series and OnePlus to Xiaomi, Vivo, and Realme — sell any Android model.",
              delay: "50ms",
            },
            {
              icon: HelpCircle,
              title: "No Catalog Limits",
              desc: "Don't see your specific variant? Simply enter your details manually to get a custom call quote.",
              delay: "100ms",
            },
            {
              icon: Truck,
              title: "Doorstep Pickup & Inspection",
              desc: "We pick up from your home across Mumbai, Navi Mumbai, and Thane. Fast inspection at your gate.",
              delay: "150ms",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              style={shown ? { animationDelay: item.delay } : undefined}
              className={`${
                shown ? "animate-m-fade-up" : "opacity-0"
              } rounded-2xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between ${
                idx === 2 ? "sm:col-span-2 flex-row gap-4 items-center" : ""
              }`}
            >
              <div className="flex gap-4 items-start">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-brand">
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
