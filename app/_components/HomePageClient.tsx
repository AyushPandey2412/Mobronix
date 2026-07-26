"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, MessageCircle, ShieldCheck, Truck, Wallet,
  BadgeIndianRupee, Sparkles, ChevronRight, CheckCircle2,
  Heart, Recycle, Zap, Phone, Mail, Globe, Compass,
} from "lucide-react";
import { ModelSelector } from "@/components/marketing/ModelSelector";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyUs } from "@/components/marketing/WhyUs";
import { AndroidBuyback } from "@/components/marketing/AndroidBuyback";
import { DeviceVisual } from "@/components/shared/DeviceVisual";
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
  if (!model.storages) return 0;
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



  return (
    <div>
      <section className="relative overflow-hidden bg-mesh">
        <div className="container-app grid items-center gap-8 pt-10 pb-6 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-caption font-bold text-primary-700 animate-m-fade-up"
              style={{ animationDelay: `${0 * 60}ms` }}
            >
              Your phone. Your Choice. No Pressure.
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

            <div className="mt-7 flex flex-row gap-3 animate-m-fade-up" style={{ animationDelay: `${3 * 60}ms` }}>
              <Button
                size="lg"
                onClick={scrollToModels}
                rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}
                className="flex-1 sm:flex-initial justify-center text-[13px] sm:text-body-sm px-3 sm:px-5"
              >
                Get my price
              </Button>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<MessageCircle className="h-[18px] w-[18px] text-whatsapp" />}
                onClick={() => window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}`, "_blank")}
                className="flex-1 sm:flex-initial justify-center text-[13px] sm:text-body-sm px-3 sm:px-5 bg-surface"
              >
                WhatsApp us
              </Button>
            </div>

            <div className="mt-4 md:hidden flex justify-center animate-m-fade-up" style={{ animationDelay: `${3.5 * 60}ms` }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-[12px] font-semibold text-brand hover:underline"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                Know more about us ↓
              </Button>
            </div>

            {/* STATS block removed */}
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
      <section id="models" className="container-app scroll-mt-24 pt-6 pb-12 md:py-16">
        <SectionHeading
          eyebrow="Get started"
          title="Choose your device"
          subtitle="Search or pick your phone or MacBook to get an instant price estimate."
        />
        <div className="mt-6">
          <ModelSelector initialModels={initialModels} limit={10} />
        </div>
      </section>

      {/* HOW IT WORKS — illustrated 3-step section */}
      <HowItWorks />

      {/* WHY US — bento grid */}
      <WhyUs />

      {/* ABOUT US — Cashify/Sellkart inspired premium section */}
      <section id="about" className="scroll-mt-24 py-12 md:py-24 bg-gradient-to-b from-background via-neutral-50/50 to-background border-t border-border/40">
        <div className="container-app">
          {/* Main Title Header */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[11px] sm:text-caption font-bold text-brand uppercase tracking-wider bg-primary-50 border border-primary-100 rounded-full px-3 py-1">
              About Us
            </span>
            <h2 className="mt-4 text-body-xl md:text-[32px] font-extrabold tracking-tight text-text-primary leading-tight">
              Your Trusted Partner for Selling Used Devices
            </h2>
            <p className="mt-4 text-body-md text-text-secondary leading-relaxed">
              Welcome to <strong>Mobronix</strong>! We make it easy to sell your old mobile phones quickly, safely, and at a fair price. Our goal is to give every device a second life while helping reduce electronic waste. Whether you want to sell your old phone, buy a quality pre-owned device, or recycle an unwanted gadget, Mobronix is here to help.
            </p>
          </div>

          {/* What We Do */}
          <div className="mt-12 md:mt-16">
            <h3 className="text-center text-label sm:text-body-md font-extrabold uppercase tracking-wider text-text-tertiary">
              What We Do
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
              <div className="group rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-brand/40 hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-brand group-hover:scale-110 transition-transform duration-300">
                  <BadgeIndianRupee className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-body-md font-bold text-text-primary">
                  Sell Your Phone
                </h4>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Get the best value for your used smartphone. Our pricing is fair, the process is simple, and payments are made quickly.
                </p>
              </div>

              <div className="group rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                  <Recycle className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-body-md font-bold text-text-primary">
                  Recycle Responsibly
                </h4>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Devices that cannot be reused are recycled safely to help protect the environment and reduce e-waste.
                </p>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mt-16 md:mt-24">
            <h3 className="text-center text-label sm:text-body-md font-extrabold uppercase tracking-wider text-text-tertiary">
              Our Values
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-brand/30 transition-all duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-brand">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-body-md font-bold text-text-primary">
                  Trust
                </h4>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  We believe in honest pricing, secure transactions, and protecting your personal information.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-amber-500/30 transition-all duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-body-md font-bold text-text-primary">
                  Simplicity
                </h4>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  Our process is quick and easy, from getting a quote to receiving payment.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Heart className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-body-md font-bold text-text-primary">
                  Sustainability
                </h4>
                <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                  We help give used devices a second life and recycle them responsibly for a greener future.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us & Mission/Vision Split layout */}
          <div className="mt-16 md:mt-24 grid gap-10 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Why Choose Mobronix? */}
            <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-xs">
              <h3 className="text-body-lg font-extrabold text-text-primary">
                Why Choose Mobronix?
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Best prices for your used devices",
                  "Instant payment after pickup and verification",
                  "Free doorstep pickup",
                  "Safe, secure, and transparent process",
                  "Friendly customer support",
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="text-body-sm text-text-secondary leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mission & Vision */}
            <div className="flex flex-col gap-6">
              <div className="flex-1 rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary-100 hover:bg-neutral-50/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-brand">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h4 className="text-body-md font-bold text-text-primary">
                    Our Mission
                  </h4>
                </div>
                <p className="mt-3 text-body-sm text-text-secondary leading-relaxed">
                  To make buying and recycling mobile devices simple, affordable, and environmentally responsible.
                </p>
              </div>

              <div className="flex-1 rounded-2xl border border-border bg-surface p-6 shadow-xs hover:border-primary-100 hover:bg-neutral-50/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-brand">
                    <Compass className="h-5 w-5" />
                  </div>
                  <h4 className="text-body-md font-bold text-text-primary">
                    Our Vision
                  </h4>
                </div>
                <p className="mt-3 text-body-sm text-text-secondary leading-relaxed">
                  To build a future where every electronic device is reused, refurbished, or recycled instead of being wasted.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us Card */}
          <div className="mt-16 md:mt-24 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50/40 via-surface to-primary-50/20 p-6 md:p-10 max-w-4xl mx-auto shadow-xs text-center">
            <h3 className="text-body-lg font-extrabold text-text-primary">
              Contact Us
            </h3>
            <p className="mt-3 text-body-sm sm:text-body-md text-text-secondary leading-relaxed max-w-2xl mx-auto">
              At Mobronix, we&apos;re committed to making technology more affordable and sustainable. Thank you for choosing us and being part of a greener future.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:7700902077"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-xl bg-brand px-6 py-3 text-body-sm font-bold text-white hover:bg-brand-hover active:scale-[0.98] transition-all shadow-xs"
              >
                <Phone className="h-4 w-4" /> Call: +91 7700902077
              </a>
              <a
                href="mailto:support@mobronix.com"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-xl border border-border bg-surface px-6 py-3 text-body-sm font-bold text-text-primary hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-xs"
              >
                <Mail className="h-4 w-4" /> Email: support@mobronix.com
              </a>
            </div>
          </div>
        </div>
      </section>

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




      <CartBar />
    </div>
  );
}
