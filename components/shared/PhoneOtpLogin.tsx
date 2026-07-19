"use client";

import { useState } from "react";
import { Phone, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";

export interface PhoneOtpLoginProps {
  onSuccess?: (role: string) => void;
}

export function PhoneOtpLogin({ onSuccess }: PhoneOtpLoginProps) {
  const user = useStore((s) => s.user);
  const setContact = useStore((s) => s.setContact);

  const [contactName, setContactName] = useState(user && user.name !== "Seller" ? user.name : "");
  const [contactPhone, setContactPhone] = useState(user?.mobile ?? "");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async () => {
    setError(null);
    const name = contactName.trim();
    const phone = contactPhone.trim();
    if (!name) {
      setError("Please enter your name to continue.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
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
      setDevCode(data.devCode ?? null);
      toast("Verification code sent", "success");
    } catch {
      setError("Couldn't send the code. Please try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyAndLogin = async () => {
    setError(null);
    const name = contactName.trim();
    const phone = contactPhone.trim();
    const code = otpCode.trim();
    if (!/^\d{4,6}$/.test(code)) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone, code, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Incorrect code.");
        return;
      }
      setContact(name, phone, data.user?.role || "seller");
      toast("Successfully logged in", "success");
      onSuccess?.(data.user?.role || "seller");
    } catch {
      setError("Couldn't verify the code. Please try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <div className="w-full">
      {!otpSent ? (
        <div className="space-y-4 animate-m-fade-up">
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
          {error && <p role="alert" className="text-body-sm font-medium text-error-600">{error}</p>}
          <Button fullWidth size="lg" isLoading={otpBusy} onClick={requestOtp}>
            Send verification code
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-m-fade-up">
          <p className="text-body-sm text-text-secondary">
            Enter the 6-digit code sent to <b className="text-text-primary">+91 {contactPhone}</b>.{" "}
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setError(null);
                setDevCode(null);
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
          />
          {error && <p role="alert" className="text-body-sm font-medium text-error-600">{error}</p>}
          <Button fullWidth size="lg" isLoading={otpBusy} onClick={verifyAndLogin}>
            Verify &amp; continue
          </Button>
          <button
            type="button"
            onClick={requestOtp}
            disabled={otpBusy}
            className="w-full text-center text-body-sm font-semibold text-text-tertiary hover:text-brand disabled:opacity-50"
          >
            Resend code
          </button>
        </div>
      )}
    </div>
  );
}
