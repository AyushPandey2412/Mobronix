import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/server";
import { ModelSelector } from "@/components/marketing/ModelSelector";
import { MACBOOK_MODELS } from "@/lib/data";
import type { Model } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sell your MacBook — Best Price & Instant Cash | Mobronix",
  description: "Get the maximum value for your used MacBook. Instant price quote, free doorstep pickup, and immediate UPI payout in Mumbai, Navi Mumbai, Thane & Sangli.",
};

export default async function MacBookCatalogPage() {
  let initialModels: Model[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("models")
      .select("*")
      .eq("is_active", true)
      .eq("category", "macbook")
      .order("sort_order");

    if (data && data.length > 0) {
      initialModels = data as Model[];
    } else {
      initialModels = MACBOOK_MODELS;
    }
  } catch {
    initialModels = MACBOOK_MODELS;
  }

  return (
    <div className="space-y-6 pt-4 sm:pt-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-text-tertiary select-none px-4 sm:px-0">
        <Link href="/" className="text-caption hover:text-brand transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/#models" className="text-caption hover:text-brand transition-colors">
          Sell
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-caption text-text-secondary font-bold">
          MacBook
        </span>
      </div>

      {/* Page Heading */}
      <div className="px-4 sm:px-0">
        <h1 className="bg-gradient-to-br from-primary-900 to-primary-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
          Sell Your MacBook
        </h1>
        <p className="mt-1.5 text-body-sm text-text-secondary">
          Select your MacBook model below to get an instant, honest condition-based valuation.
        </p>
      </div>

      {/* Model Grid view — borderless & padded transparent on mobile for full width layout */}
      <div className="bg-transparent sm:bg-surface sm:border sm:border-border/60 sm:rounded-2xl p-0 sm:p-6 sm:shadow-xs">
        <div className="px-4 sm:px-0">
          <ModelSelector
            initialModels={initialModels}
            categoryFilter="macbook"
            hideTabs={true}
          />
        </div>
      </div>
    </div>
  );
}
