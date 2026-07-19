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
      {/* Category Tabs Swipeable Bar */}
      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 select-none">
        {[
          { id: "iphone", label: "iPhone", type: "catalog" },
          { id: "macbook", label: "MacBook", type: "catalog" },
          { id: "Samsung", label: "Samsung", type: "manual" },
          { id: "OnePlus", label: "OnePlus", type: "manual" },
          { id: "Xiaomi", label: "Xiaomi", type: "manual" },
          { id: "Oppo", label: "Oppo", type: "manual" },
          { id: "Vivo", label: "Vivo", type: "manual" },
          { id: "Realme", label: "Realme", type: "manual" },
          { id: "Other", label: "Other", type: "manual" },
        ].map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.type === "catalog") {
                  switchCategory(cat.id as any);
                } else {
                  router.push(`/sell/manual?brand=${encodeURIComponent(cat.id)}`);
                }
              }}
              className={cn(
                "flex h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 font-bold text-caption transition-all active:scale-[0.98]",
                active
                  ? "border-brand bg-primary-50 text-brand"
                  : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
              )}
            >
              {cat.label}
            </button>
          );
        })}
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
