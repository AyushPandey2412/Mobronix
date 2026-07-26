"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Laptop, Smartphone } from "lucide-react";
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
  const imgSrc  = getDeviceImageSized(model, 400);
  const [imgErr, setImgErr] = useState(false);

  const isFinishSelect = imgSrc ? imgSrc.includes("finish-select") : false;
  const imgScaleClass = isMac
    ? "scale-100 group-hover:scale-[1.05]"
    : isFinishSelect
      ? "scale-[1.38] group-hover:scale-[1.45]"
      : "scale-[1.05] group-hover:scale-[1.12]";

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${index * 40}ms` }}
      className="animate-m-fade-up group flex flex-col items-stretch rounded-2xl border border-border bg-surface px-3 pt-3 pb-4 sm:p-4 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] hover:border-brand/35 hover:shadow-[0_8px_30px_rgba(0,0,0,0.035)]"
    >
      {/* Aspect-square padded image container */}
      <div className="relative flex aspect-square w-full items-center justify-center rounded-xl bg-gradient-to-b from-neutral-50/60 to-neutral-100/60 p-2 sm:p-4 overflow-hidden">
        {imgSrc && !imgErr ? (
          <Image
            src={imgSrc}
            alt={model.name}
            fill
            sizes="(max-width: 768px) 150px, 200px"
            className={cn("object-contain transition-transform duration-300", imgScaleClass)}
            unoptimized
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4="
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 transform transition-transform duration-300 group-hover:scale-105">
            <div className="relative flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary-50 text-brand shadow-inner">
              {isMac ? <Laptop className="h-5 w-5 sm:h-6 sm:w-6" /> : <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />}
            </div>
            <span className="hidden sm:inline text-[9px] font-bold text-text-tertiary uppercase tracking-wider">Mobronix Catalog</span>
          </div>
        )}
      </div>

      {/* Anatomy Content Block */}
      <div className="mt-2.5 sm:mt-4 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-caption sm:text-body-sm font-extrabold leading-snug text-text-primary group-hover:text-brand transition-colors line-clamp-2">
            {model.name}
          </h3>
          {model.chips && (
            <p className="mt-0.5 text-[10px] sm:text-caption text-text-tertiary line-clamp-1">
              {model.chips.join(" / ")}
            </p>
          )}
        </div>

        <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-1.5 w-full">
          {/* Stacked price label to prevent clipping and wrapping on mobile */}
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] sm:text-[10px] text-text-tertiary font-bold uppercase tracking-wider leading-none">
              Up to
            </span>
            <span className="mt-1 font-mono text-caption sm:text-body-sm font-extrabold text-emerald-600 leading-normal">
              {max > 0 ? fmt(max) : "Call"}
            </span>
          </div>

          {/* Uniform solid brand-blue Chevron button */}
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-all duration-300 group-hover:scale-110 shadow-xs">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
          </span>
        </div>
      </div>
    </button>
  );
}
