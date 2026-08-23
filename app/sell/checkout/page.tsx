"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, ShieldCheck, Wallet, Banknote, X } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { StickyBar } from "@/components/shared/StickyBar";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { SelectorRow } from "@/components/ui/Selectable";
import { useStore, useActiveModel } from "@/lib/store";
import { SLOTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { DeviceLine } from "@/lib/types";
import { LoginModal } from "@/components/shared/LoginModal";
import { getResponses } from "@/lib/answers";

export default function CheckoutPage() {
  const router             = useRouter();
  const user               = useStore((s) => s.user);
  const model              = useActiveModel();
  const selectedStorage    = useStore((s) => s.selectedStorage);
  const quote              = useStore((s) => s.quote);
  const cart               = useStore((s) => s.cart);
  const enquiry            = useStore((s) => s.enquiry);
  const editing            = useStore((s) => s.editingEnquiry);
  const checkout           = useStore((s) => s.checkout);
  const setCheckout        = useStore((s) => s.setCheckout);
  const submitEnquiry        = useStore((s) => s.submitEnquiry);       // builds local Enquiry object
  const patchCurrentEnquiry  = useStore((s) => s.patchCurrentEnquiry); // overwrites with real API values
  const updateEnquiryPickup = useStore((s) => s.updateEnquiryPickup);

  const [sheet,        setSheet]        = useState<"pay" | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const closeThankYou = useCallback(() => {
    setShowThankYou(false);
    router.replace("/");
  }, [router]);

  useEffect(() => {
    if (!showThankYou) return;
    const timer = window.setTimeout(closeThankYou, 30000);
    return () => window.clearTimeout(timer);
  }, [closeThankYou, showThankYou]);

  // Login is NOT required to browse/quote — only to book the pickup here.
  const loggedIn =
    !!user && /^\d{10}$/.test(user.mobile ?? "") && !!user.name.trim() && user.name !== "Seller";
  const loginRequired = !editing && !loggedIn;

  useEffect(() => {
    if (editing) { if (!enquiry) router.replace("/track"); }
    else if (!submitted && (!model || !quote)) { router.replace("/"); }
  }, [editing, enquiry, model, quote, router, submitted]);

  const { devices, total } = useMemo(() => {
    if ((editing || submitted) && enquiry) {
      const d = (enquiry.devices?.length
        ? enquiry.devices
        : [{ model: enquiry.model, storage: enquiry.storage, final: enquiry.amount }]) as (DeviceLine & { category?: string })[];
      return { devices: d, total: enquiry.amount };
    }
    const cur =
      model && selectedStorage && quote
        ? [{ model: model.name, storage: selectedStorage, final: quote.final, category: model.category }]
        : [];
    const d = [
      ...cart.map((c) => {
        const itemModel = useStore.getState().models.find(m => m.id === c.modelId);
        return { model: c.model, storage: c.storage, final: c.final, category: itemModel?.category ?? 'iphone' };
      }),
      ...cur
    ];
    return { devices: d, total: d.reduce((s, x) => s + x.final, 0) };
  }, [editing, submitted, enquiry, model, selectedStorage, quote, cart]);

  const hasPickupDetails =
    checkout.address.trim().length > 0 ||
    checkout.pincode.trim().length > 0 ||
    !!checkout.pay;
  const submitLabel = submitted
    ? "Request submitted"
    : editing
      ? "Save changes"
      : hasPickupDetails
        ? "Submit request"
        : "Skip for now";

  const submit = async () => {
    setError(null);
    setPincodeError(false);

    // ── Editing existing enquiry — local update only (no contact needed) ───
    if (editing) {
      if (checkout.pincode.trim() && !/^\d{6}$/.test(checkout.pincode.trim())) { setPincodeError(true); return; }
      setSubmitting(true);
      try {
        if (enquiry?.id) {
          const res = await fetch("/api/enquiry", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: enquiry.id,
              address: checkout.address.trim() || undefined,
              pincode: checkout.pincode.trim() || undefined,
              pickup_slot: checkout.slot || undefined,
              payment_mode: checkout.pay || undefined,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Server error ${res.status}`);
          }
        }
        updateEnquiryPickup();
        toast("Pickup details updated", "success");
        router.replace("/track");
      } catch (e: any) {
        setSubmitting(false);
        setError(e.message || "Could not update pickup details. Please try again.");
        toast(e.message || "Update failed", "error");
      }
      return;
    }

    // ── Must be logged in (gate above blocks the form until then) ─────────
    if (!loggedIn || !user) {
      setError("Please log in with your name and mobile number to continue.");
      return;
    }
    const name  = user.name;
    const phone = user.mobile;

    if (checkout.pincode.trim() && !/^\d{6}$/.test(checkout.pincode.trim())) {
      setPincodeError(true);
      return;
    }

    setSubmitting(true);

    // ── New enquiry — POST to Supabase via API, then update local Zustand ──
    try {
      const st = useStore.getState();

      // Collect uploaded photo paths from Zustand store
      const uploadedPhotos = Object.entries(st.photos)
        .filter(([, v]) => v.done && v.path)
        .map(([slot, v]) => ({ slot, path: v.path! }));

      // Build the REAL per-device payload from the store (cart devices + the
      // active device) — preserving each device's base price, condition factors
      // and answers. (The display `devices` array is only model/storage/final.)
      const cat = model?.category ?? "iphone";
      const toFactors = (bd?: { label: string; factor: number }[]) =>
        (bd ?? []).map((b) => ({ label: b.label, factor: b.factor }));

      const cartDevices = st.cart.map((c) => {
        const itemModel = st.models.find(m => m.id === c.modelId);
        const itemCat = itemModel?.category || "iphone";
        return {
          model: c.model, storage: c.storage, category: itemCat,
          base: c.base, final: c.final,
          factors: toFactors(c.breakdown), answers: c.answers ?? {},
          responses: getResponses(c.answers ?? {}, itemCat, st.activeQuestions),
        };
      });
      const activeDevice =
        model && selectedStorage && quote
          ? [{
              model: model.name, storage: selectedStorage, category: model.category ?? "iphone",
              base: quote.base, final: quote.final,
              factors: toFactors(quote.breakdown), answers: st.answers ?? {},
              responses: getResponses(st.answers ?? {}, model.category ?? "iphone", st.activeQuestions),
            }]
          : [];
      const bodyDevices = [...cartDevices, ...activeDevice];

      const body = {
        devices:      bodyDevices,
        address:      checkout.address.trim() || undefined,
        pincode:      checkout.pincode.trim() || undefined,
        pickup_slot:  checkout.slot || "To be collected by phone",
        payment_mode: (checkout.pay || undefined) as "UPI" | "Cash" | undefined,
        photos:       uploadedPhotos,  // real Supabase Storage paths
        name,                          // seller contact — now stored on the enquiry
        mobile:       phone,
      };

      const res = await fetch("/api/enquiry", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const { enquiryId, displayId, assignedExec } = await res.json();

      setSubmitted(true);
      setShowThankYou(true);

      // 1. Build local Enquiry object in Zustand (for confirm + track pages)
      submitEnquiry();

      // 2. Overwrite the local-generated ID with the real Supabase values.
      //    This ensures admin dashboard and customer both see the same ENQ-XXXXX number.
      patchCurrentEnquiry({
        id:           enquiryId,     // real Supabase UUID (for Supabase queries)
        display_id:   displayId,     // real ENQ-XXXXX sequential number
        exec:         assignedExec,  // real assigned executive name
        assigned_exec: assignedExec,
      });

      setSubmitting(false);
    } catch (e: any) {
      setSubmitting(false);
      setError(e.message || "Something went wrong. Please try again.");
      toast(e.message || "Submission failed", "error");
    }
  };

  if ((editing && !enquiry) || (!editing && !submitted && (!model || !quote))) return null;

  if (loginRequired && model) {
    return (
      <LoginModal
        open
        onClose={() => router.back()}
        model={model}
        storage={selectedStorage}
        closeOnSuccess={false}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <FlowHeader title={editing ? "Edit pickup details" : "Schedule pickup"} back={editing ? "/track" : "/sell/condition"} />

      {/* Order summary */}
      <div
        className="mt-2 rounded-xl border border-border bg-surface p-5 animate-m-fade-up"
      >
        <h3 className="text-label text-text-primary">Your offer</h3>
        <div className="mt-3 space-y-2">
          {devices.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-body-sm">
              <span className="text-text-secondary">{d.model} · {d.storage}</span>
              {d.category === 'android' || d.final === 0 ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-200 text-[10px] font-semibold uppercase">
                  Awaiting Call
                </span>
              ) : (
                <span className="font-mono font-semibold text-text-primary">
                  ₹XX,XXX
                </span>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-dashed border-border pt-2.5">
            <span className="text-body-md font-bold text-text-primary">Total offer</span>
            <span className="font-mono text-body-md font-extrabold text-text-primary">
              {devices.some(d => d.category === 'android' || d.final === 0) ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-200 text-caption font-semibold uppercase">
                  Awaiting Call
                </span>
              ) : (
                "₹XX,XXX"
              )}
            </span>
          </div>
          {!editing && loggedIn && user && (
            <div className="flex items-center justify-between pt-1 text-caption text-text-tertiary">
              <span>Selling as</span>
              <span className="font-medium text-text-secondary">
                {user.name} · +91 {user.mobile}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pickup form — only after login (or when editing an existing pickup) */}
      {!editing && loggedIn && (
        <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3 animate-m-fade-up">
          <p className="text-body-sm font-medium text-text-secondary">
            Pickup address, pincode and payment mode are optional. You can add or edit them later from Track Order.
          </p>
        </div>
      )}

      {(editing || loggedIn) && (
      <>
      <div className="mt-6 space-y-5">
        <Textarea
          label="Pickup address (optional)"
          placeholder="Flat / House no, Street, Area - you can add this later"
          value={checkout.address}
          onChange={(e) => setCheckout({ address: e.target.value })}
        />
        <Input
          label="Pincode (optional)"
          inputMode="numeric"
          maxLength={6}
          placeholder="e.g. 400001"
          leftIcon={<MapPin className="h-[18px] w-[18px]" />}
          value={checkout.pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setCheckout({ pincode: val });
            if (val.length === 6) setPincodeError(false);
          }}
          error={pincodeError ? "Please enter a valid 6-digit pincode." : null}
        />

        {/* Preferred slot section removed */}

        <div>
          <label className="mb-2 block text-label text-text-primary">Payment mode (optional)</label>
          <SelectorRow value={checkout.pay} placeholder="Select payment mode" onClick={() => setSheet("pay")} />
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-body-sm text-warning-800">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
          Please keep a government-approved ID proof ready. we&apos;ll call to confirm the final price before the home visit.
        </div>

        {error && (
          <p role="alert" className="text-body-sm font-medium text-error-600">{error}</p>
        )}
      </div>

      <StickyBar className="mt-6">
        <Button fullWidth isLoading={submitting} disabled={submitted} onClick={submit}>
          {submitLabel}
        </Button>
      </StickyBar>

      {showThankYou && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thank-you-title"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-white px-5 py-10 text-center shadow-2xl ring-1 ring-border sm:px-10 sm:py-12">
            <button
              type="button"
              onClick={closeThankYou}
              aria-label="Close thank you message"
              className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary sm:right-3 sm:top-3"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="thank-you-title" className="text-[2.25rem] font-light leading-tight text-text-primary sm:text-[3.5rem]">
              Thank you!
            </h2>
            <p className="mx-auto mt-3 max-w-md text-body-sm leading-relaxed text-text-secondary sm:mt-4 sm:text-body-lg">
              Your message has been submitted. Someone from our team will contact you shortly.
            </p>
          </div>
        </div>
      )}

      {/* Slot sheet removed */}

      {/* Payment sheet */}
      <Sheet open={sheet === "pay"} onClose={() => setSheet(null)} title="Select payment mode">
        <div className="grid grid-cols-2 gap-3">
          {([
            { v: "UPI",  icon: Wallet,   sub: "Instant transfer" },
            { v: "Cash", icon: Banknote, sub: "Paid on pickup"   },
          ] as const).map((p) => (
            <button
              key={p.v}
              onClick={() => { setCheckout({ pay: p.v }); setSheet(null); }}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                checkout.pay === p.v ? "border-brand bg-primary-50" : "border-border hover:border-border-strong"
              )}
            >
              <p.icon className={cn("h-6 w-6", checkout.pay === p.v ? "text-brand" : "text-text-tertiary")} />
              <span className="text-body-md font-bold text-text-primary">{p.v}</span>
              <span className="text-caption text-text-tertiary">{p.sub}</span>
            </button>
          ))}
        </div>
      </Sheet>
      </>
      )}
    </div>
  );
}

function SheetOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between border-b border-border py-3.5 text-left last:border-0"
    >
      <span className={cn("text-body-md", selected ? "font-bold text-primary-700" : "font-medium text-text-primary")}>
        {label}
      </span>
      {selected && <Check className="h-5 w-5 text-brand" />}
    </button>
  );
}
