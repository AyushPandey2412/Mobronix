"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getDeviceImageSized } from "@/lib/deviceImages";
import { useStore } from "@/lib/store";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { Model } from "@/lib/types";

export interface PriceUnlockModalProps {
  open: boolean;
  onClose: () => void;
  model: Model;
  storage?: string | null;
  /** Called after a successful phone login. */
  onSuccess?: () => void;
}

/**
 * Cashify/Cellkar-style price-unlock gate, themed to our design tokens.
 * Shows the device with a masked price and asks for a phone number to reveal it.
 */
export function PriceUnlockModal({ open, onClose, model, storage, onSuccess }: PriceUnlockModalProps) {
  const phoneLogin = useStore((s) => s.phoneLogin);
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const img = getDeviceImageSized(model, 160);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const submit = () => {
    setError(null);
    if (phone.length !== 10) return setError("Please enter a valid 10-digit mobile number.");
    if (!agree) return setError("Please accept the Terms to continue.");
    const res = phoneLogin(phone);
    if (!res.ok) return setError(res.error ?? "Something went wrong. Please try again.");
    onSuccess?.();
  };

  return (
    <>
      {open && (
        <div
          className="animate-m-fade fixed inset-0 z-modal flex items-end justify-center p-0 sm:items-center sm:p-4"
          onClick={onClose}
          style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Login to unlock price"
            onClick={(e) => e.stopPropagation()}
            className="animate-m-zoom-in relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl bg-surface p-5 pt-6 shadow-2xl sm:rounded-3xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface text-text-tertiary shadow-md ring-1 ring-border hover:text-text-primary sm:-right-3 sm:-top-3"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Device card */}
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-white/70 shadow-sm">
                {img ? (
                  <Image src={img} alt={model.name} fill sizes="80px" unoptimized className="object-contain p-1.5" />
                ) : (
                  <Star className="h-8 w-8 text-primary-300" />
                )}
                <span className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full bg-brand text-white ring-2 ring-surface">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-body-md font-bold leading-snug text-text-primary">
                  {model.name}
                  {storage ? ` · ${storage}` : ""}
                </p>
                <p className="mt-1 select-none font-mono text-h3 font-extrabold tracking-tight text-brand" aria-hidden>
                  ₹XX,XXX
                </p>
              </div>
            </div>

            {/* Heading */}
            <h3 className="mt-6 flex items-center justify-center gap-2 text-center text-h4 font-extrabold tracking-tight text-text-primary">
              <Lock className="h-5 w-5 text-warning-500" /> Login To Unlock The Best Price
            </h3>

            {/* Phone */}
            <div className="mt-5">
              <label className="text-label text-text-primary">Phone Number</label>
              <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-border bg-surface transition-shadow focus-within:border-brand focus-within:shadow-focus">
                <span className="border-r border-border px-3.5 py-3 text-body-md font-medium text-text-secondary">+91</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  inputMode="numeric"
                  data-autofocus
                  autoFocus
                  placeholder="Enter mobile number"
                  className="flex-1 bg-transparent px-3.5 py-3 text-body-md text-text-primary outline-none placeholder:text-text-tertiary"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="mt-4 flex items-start gap-2.5 rounded-xl bg-neutral-50 p-3.5 text-caption leading-relaxed text-text-secondary">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span>
                By continuing, I agree to SellMyiPhone&apos;s{" "}
                <Link href="/legal/terms-and-conditions" className="font-semibold text-brand">Terms &amp; Conditions</Link>,{" "}
                <Link href="/legal/terms-of-use" className="font-semibold text-brand">Terms of Use</Link> and{" "}
                <Link href="/legal/privacy-policy" className="font-semibold text-brand">Privacy Policy</Link>, and to receive
                updates via SMS, Email, WhatsApp and other channels.
              </span>
            </label>

            {error && <p role="alert" className="mt-3 text-body-sm font-medium text-error-600">{error}</p>}

            <Button fullWidth size="lg" className="mt-5" onClick={submit}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
