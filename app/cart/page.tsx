"use client";

import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Trash2, ShoppingBag } from "lucide-react";
import { AuthGate } from "@/components/shared/AuthGate";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { StickyBar } from "@/components/shared/StickyBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/utils";

function CartInner() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const promoteCartToActive = useStore((s) => s.promoteCartToActive);
  const total = cart.reduce((s, c) => s + c.final, 0);

  const continueToVerification = () => {
    promoteCartToActive();
    router.push("/sell/photos");
  };

  return (
    <div className="container-app mx-auto max-w-2xl pb-40 pt-2 md:pb-16">
      <FlowHeader title="Your devices" back="/" />

      {cart.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="No devices added yet"
          description="Pick an iPhone to get an instant quote and add it here."
          action={
            <Button onClick={() => router.push("/")} leftIcon={<Plus className="h-[18px] w-[18px]" />}>
              Add a device
            </Button>
          }
        />
      ) : (
        <>
          <div className="pt-2">
            <h2 className="text-h4 font-bold text-text-primary">
              {cart.length} device{cart.length > 1 ? "s" : ""} added
            </h2>
            <p className="mt-0.5 text-body-sm text-text-secondary">Add more or continue to verification &amp; pickup.</p>
          </div>

          <div className="mt-5 space-y-3">
              {cart.map((c, i) => (
                <div
                  key={`${c.modelId}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 animate-m-fade-up"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 font-bold text-brand">iP</span>
                    <div>
                      <h4 className="text-body-md font-bold text-text-primary">
                        {c.model} · {c.storage}
                      </h4>
                      <button
                        onClick={() => removeFromCart(i)}
                        className="mt-0.5 inline-flex items-center gap-1 text-caption font-bold text-error-600 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <span className="font-mono text-body-md font-extrabold text-text-primary">{fmt(c.final)}</span>
                </div>
              ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5">
            <span className="text-body-md font-bold text-text-primary">Total</span>
            <span className="font-mono text-h4 font-extrabold text-text-primary">{fmt(total)}</span>
          </div>

          <div className="mt-4">
            <Button variant="secondary" fullWidth size="lg" onClick={() => router.push("/")} leftIcon={<Plus className="h-[18px] w-[18px]" />}>
              Add another device
            </Button>
          </div>

          <StickyBar label="Total offer" value={fmt(total)} className="mt-6">
            <Button onClick={continueToVerification} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
              Continue to verification
            </Button>
          </StickyBar>
        </>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGate>
      <CartInner />
    </AuthGate>
  );
}
