"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmt } from "@/lib/utils";

/** Floating cart summary bar (mobile), shown when devices are in the cart. */
export function CartBar() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const total = cart.reduce((s, c) => s + c.final, 0);

  return (
    <>
      {cart.length > 0 && (
        <button
          onClick={() => router.push("/cart")}
          className="fixed bottom-24 left-1/2 z-sticky flex w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 items-center justify-between rounded-xl bg-neutral-900 px-4 py-3.5 text-white shadow-lg animate-m-fade md:bottom-6"
        >
          <span className="flex items-center gap-2.5 text-body-sm font-semibold">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cart.length} device{cart.length > 1 ? "s" : ""} · {fmt(total)}
          </span>
          <span className="flex items-center gap-1 text-body-sm font-bold text-primary-200">
            View cart <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      )}
    </>
  );
}
