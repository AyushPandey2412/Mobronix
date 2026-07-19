"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { fmt } from "@/lib/utils";
import { getDeviceImageSized } from "@/lib/deviceImages";
import type { Model } from "@/lib/types";

function getMaxPrice(model: Model): number {
  const storages = model.storages as Record<string, unknown>;
  if (!storages) return 0;
  const allPrices: number[] = [];
  Object.values(storages).forEach((v) => {
    if (typeof v === "number") {
      allPrices.push(v);
    } else if (typeof v === "object" && v !== null) {
      Object.values(v as Record<string, number>).forEach((p) => allPrices.push(p));
    }
  });
  return allPrices.length ? Math.max(...allPrices) : 0;
}

export function ModelCard({ model, onSelect, index = 0 }: { model: Model; onSelect: () => void; index?: number }) {
  const max     = getMaxPrice(model);
  const isMac   = model.category === "macbook";
  const imgSrc  = getDeviceImageSized(model, 160);   // 80px display @2x, loaded direct from Apple
  const [imgErr, setImgErr] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${index * 40}ms` }}
      className="animate-m-fade-up group flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-4 text-left shadow-xs transition-all hover:-translate-y-1 active:scale-[0.98] hover:border-primary-200 hover:shadow-sm"
    >
      <div className="flex w-full items-start justify-between">
        {/* Device image — Apple CDN with fallback SVG */}
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100">
          {imgSrc && !imgErr ? (
            <Image
              src={imgSrc}
              alt={model.name}
              fill
              sizes="80px"
              className="scale-[1.3] object-contain drop-shadow-sm"
              unoptimized
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4="
              onError={() => setImgErr(true)}
            />
          ) : (
            isMac ? <LaptopGlyph /> : <PhoneGlyph />
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>

      <div className="w-full">
        <h3 className="text-body-md font-bold leading-snug text-text-primary">{model.name}</h3>
        {model.chips && (
          <p className="mt-0.5 text-caption text-text-tertiary">{model.chips.join(" / ")}</p>
        )}
        <p className="mt-1 text-body-sm font-semibold text-success-600 tabular-nums">
          {max > 0 ? `Up to ${fmt(max)}` : "Awaiting Call"}
        </p>
      </div>
    </button>
  );
}

function PhoneGlyph() {
  return (
    <svg width="22" height="30" viewBox="0 0 22 30" fill="none" className="text-neutral-400">
      <rect x="1" y="1" width="20" height="28" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8" y="4" width="6" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function LaptopGlyph() {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none" className="text-neutral-400">
      <rect x="3" y="1" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1 15h26l1.5 5H0.5L2 15z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="11" y="17" width="6" height="1" rx="0.5" fill="currentColor" />
    </svg>
  );
}
