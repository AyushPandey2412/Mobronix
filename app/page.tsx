// Server component — no "use client" directive.
// Fetches models from Supabase at request time so ModelSelector renders
// with real data immediately, with zero client-side loading flash.

import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { HomePageClient } from "./_components/HomePageClient";
import { MODELS, MACBOOK_MODELS } from "@/lib/data";
import type { Model } from "@/lib/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Mobronix — Sell your used device in Mumbai, get paid today",
  description:
    "Get an instant price for your used iPhone, free doorstep pickup, and same-day payout via UPI or cash. Serving Mumbai, Navi Mumbai & Thane.",
};

// Revalidate the page every 5 minutes — model prices occasionally change.
// Between revalidations Next.js serves the cached pre-rendered HTML.
export const revalidate = 300;

export default async function HomePage() {
  // Prefetch active models server-side. Passed as initialData to TanStack Query
  // in ModelSelector — the client never makes a cold Supabase fetch on first render.
  let initialModels: Model[] = [];
  try {
    // Cookie-less client → this page can be statically rendered + ISR-cached
    // (revalidate 300) instead of doing a blocking Supabase fetch on EVERY request.
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("models")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("sort_order");
    initialModels =
      data && data.length > 0 ? (data as Model[]) : [...MODELS, ...MACBOOK_MODELS];
  } catch {
    // Supabase unavailable (e.g. first deploy before DB is seeded) —
    // fall back to local data so the page never crashes.
    initialModels = [...MODELS, ...MACBOOK_MODELS];
  }

  // JSON-LD schema — generated server-side so it's in the HTML source
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mobronix",
    url: APP_URL,
    logo: `${APP_URL}/icon.png`,
    description: "Trusted iPhone buyback service in Mumbai, Navi Mumbai and Thane. Free doorstep pickup, instant UPI payment.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    areaServed: ["Mumbai", "Navi Mumbai", "Thane"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi", "Marathi"],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How do you decide the price?",   acceptedAnswer: { "@type": "Answer", text: "We calculate your price based on model, storage, battery health, and overall condition compared to current market value." } },
      { "@type": "Question", name: "Do you buy damaged iPhones?",    acceptedAnswer: { "@type": "Answer", text: "Yes, we accept devices in all conditions — the price will vary based on the damage." } },
      { "@type": "Question", name: "Is payment instant?",            acceptedAnswer: { "@type": "Answer", text: "Yes, payment is made instantly via UPI or cash right after inspection at pickup." } },
      { "@type": "Question", name: "What documents are required?",   acceptedAnswer: { "@type": "Answer", text: "A government-approved, self-attested ID proof is required to complete the transaction." } },
      { "@type": "Question", name: "What happens to my personal data?", acceptedAnswer: { "@type": "Answer", text: "We perform a secure factory reset and data wipe in front of you at the time of pickup." } },
    ],
  };

  const aggregateRatingJsonLd = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: { "@type": "Organization", name: "Mobronix" },
    ratingValue: "4.8",
    reviewCount: "12400",
    bestRating: "5",
    worstRating: "1",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingJsonLd) }} />
      <HomePageClient initialModels={initialModels} />
    </>
  );
}
