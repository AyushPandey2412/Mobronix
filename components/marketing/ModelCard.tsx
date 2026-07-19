"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { fmt, cn } from "@/lib/utils";
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
      className="animate-m-fade-up group flex flex-col items-stretch rounded-2xl border border-border/80 bg-surface p-4 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] hover:border-brand/35 hover:shadow-[0_8px_30px_rgba(0,0,0,0.035)]"
    >
      {/* Center device image container */}
      <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-gradient-to-b from-neutral-50/50 to-neutral-100/50 p-4 overflow-hidden">
        {imgSrc && !imgErr ? (
          <Image
            src={imgSrc}
            alt={model.name}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            unoptimized
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4="
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="text-neutral-400 transform transition-transform duration-300 group-hover:scale-105">
            {isMac ? <LaptopGlyph /> : <PhoneGlyph />}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-body-sm sm:text-body-md font-extrabold leading-snug text-text-primary group-hover:text-brand transition-colors line-clamp-2">
            {model.name}
          </h3>
          {model.chips && (
            <p className="mt-1 text-caption text-text-tertiary line-clamp-1">
              {model.chips.join(" / ")}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-bold border",
              max > 0
                ? "bg-emerald-50/80 border-emerald-100 text-emerald-700"
                : "bg-neutral-50 border-neutral-200/80 text-text-tertiary"
            )}
          >
            {max > 0 ? `Up to ${fmt(max)}` : "Awaiting Call"}
          </span>

          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 text-neutral-400 group-hover:bg-brand group-hover:border-brand group-hover:text-white transition-all duration-300">
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
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
