"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MessageCircle, ShieldCheck, Truck, Wallet,
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
import { openContact } from "@/lib/contactLinks";

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

  const mobileBrands = [
    { label: "Apple", mark: "Apple", href: "/sell/iphone", className: "text-brand font-bold" },
    { label: "Xiaomi", mark: "MI", href: "/sell/manual?brand=Xiaomi", className: "text-brand font-bold" },
    { label: "Samsung", mark: "Samsung", href: "/sell/manual?brand=Samsung", className: "text-brand text-[10px] font-bold uppercase tracking-wide" },
    { label: "Vivo", mark: "vivo", href: "/sell/manual?brand=Vivo", className: "text-brand text-[18px] font-bold italic tracking-wide" },
  ];

  const mobileTrust = [
    { label: "Best Prices Guaranteed", icon: CheckCircle2 },
    { label: "100% Safe & Secure", icon: ShieldCheck },
    { label: "Doorstep Pickup", icon: Truck },
  ];



  return (
    <div>
      <section className="relative overflow-hidden bg-mesh lg:hidden">
        <div className="container-app px-5 pt-8 pb-8">
          <div className="mx-auto max-w-[390px] px-5 pb-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-[12px] font-bold leading-tight text-primary-700">
              <ShieldCheck className="h-5 w-5 fill-primary-500 text-primary-500" />
              <span>
                Instant
                <span className="block font-semibold text-text-primary">Payment</span>
              </span>
            </span>

            <h1 className="mt-7 text-[2.1rem] font-extrabold leading-[1.15] text-text-primary text-balance">
              Sell Old Mobile Phone for{" "}
              <span className="text-brand">Instant Cash</span>
            </h1>

            <p className="mt-4 text-[14px] leading-6 text-text-secondary">
              Get the best price for your old phone in minutes.
            </p>

            <div className="relative mx-auto mt-8 grid h-[230px] place-items-center">
              <div className="absolute bottom-5 h-[170px] w-[220px] rounded-full bg-primary-50 blur-2xl" />
              <Image
                src="/mobile-hero-device.png"
                alt=""
                width={853}
                height={991}
                priority
                className="relative h-[220px] w-[190px] object-contain"
              />
            </div>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[16px] font-bold text-text-secondary">Or choose a brand</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              {mobileBrands.map((brand) => (
                <Link key={brand.label} href={brand.href} className="text-center">
                  <span className="mx-auto grid h-[clamp(54px,17vw,72px)] w-[clamp(54px,17vw,72px)] place-items-center rounded-full border border-border bg-surface shadow-xs">
                    <span className={brand.className}>{brand.mark}</span>
                  </span>
                  <span className="mt-2 block text-[12px] font-semibold text-text-secondary">
                    {brand.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl bg-primary-50/60 p-5">
              {mobileTrust.map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-brand shadow-xs">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 min-h-[34px] text-[13px] font-bold leading-tight text-text-primary">
                    {item.label}
                  </span>
                  <span className="mx-auto mt-2 h-[3px] w-6 rounded-full bg-brand" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative hidden min-h-[88vh] items-center overflow-hidden bg-mesh lg:flex lg:min-h-[85vh]">
        <div className="container-app grid items-center gap-8 py-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">
          <div className="text-center lg:text-left">
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

            <p className="mx-auto mt-4 max-w-md text-body-lg text-text-secondary animate-m-fade-up lg:mx-0" style={{ animationDelay: `${2 * 60}ms` }}>
              Get a Quote, Free of Cost. Free Device Check. Free Pickup at Your Doorstep.
            </p>

            <div className="mt-7 flex flex-col gap-3 animate-m-fade-up sm:flex-row" style={{ animationDelay: `${3 * 60}ms` }}>
              <Button
                size="lg"
                onClick={scrollToModels}
                className="w-full justify-center text-[13px] sm:w-auto sm:text-body-sm px-3 sm:px-5"
              >
                Get my price
              </Button>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<MessageCircle className="h-[18px] w-[18px] text-whatsapp" />}
                onClick={() => openContact()}
                className="w-full justify-center text-[13px] sm:w-auto sm:text-body-sm px-3 sm:px-5 bg-surface"
              >
                WhatsApp us
              </Button>
            </div>

            {/* STATS block removed */}
          </div>

          <div
            className="relative mx-auto hidden h-[420px] w-[230px] -rotate-6 animate-m-scale-in lg:block"
          >
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary-100 to-secondary-100 blur-2xl" />
            <DeviceVisual tone="blue" className="h-full w-full" />
            <div
              className="absolute -left-16 top-12 hidden items-center gap-2 rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-md backdrop-blur animate-m-fade-up lg:flex"
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
              className="absolute -right-12 bottom-16 hidden items-center gap-2 rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-md backdrop-blur animate-m-fade-up lg:flex"
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
      <section id="models" className="container-app scroll-mt-24 pt-6 pb-4 md:pt-16 md:pb-8">
        <SectionHeading
          eyebrow="Get started"
          title="Choose your device"
          subtitle="Pick your phone or MacBook to get an instant price estimate."
        />
        <div className="mt-6">
          <ModelSelector initialModels={initialModels} limit={10} hideSearch />
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




      <CartBar />
    </div>
  );
}
