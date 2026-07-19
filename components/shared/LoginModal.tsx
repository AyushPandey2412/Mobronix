"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Lock, Star, User as UserIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getDeviceImageSized } from "@/lib/deviceImages";
import { useStore } from "@/lib/store";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { toast } from "@/lib/toast";
import type { Model } from "@/lib/types";

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  model: Model;
  storage?: string | null;
  /** Called after a successful OTP-verified login. */
  onSuccess?: () => void;
}

/**
 * Cashify/Cellkar-style price-unlock gate, themed to our design tokens.
 * Shows the device with a masked price and runs the real name + OTP login
 * flow (same as Checkout) before revealing the price.
 */
export function LoginModal({ open, onClose, model, storage, onSuccess }: LoginModalProps) {
  const setContact = useStore((s) => s.setContact);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const img = getDeviceImageSized(model, 160);

  // Escape-to-close + scroll lock (compensates for scrollbar width so the
  // page doesn't shift and produce a stray horizontal scrollbar).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open, onClose]);

  // Reset internal flow state whenever the modal is closed, so reopening it
  // starts fresh at step 1.
  useEffect(() => {
    if (!open) {
      setOtpSent(false);
      setOtpCode("");
      setDevCode(null);
      setError(null);
      setOtpBusy(false);
      setResendCooldown(0);
    }
  }, [open]);

  // Tick the resend cooldown down every second while active.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1 — request an OTP for the entered name + phone. Also used for resend.
  const requestOtp = async () => {
    setError(null);
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (!name) return setError("Please enter your name to continue.");
    if (!/^\d{10}$/.test(phone)) return setError("Please enter a valid 10-digit mobile number.");
    if (!agree) return setError("Please accept the Terms to continue.");
    setOtpBusy(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't send the code. Please try again.");
        return;
      }
      setOtpSent(true);
      setOtpCode("");
      setDevCode(data.devCode ?? null); // dev only — shown so you can test without the terminal
      setResendCooldown(30);
      toast("Verification code sent", "success");
    } catch {
      setError("Couldn't send the code. Please try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  // Step 2 — verify the OTP, then log in (save name + phone to the store).
  const verifyAndLogin = async () => {
    setError(null);
    const phone = contactPhone.trim();
    const code = otpCode.trim();
    if (!/^\d{4,6}$/.test(code)) return setError("Enter the 6-digit code we sent you.");
    setOtpBusy(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Incorrect code.");
        return;
      }
      setContact(contactName.trim(), phone);
      toast("Login successful", "success");
      onSuccess?.();
      onClose();
    } catch {
      setError("Couldn't verify the code. Please try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="animate-m-fade fixed inset-0 z-modal flex items-end justify-center p-0 sm:items-center sm:p-4"
          onClick={onClose}
          style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          {/* Outer wrapper — NOT scrollable, NOT clipped. Holds the close button safely. */}
          <div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Login to unlock price"
            onClick={(e) => e.stopPropagation()}
            className="animate-m-zoom-in relative w-full max-w-[420px]"
          >
            {/* Close — sits on the outer (unclipped) wrapper, never gets cropped */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-surface text-text-tertiary shadow-md ring-1 ring-border hover:text-text-primary sm:-right-3 sm:-top-3"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Inner wrapper — this is what scrolls and what has rounded corners */}
            <div className="max-h-[92vh] overflow-y-auto rounded-t-3xl bg-surface p-5 pt-6 shadow-2xl sm:rounded-3xl">
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

              {!otpSent ? (
                /* Step 1 — name + phone → send code */
                <div className="mt-5 space-y-4">
                  <Input
                    label="Full name"
                    placeholder="e.g. Aisha Khan"
                    leftIcon={<UserIcon className="h-[18px] w-[18px]" />}
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && requestOtp()}
                    autoComplete="name"
                    data-autofocus
                    autoFocus
                  />
                  <Input
                    label="Mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    leftIcon={<Phone className="h-[18px] w-[18px]" />}
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && requestOtp()}
                    autoComplete="tel"
                  />

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 rounded-xl bg-neutral-50 p-3.5 text-caption leading-relaxed text-text-secondary">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                    />
                    <span>
                      By continuing, I agree to Mobronix&apos;s{" "}
                      <Link href="/legal/terms-and-conditions" className="font-semibold text-brand">Terms &amp; Conditions</Link>,{" "}
                      <Link href="/legal/terms-of-use" className="font-semibold text-brand">Terms of Use</Link> and{" "}
                      <Link href="/legal/privacy-policy" className="font-semibold text-brand">Privacy Policy</Link>, and to receive
                      updates via SMS, Email, WhatsApp and other channels.
                    </span>
                  </label>

                  {error && <p role="alert" className="text-body-sm font-medium text-error-600">{error}</p>}

                  <Button fullWidth size="lg" isLoading={otpBusy} onClick={requestOtp}>
                    Continue
                  </Button>
                </div>
              ) : (
                /* Step 2 — enter the OTP → verify & log in */
                <div className="mt-5 space-y-4">
                  <p className="text-body-sm text-text-secondary">
                    Enter the 6-digit code sent to <b className="text-text-primary">+91 {contactPhone}</b>.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setError(null);
                        setDevCode(null);
                        setResendCooldown(0);
                      }}
                      className="font-semibold text-brand"
                    >
                      Change number
                    </button>
                  </p>

                  {devCode && (
                    <p className="rounded-lg bg-warning-50 px-3 py-2 text-caption text-warning-800">
                      Preview mode — your code is <b className="font-mono">{devCode}</b>. (Real SMS not configured yet.)
                    </p>
                  )}

                  <Input
                    label="Verification code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && verifyAndLogin()}
                    autoComplete="one-time-code"
                    data-autofocus
                    autoFocus
                  />

                  {error && <p role="alert" className="text-body-sm font-medium text-error-600">{error}</p>}

                  <Button fullWidth size="lg" isLoading={otpBusy} onClick={verifyAndLogin}>
                    Verify &amp; continue
                  </Button>

                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={otpBusy || resendCooldown > 0}
                    className="w-full text-center text-body-sm font-semibold text-text-tertiary hover:text-brand disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
