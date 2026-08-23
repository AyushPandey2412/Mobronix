"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Laptop, Search, Smartphone, User as UserIcon, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "./Logo";
import { LoginModal } from "./LoginModal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { openContact } from "@/lib/contactLinks";
import { createBrowserClient } from "@/lib/supabase/client";
import { QK_PUBLIC, fetchPublicModels } from "@/lib/adminQueries";
import { MODELS, MACBOOK_MODELS } from "@/lib/data";
import { getDeviceImageSized } from "@/lib/deviceImages";
import type { Model } from "@/lib/types";

const NAV = [
  { href: "/", label: "Sell" },
  { href: "/#how", label: "How it works" },
  { href: "/about", label: "About Us" },
  { href: "/track", label: "Track Order" },
];

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.01 3.2A12.67 12.67 0 0 0 5.06 22.22L3.2 29l6.94-1.82a12.6 12.6 0 0 0 5.87 1.5h.01A12.74 12.74 0 0 0 28.8 15.98 12.7 12.7 0 0 0 16.01 3.2Zm0 23.3h-.01a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-4.12 1.08 1.1-4.01-.25-.41a10.48 10.48 0 1 1 9.02 5.04Zm5.76-7.84c-.31-.16-1.86-.92-2.15-1.02-.29-.11-.5-.16-.7.16-.21.31-.81 1.02-.99 1.23-.18.21-.36.23-.67.08-.31-.16-1.32-.49-2.52-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.54-.08-.16-.7-1.7-.96-2.33-.25-.61-.51-.53-.7-.54h-.6c-.21 0-.54.08-.83.39-.29.31-1.09 1.07-1.09 2.6 0 1.53 1.12 3.01 1.27 3.22.16.21 2.2 3.36 5.33 4.71.74.32 1.32.51 1.77.65.74.24 1.42.2 1.95.12.6-.09 1.86-.76 2.12-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z" />
    </svg>
  );
}

function DeviceResultImage({ model }: { model: Model }) {
  const [failed, setFailed] = useState(false);
  const src = getDeviceImageSized(model, 96);
  const Icon = model.category === "macbook" ? Laptop : Smartphone;

  return (
    <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-50 text-brand ring-1 ring-primary-100">
      {src && !failed ? (
        <Image
          src={src}
          alt={model.name}
          fill
          sizes="44px"
          unoptimized
          className="object-contain p-1.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon className="h-5 w-5" />
      )}
    </span>
  );
}

