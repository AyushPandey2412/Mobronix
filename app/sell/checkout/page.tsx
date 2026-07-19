"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Info, MapPin, ShieldCheck, Wallet, Banknote } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { StickyBar } from "@/components/shared/StickyBar";
import { Textarea, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { SelectorRow } from "@/components/ui/Selectable";
import { Phone, User as UserIcon } from "lucide-react";
import { useStore, useActiveModel } from "@/lib/store";
import { SLOTS } from "@/lib/data";
import { fmt, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { DeviceLine } from "@/lib/types";
import { PhoneOtpLogin } from "@/components/shared/PhoneOtpLogin";
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
  const setContact          = useStore((s) => s.setContact);          // saves name + phone
  const submitEnquiry        = useStore((s) => s.submitEnquiry);       // builds local Enquiry object
  const patchCurrentEnquiry  = useStore((s) => s.patchCurrentEnquiry); // overwrites with real API values
  const updateEnquiryPickup = useStore((s) => s.updateEnquiryPickup);

  const [sheet,        setSheet]        = useState<"pay" | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // Login is NOT required to browse/quote — only to book the pickup here.
  const loggedIn =
    !!user && /^\d{10}$/.test(user.mobile ?? "") && !!user.name.trim() && user.name !== "Seller";

  useEffect(() => {
    if (editing) { if (!enquiry) router.replace("/track"); }
    else if (!model || !quote) { router.replace("/"); }
  }, [editing, enquiry, model, quote, router]);

  const { devices, total } = useMemo(() => {
    if (editing && enquiry) {
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
  }, [editing, enquiry, model, selectedStorage, quote, cart]);

  const submit = async () => {
    setError(null);
    setPincodeError(false);

    // ── Editing existing enquiry — local update only (no contact needed) ───
    if (editing) {
      if (!checkout.address || !checkout.pincode || !checkout.pay) {
        setError("Please fill the address and pincode, then select a payment mode.");
        return;
      }
      if (!/^\d{6}$/.test(checkout.pincode.trim())) { setPincodeError(true); return; }
      setSubmitting(true);
      updateEnquiryPickup();
      toast("Pickup details updated", "success");
      router.push("/track");
      return;
    }

    // ── Must be logged in (gate above blocks the form until then) ─────────
    if (!loggedIn || !user) {
      setError("Please log in with your name and mobile number to continue.");
      return;
    }
    const name  = user.name;
    const phone = user.mobile;

    if (!checkout.address || !checkout.pincode || !checkout.pay) {
      setError("Please fill the address and pincode, then select a payment mode.");
      return;
    }
    if (!/^\d{6}$/.test(checkout.pincode.trim())) {
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
        address:      checkout.address,
        pincode:      checkout.pincode,
        pickup_slot:  checkout.slot || "To be collected by phone",
        payment_mode: checkout.pay! as "UPI" | "Cash",
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

      router.push("/track");
    } catch (e: any) {
      setSubmitting(false);
      setError(e.message || "Something went wrong. Please try again.");
      toast(e.message || "Submission failed", "error");
    }
  };

  if ((editing && !enquiry) || (!editing && (!model || !quote))) return null;

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
                <span className="font-mono font-semibold text-text-primary">{fmt(d.final)}</span>
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
                fmt(total)
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

      {/* LOGIN GATE — name + phone, then OTP, before the pickup form unlocks */}
      {!editing && !loggedIn && (
        <div
          className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6 animate-m-fade-up"
        >
          <h3 className="text-h4 font-bold text-text-primary">Log in to book your pickup</h3>
          <p className="mt-1 mb-5 text-body-sm text-text-secondary">
            {devices.some(d => d.category === 'android' || d.final === 0) ? (
              <>
                Your request is ready to submit. Verify your mobile number — we&apos;ll call you on it to confirm your device &amp; the pickup slot.
              </>
            ) : (
              <>
                Your offer of <b className="text-text-primary">{fmt(total)}</b> is locked in. Verify your mobile
                number — we&apos;ll call you on it to confirm your device, the final price &amp; the pickup slot.
              </>
            )}
          </p>

          <PhoneOtpLogin />
        </div>
      )}

      {/* Pickup form — only after login (or when editing an existing pickup) */}
      {(editing || loggedIn) && (
      <>
      <div className="mt-6 space-y-5">
        <Textarea
          label="Pickup address"
          placeholder="Flat / House no, Street, Area"
          value={checkout.address}
          onChange={(e) => setCheckout({ address: e.target.value })}
        />
        <Input
          label="Pincode"
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
          <label className="mb-2 block text-label text-text-primary">Payment mode</label>
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
        <Button fullWidth isLoading={submitting} onClick={submit}>
          {editing ? "Save changes" : "Submit request"}
        </Button>
      </StickyBar>

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
