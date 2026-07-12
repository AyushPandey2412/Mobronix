"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Truck, Wallet, Info } from "lucide-react";
import Image from "next/image";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { DeviceVisual } from "@/components/shared/DeviceVisual";
import { getDeviceImageSized } from "@/lib/deviceImages";
import { StickyBar } from "@/components/shared/StickyBar";
import { Pill } from "@/components/ui/Selectable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore, useActiveModel } from "@/lib/store";
import { fmt } from "@/lib/utils";
import type { FlatStorages, NestedStorages } from "@/lib/types";

const TRUST = [
  { icon: Wallet,      text: "Same-day payment" },
  { icon: Truck,       text: "Free pickup" },
  { icon: ShieldCheck, text: "IMEI verified" },
];

function isNested(s: Record<string, unknown>): boolean {
  return typeof Object.values(s)[0] === "object";
}

export default function StoragePage() {
  const router          = useRouter();
  const searchParams    = useSearchParams();
  const model           = useActiveModel();
  const models          = useStore((s) => s.models);
  const selectModel     = useStore((s) => s.selectModel);
  const selectedModelId = useStore((s) => s.selectedModelId);
  const selectedStorage = useStore((s) => s.selectedStorage);
  const setStorage      = useStore((s) => s.setStorage);
  const resetSellFlow   = useStore((s) => s.resetSellFlow);

  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState(false);

  // Entry from the SEO landing pages: /sell/storage?model=<id|slug> selects that
  // device so this page (and the rest of the main flow) has a model to work with.
  const modelParam = searchParams.get("model");
  useEffect(() => {
    if (modelParam && selectedModelId !== modelParam) {
      const m = models.find((x) => x.id === modelParam || x.slug === modelParam);
      if (m && m.id !== selectedModelId) selectModel(m.id);
    }
  }, [modelParam, selectedModelId, models, selectModel]);

  useEffect(() => {
    // Don't bounce to home while we're still resolving a ?model= param.
    if (!model) { if (!modelParam) router.replace("/"); return; }
    const nested = isNested(model.storages as Record<string, unknown>);
    if (nested) {
      const firstChip = Object.keys(model.storages)[0];
      if (!selectedChip) setSelectedChip(firstChip);
      const storagesForChip = (model.storages as NestedStorages)[selectedChip ?? firstChip];
      if (storagesForChip && !selectedStorage) {
        setStorage(Object.keys(storagesForChip)[0]);
      }
    } else {
      if (!selectedStorage) setStorage(Object.keys(model.storages)[0]);
    }
  }, [model, modelParam, selectedChip, selectedStorage, setStorage, router]);

  if (!model) return null;

  const nested       = isNested(model.storages as Record<string, unknown>);
  const chips        = nested ? Object.keys(model.storages) : [];
  const activeChip   = selectedChip ?? chips[0] ?? null;

  // Get storage keys + current price
  let storageKeys: string[] = [];
  let price = 0;
  let minPrice = 0;
  let maxPrice = 0;

  if (nested && activeChip) {
    const tierPrices = (model.storages as NestedStorages)[activeChip] ?? {};
    storageKeys = Object.keys(tierPrices);
    const priceVal = selectedStorage ? tierPrices[selectedStorage] : undefined;
    price    = priceVal ?? Object.values(tierPrices)[0] ?? 0;
    minPrice = Math.min(...Object.values(tierPrices));
    maxPrice = Math.max(...Object.values(tierPrices));
  } else {
    const flat = model.storages as FlatStorages;
    storageKeys = Object.keys(flat);
    price    = selectedStorage ? (flat[selectedStorage] ?? 0) : Object.values(flat)[0] ?? 0;
    minPrice = Math.min(...Object.values(flat));
    maxPrice = Math.max(...Object.values(flat));
  }

  const startCondition = () => {
    useStore.setState({ answers: {}, quote: null });
    router.push("/sell/condition");
  };

  const isMac = model.category === "macbook";

  return (
    <>
      <FlowHeader
        title={`Sell ${model.name}`}
        back="/"
        onBack={() => { resetSellFlow(); router.push("/"); }}
      />

      <div
        className="grid gap-8 pt-2 lg:grid-cols-2 lg:items-start lg:gap-12"
      >
        {/* Visual */}
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50 py-10 lg:sticky lg:top-24 lg:py-16 animate-m-fade-up"
        >
          {(() => {
            const imgSrc = getDeviceImageSized(model, 480);   // ~224px display @2x, direct from Apple
            return imgSrc && !imgErr ? (
              <div className="relative h-72 w-44 lg:h-96 lg:w-56">
                <Image
                  src={imgSrc}
                  alt={model.name}
                  fill
                  sizes="(min-width: 1024px) 224px, 176px"
                  className="object-contain drop-shadow-xl"
                  unoptimized
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRUYyRkYiLz48L3N2Zz4="
                  onError={() => setImgErr(true)}
                />
              </div>
            ) : (
              <DeviceVisual tone="graphite" className="h-72 w-40 lg:h-96 lg:w-52" />
            );
          })()}
          <Badge intent="success" className="absolute left-4 top-4" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            Best price guaranteed
          </Badge>
        </div>

        {/* Options */}
        <div>
          <div className="animate-m-fade-up">
            <span className="text-overline uppercase text-brand">{model.series}</span>
            <h2 className="mt-1 text-h2 font-extrabold tracking-tight text-text-primary">{model.name}</h2>
            <p className="mt-1.5 font-mono text-body-md font-semibold text-success-600">
              {fmt(minPrice)} – {fmt(maxPrice)}
            </p>
          </div>

          {/* Chip selector (MacBook only) */}
          {nested && chips.length > 1 && (
            <div className="mt-8 animate-m-fade-up">
              <h3 className="text-label text-text-primary">Select chip</h3>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {chips.map((c) => (
                  <Pill
                    key={c}
                    active={activeChip === c}
                    onClick={() => {
                      setSelectedChip(c);
                      const firstStorage = Object.keys((model.storages as NestedStorages)[c])[0];
                      setStorage(firstStorage);
                    }}
                    className="px-5 py-2.5"
                  >
                    {c}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {/* Storage selector */}
          <div className="mt-8 animate-m-fade-up">
            <h3 className="text-label text-text-primary">Select storage</h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {storageKeys.map((s) => (
                <Pill key={s} active={selectedStorage === s} onClick={() => setStorage(s)} className="px-5 py-2.5">
                  {s}
                </Pill>
              ))}
            </div>
          </div>

          {/* Price display */}
          <div
            className="mt-8 overflow-hidden rounded-xl border border-primary-100 bg-primary-50/60 animate-m-fade-up"
          >
            <div className="p-5 text-center">
              <p className="text-body-sm font-medium text-text-secondary">
                Estimated price before condition check
              </p>
              <p
                key={`${activeChip}-${selectedStorage}`}
                className="my-1 font-mono text-[2.5rem] font-extrabold leading-none tracking-tight text-text-primary animate-m-fade-up"
              >
                {fmt(price)}
              </p>
              <p className="text-caption text-text-tertiary">
                Final price depends on your device&apos;s condition
              </p>
            </div>
            <div className="flex items-start gap-2 border-t border-primary-100 bg-white/50 px-5 py-3 text-caption text-text-secondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Answer a few quick condition questions next to lock in your exact offer.
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 animate-m-fade-up">
            {TRUST.map((t) => (
              <span key={t.text} className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-secondary">
                <t.icon className="h-4 w-4 text-success-600" /> {t.text}
              </span>
            ))}
          </div>

          <div className="mt-8 hidden lg:block animate-m-fade-up">
            <Button size="lg" fullWidth onClick={startCondition} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
              Continue to condition check
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <StickyBar label="Estimated price" value={fmt(price)}>
          <Button onClick={startCondition} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
            Continue
          </Button>
        </StickyBar>
      </div>
    </>
  );
}