function HeaderDeviceSearch({
  compact = false,
  autoFocus = false,
  mobilePanel = false,
  onPicked,
}: {
  compact?: boolean;
  autoFocus?: boolean;
  mobilePanel?: boolean;
  onPicked?: () => void;
}) {
  const router = useRouter();
  const selectModel = useStore((s) => s.selectModel);
  const sb = useMemo(() => createBrowserClient(), []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: QK_PUBLIC.models(),
    queryFn: () => fetchPublicModels(sb),
    staleTime: 5 * 60 * 1000,
  });

  const models = useMemo(() => {
    const source = data && data.length > 0 ? data : [...MODELS, ...MACBOOK_MODELS];
    return source.filter((m) => m.category === "iphone" || m.category === "macbook");
  }, [data]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return models
      .filter((m) => `${m.name} ${m.series} ${m.category}`.toLowerCase().includes(q))
      .slice(0, 7);
  }, [models, query]);

  useEffect(() => {
    if (mobilePanel) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobilePanel]);

  useEffect(() => {
    if (!autoFocus) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [autoFocus]);

  const choose = (model: Model) => {
    selectModel(model.id);
    useStore.setState((s) => ({
      models: s.models.some((x) => x.id === model.id)
        ? s.models.map((x) => (x.id === model.id ? model : x))
        : [...s.models, model],
    }));
    setQuery("");
    setOpen(false);
    onPicked?.();
    router.push("/sell/storage");
  };

  return (
    <div ref={wrapRef} className={cn("relative", compact ? "w-full" : "w-full max-w-[360px]")}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder="Search iPhone or MacBook"
          className={cn(
            "w-full border border-border bg-background pl-10 pr-3 text-text-primary shadow-xs placeholder:text-text-tertiary focus:border-brand focus:shadow-focus focus:outline-none",
            mobilePanel ? "h-12 rounded-xl text-body-md" : "rounded-full",
            compact ? "h-11 text-body-sm" : "h-10 text-body-sm"
          )}
        />
      </div>
      {open && query.trim() && (
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-surface shadow-xl",
            mobilePanel
              ? "mt-3"
              : "absolute left-0 right-0 top-[calc(100%+8px)] z-dropdown"
          )}
        >
          {results.length ? (
            <div className={cn("overflow-y-auto py-1", mobilePanel ? "max-h-[60vh]" : "max-h-80")}>
              {results.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => choose(model)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-primary-50 active:bg-primary-100"
                >
                  <DeviceResultImage model={model} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-bold text-text-primary">{model.name}</span>
                    <span className="block truncate text-caption text-text-tertiary">
                      {model.category === "macbook" ? "MacBook" : "iPhone"} · {model.series}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-body-sm text-text-secondary">
              No device found. Try iPhone 15 or MacBook Air.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MobileSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal bg-neutral-950/35 backdrop-blur-sm lg:hidden" onClick={onClose}>
      <div
        className="animate-m-fade-down rounded-b-2xl border-b border-border bg-surface px-4 pb-5 pt-[calc(env(safe-area-inset-top)+14px)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Logo />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-text-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <HeaderDeviceSearch compact mobilePanel autoFocus onPicked={onClose} />
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [showLogin, setShowLogin] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Scroll-spy: on the home page, highlight the nav item whose section is in
  // view.
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (pathname !== "/") { setActiveSection(""); return; }
    
    const sections = ["how"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          } else {
            setActiveSection((prev) => (prev === id ? "" : prev));
          }
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      obs.observe(el);
      return obs;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-header border-b border-[rgba(20,40,80,0.05)] bg-[#F7F9FF] shadow-[0_1px_2px_rgba(20,40,80,0.03)] lg:border-border lg:bg-surface lg:shadow-xs">
      <div className="container-app flex min-h-16 items-center justify-between gap-2 py-3 lg:gap-3">
        <Link href="/" aria-label="Mobronix home">
          <Logo />
        </Link>

        <div className="hidden lg:block lg:max-w-[320px] xl:max-w-[360px]">
          <HeaderDeviceSearch compact />
        </div>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => {
            const isHome = pathname === "/";
            let active: boolean;
            if (item.href.includes("#")) {
              // In-page anchor (e.g. "/#how") — active when its section is in view.
              const hash = item.href.split("#")[1];
              active = isHome && activeSection === hash;
            } else if (item.href === "/") {
              // "Sell" — active at the top of the home page (no section in view).
              active = isHome && activeSection === "";
            } else {
              active = pathname.startsWith(item.href);
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap rounded-md px-3 py-2 text-body-sm font-semibold transition-colors",
                  active ? "text-brand" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-brand animate-m-fade" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Search devices"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-text-primary shadow-xs lg:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-whatsapp hover:bg-success-50 max-[639px]:gap-0 max-[639px]:px-2 sm:px-3.5"
            leftIcon={<WhatsAppLogo className="h-[20px] w-[20px]" />}
            onClick={() => openContact()}
          >
            <span className="hidden sm:inline sm:text-body-sm">WhatsApp</span>
          </Button>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserIcon className="h-[18px] w-[18px]" />}
              onClick={() => router.push(user.role === "admin" ? "/admin" : "/account")}
            >
              {user.name.split(" ")[0]}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setShowLogin(true)}>
              Login
            </Button>
          )}
        </div>
      </div>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <MobileSearchOverlay open={showMobileSearch} onClose={() => setShowMobileSearch(false)} />
    </header>
  );
}
