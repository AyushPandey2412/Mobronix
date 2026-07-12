"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight, MessageCircle, ShieldCheck, Truck, Wallet,
  BadgeIndianRupee, Sparkles, ChevronRight,
} from "lucide-react";
import { ModelSelector } from "@/components/marketing/ModelSelector";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyUs } from "@/components/marketing/WhyUs";
import { DeviceVisual } from "@/components/shared/DeviceVisual";
import { getDeviceImageSized } from "@/lib/deviceImages";
import { fmt } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CartBar } from "@/components/shared/CartBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { StarRow } from "@/components/ui/Stars";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { REVIEWS, FAQS, STATS } from "@/lib/data";
import type { Model } from "@/lib/types";

function maxPrice(model: Model): number {
  const out: number[] = [];
  Object.values(model.storages as Record<string, unknown>).forEach((v) => {
    if (typeof v === "number") out.push(v);
    else if (v && typeof v === "object") Object.values(v as Record<string, number>).forEach((p) => out.push(p));
  });
  return out.length ? Math.max(...out) : 0;
}

export function HomePageClient({ initialModels }: { initialModels: Model[] }) {
  const router          = useRouter();
  const user            = useStore((s) => s.user);
  const selectedModelId = useStore((s) => s.selectedModelId);
  const enquiry         = useStore((s) => s.enquiry);
  const quote           = useStore((s) => s.quote);
  const models          = useStore((s) => s.models);
  const selectModel     = useStore((s) => s.selectModel);

  const resume = useMemo(() => {
    if (!selectedModelId || enquiry) return null;
    const m = models.find((x) => x.id === selectedModelId);
    if (!m) return null;
    if (!quote) return { href: "/sell/condition", text: `Continue your condition check for ${m.name}` };
    return { href: "/sell/quote", text: `Finish your quote for ${m.name}` };
  }, [selectedModelId, enquiry, quote, models]);

  const scrollToModels = () =>
    document.getElementById("models")?.scrollIntoView({ behavior: "smooth" });

  // Top buyback prices — most valuable iPhones, sourced from live model data.
  const topModels = useMemo(() => {
    const source = (initialModels && initialModels.length ? initialModels : models)
      .filter((m) => (m.category ?? "iphone") === "iphone");
    return [...source].sort((a, b) => maxPrice(b) - maxPrice(a)).slice(0, 8);
  }, [initialModels, models]);

  const goSell = (m: Model) => {
    selectModel(m.id);
    useStore.setState((s) => ({
      models: s.models.some((x) => x.id === m.id)
        ? s.models.map((x) => (x.id === m.id ? m : x))
        : [...s.models, m],
    }));
    router.push("/sell/storage");
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-mesh">
        <div className="container-app grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-caption font-bold text-primary-700 animate-m-fade-up"
              style={{ animationDelay: `${0 * 60}ms` }}
            >
              Your iPhone. Your Choice. No Pressure.
            </span>

            <h1
              className="mt-5 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 bg-clip-text text-[2.4rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-transparent text-balance md:text-[3.25rem] animate-m-fade-up"
              style={{ animationDelay: `${1 * 60}ms` }}
            >
              Honest Deals. Trusted Buyback.
            </h1>

            <p className="mt-4 max-w-md text-body-lg text-text-secondary animate-m-fade-up" style={{ animationDelay: `${2 * 60}ms` }}>
              Get a Quote, Free of Cost. Free Device Check. Free Pickup at Your Doorstep.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 animate-m-fade-up" style={{ animationDelay: `${3 * 60}ms` }}>
              <Button size="lg" onClick={scrollToModels} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
                Get my price
              </Button>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<MessageCircle className="h-[18px] w-[18px] text-whatsapp" />}
                onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}`, "_blank")}
              >
                WhatsApp us
              </Button>
            </div>

            <div className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6 animate-m-fade-up" style={{ animationDelay: `${4 * 60}ms` }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-h4 font-extrabold tracking-tight text-text-primary tabular-nums">{s.value}</div>
                  <div className="mt-0.5 text-caption font-semibold text-text-tertiary">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative mx-auto hidden h-[420px] w-[230px] -rotate-6 lg:block animate-m-scale-in"
          >
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary-100 to-secondary-100 blur-2xl" />
            <DeviceVisual tone="blue" className="h-full w-full" />
            <div
              className="absolute -left-16 top-12 flex items-center gap-2 rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-md backdrop-blur animate-m-fade-up"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-success-50 text-success-600">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <div className="text-caption font-bold text-text-primary">Paid in 24 min</div>
                <div className="text-[10px] text-text-tertiary">via UPI</div>
              </div>
            </div>
            <div
              className="absolute -right-12 bottom-16 flex items-center gap-2 rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-md backdrop-blur animate-m-fade-up"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-brand">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="text-caption font-bold text-text-primary">IMEI verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* RESUME BANNER */}
      {resume && (
        <section className="container-app relative z-10 pb-2 pt-6">
          <button
            onClick={() => router.push(resume.href)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3.5 text-left shadow-sm"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-brand" />
              <span>
                <span className="block text-body-sm font-bold text-primary-700">Resume your quote</span>
                <span className="block text-caption text-text-secondary">{resume.text}</span>
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-brand" />
          </button>
        </section>
      )}

      {/* MODEL SELECTION — passes server-prefetched models as initialData */}
      <section id="models" className="container-app scroll-mt-24 py-12 md:py-16">
        <SectionHeading
          eyebrow="Get started"
          title="Choose your device"
          subtitle="Search or pick your iPhone or MacBook to get an instant price estimate."
        />
        <div className="mt-6">
          <ModelSelector initialModels={initialModels} />
        </div>
      </section>

      {/* HOW IT WORKS — illustrated 3-step section */}
      <HowItWorks />

      {/* WHY US — bento grid */}
      <WhyUs />

      {/* RESET & HAND OVER */}
      {/* <section className="bg-surface py-14 md:py-20">
        <div className="container-app grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeading
            eyebrow="Handover"
            title="Reset and hand over your phone"
            subtitle="How the final price and handover work — simple and transparent."
          />
          <div className="grid gap-3">
            {[
              "Once you accept the estimated price, schedule a pickup and back up your data.",
              "On the pickup day, our expert will inspect and diagnose your phone. After the inspection, we will share the final offer.",
              "Once you accept the final offer, please reset your phone to factory settings before handing it over to us.",
            ].map((text, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border bg-background p-4">
                <span className="font-mono text-body-md font-bold text-brand">0{i + 1}</span>
                <p className="text-body-sm leading-relaxed text-text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}



      <section className="bg-surface py-10 md:py-20">
        <div className="container-app grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-8">
          <SectionHeading
            eyebrow="Handover"
            title="Reset and hand over your phone"
            subtitle="How the final price and handover work  simple and transparent."
          />
          <div className="grid gap-2.5 md:gap-3">
            {[
              "Once you accept the estimated price, schedule a pickup and back up your data.",
              "On the pickup day, our expert will inspect and diagnose your phone. After the inspection, we will share the final offer.",
              "Once you accept the final offer, please reset your phone to factory settings before handing it over to us.",
            ].map((text, i) => (
              <div key={i} className="flex gap-2.5 rounded-lg border border-border bg-background p-3 md:gap-3 md:p-4">
                <span className="font-mono text-[13px] font-bold text-brand md:text-body-md">0{i + 1}</span>
                <p className="text-[12px] leading-relaxed text-text-secondary md:text-body-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      {/* <section className="container-app py-14 md:py-20">
        <SectionHeading eyebrow="Reviews" title="What sellers say" center />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <Card key={r.name} padded className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-body-md font-bold text-text-primary">{r.name}</div>
                  <div className="text-caption text-text-tertiary">{r.city}</div>
                </div>
                <StarRow value={r.rating} />
              </div>
              <p className="mt-3 text-body-sm leading-relaxed text-text-secondary">"{r.text}"</p>
            </Card>
          ))}
        </div>
      </section> */}


          <section className="container-app py-10 md:py-20">
        <SectionHeading eyebrow="Reviews" title="What sellers say" center />
        <div className="mt-6 grid gap-3 md:mt-10 md:grid-cols-3 md:gap-4">
          {REVIEWS.map((r) => (
            <Card key={r.name} padded className="h-full">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-text-primary md:text-body-md">{r.name}</div>
                  <div className="text-[11px] text-text-tertiary md:text-caption">{r.city}</div>
                </div>
                <StarRow value={r.rating} />
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-text-secondary md:mt-3 md:text-body-sm">&quot;{r.text}&quot;</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 bg-surface py-10 md:py-20">
        <div className="container-app max-w-3xl">
          <SectionHeading eyebrow="FAQs" title="Questions, answered" center />
          <div className="mt-5 md:mt-8">
            <Accordion items={FAQS} />
          </div>
        </div>
      </section>


      {/* TOP BUYBACK PRICES — popular models with live prices, click to sell */}
      <section className="container-app py-14 md:py-20">
        <SectionHeading
          eyebrow="Live prices"
          title="Top buyback prices"
          subtitle="The most popular iPhones we're buying right now. Tap one to get your exact offer."
          center
        />
        <div
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {topModels.map((m, i) => {
            const img = getDeviceImageSized(m, 160);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => goSell(m)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left shadow-xs transition-all hover:border-primary-200 hover:shadow-sm animate-m-fade-up hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100">
                  {img && (
                    <Image src={img} alt={m.name} fill sizes="56px" unoptimized loading="lazy" className="scale-[1.3] object-contain drop-shadow-sm" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-bold text-text-primary">{m.name}</p>
                  <p className="text-caption font-semibold text-success-600">Up to {fmt(maxPrice(m))}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
              </button>
            );
          })}
        </div>

        <div className="mt-9 flex justify-center">
          <Button variant="outline" size="lg" onClick={scrollToModels} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
            See all models &amp; prices
          </Button>
        </div>
      </section>

      <CartBar />
    </div>
  );
}
