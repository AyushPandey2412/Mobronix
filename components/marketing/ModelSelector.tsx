"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ModelCard } from "./ModelCard";
import { Pill } from "@/components/ui/Selectable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStore } from "@/lib/store";
import { MODELS, MACBOOK_MODELS, SERIES, MAC_SERIES } from "@/lib/data";
import { QK_PUBLIC, fetchPublicModels } from "@/lib/adminQueries";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Model } from "@/lib/types";

export interface ModelSelectorProps {
  /** Server-prefetched models — used as TanStack Query initialData so there is
   *  zero loading flash on cold page visits. Falls back to local data if empty. */
  initialModels?: Model[];
}

type Category = "iphone" | "macbook";

export function ModelSelector({ initialModels }: ModelSelectorProps = {}) {
  const router      = useRouter();
  const selectModel = useStore((s) => s.selectModel);

  const sb = useMemo(() => createBrowserClient(), []);

  // Fetch live models from Supabase — fall back to local data if Supabase is
  // not set up yet (demo mode) or returns an empty set.
  const { data: supabaseModels, isLoading } = useQuery({
    queryKey:    QK_PUBLIC.models(),
    queryFn:     () => fetchPublicModels(sb),
    staleTime:   5 * 60 * 1000,  // 5 min — prices rarely change mid-session
    initialData: initialModels && initialModels.length > 0 ? initialModels : undefined,
    // initialData from the server is treated as fresh for staleTime — no
    // client fetch fires on the first render when the server already provided data.
  });

  // Use Supabase models when available, otherwise fall back to local seed data
  const allIPhones = useMemo(() => {
    if (supabaseModels && supabaseModels.length > 0) {
      return supabaseModels.filter((m) => m.category === "iphone");
    }
    return MODELS; // local fallback
  }, [supabaseModels]);

  const allMacBooks = useMemo(() => {
    if (supabaseModels && supabaseModels.length > 0) {
      return supabaseModels.filter((m) => m.category === "macbook");
    }
    return MACBOOK_MODELS; // local fallback
  }, [supabaseModels]);

  const [category, setCategory] = useState<Category>("iphone");
  const [series,   setSeries]   = useState("All");
  const [query,    setQuery]    = useState("");

  const sourceModels = category === "iphone" ? allIPhones : allMacBooks;
  const seriesList   = category === "iphone" ? SERIES : MAC_SERIES;

  const filtered = useMemo(
    () =>
      sourceModels.filter(
        (m) =>
          (series === "All" || m.series === series) &&
          (!query || m.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [sourceModels, series, query]
  );

  const switchCategory = (cat: Category) => {
    setCategory(cat);
    setSeries("All");
    setQuery("");
  };

  const onSelect = (m: Model) => {
    selectModel(m.id);
    // Also sync the live Supabase model into Zustand store so the sell flow
    // (storage page, quote page, etc.) has the correct prices
    useStore.setState((s) => ({
      models: s.models.some((x) => x.id === m.id)
        ? s.models.map((x) => (x.id === m.id ? m : x))
        : [...s.models, m],
    }));
    // Login gate disabled here for now — auth is requested later, inline on the
    // checkout step, right before the enquiry is submitted (Cashify-style).
    // To re-enable the gate at product selection, restore the line below:
    // router.push(user ? "/sell/storage" : "/login");
    router.push("/sell/storage");
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit mb-5">
        {(["iphone", "macbook"] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => switchCategory(cat)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-body-sm font-semibold transition-all",
              category === cat
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            {cat === "iphone" ? (
              <svg width="14" height="14" viewBox="0 0 22 30" fill="none">
                <rect x="1" y="1" width="20" height="28" rx="5" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="8" y="4" width="6" height="1.4" rx="0.7" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="16" height="14" viewBox="0 0 24 20" fill="none">
                <rect x="2" y="1" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M1 14h22l1.5 4H0.5L2 14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            )}
            {cat === "iphone" ? "iPhone" : "MacBook"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={category === "iphone" ? "Search e.g. iPhone 16 Pro" : "Search e.g. MacBook Air M3"}
          className="h-[52px] w-full rounded-lg border border-border bg-surface py-3.5 pl-12 pr-4 text-body-md text-text-primary shadow-xs placeholder:text-text-tertiary focus:border-brand focus:shadow-focus focus:outline-none"
        />
      </div>

      {/* Series pills */}
      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {seriesList.map((s) => (
          <Pill key={s} active={series === s} onClick={() => setSeries(s)}>
            {s}
          </Pill>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Model grid */}
      {!isLoading && (
        filtered.length ? (
          <div
            key={`${category}-${series}-${query}`}
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {filtered.map((m, i) => (
              <ModelCard key={m.id} model={m} onSelect={() => onSelect(m)} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-7 w-7" />}
            title="No models match"
            description={`We couldn't find anything for "${query}". Try a different search.`}
          />
        )
      )}
    </div>
  );
}
