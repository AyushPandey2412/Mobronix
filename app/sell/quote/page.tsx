// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowRight, Plus, CheckCircle2, Sparkles, ChevronLeft, Lock } from "lucide-react";
// import { FlowHeader } from "@/components/shared/FlowHeader";
// import { StickyBar } from "@/components/shared/StickyBar";
// import { PriceUnlockModal } from "@/components/shared/PriceUnlockModal";
// import { Button } from "@/components/ui/Button";
// import { Badge } from "@/components/ui/Badge";
// import { useStore, useActiveModel } from "@/lib/store";
// import { quoteGrade } from "@/lib/quote";
// import { fmt, cn } from "@/lib/utils";
// import { toast } from "@/lib/toast";

// export default function QuotePage() {
//   const router = useRouter();
//   const model = useActiveModel();
//   const user = useStore((s) => s.user);
//   const selectedStorage = useStore((s) => s.selectedStorage);
//   const quote = useStore((s) => s.quote);
//   const cart = useStore((s) => s.cart);
//   const addCurrentToCart = useStore((s) => s.addCurrentToCart);
//   const computeQuote = useStore((s) => s.computeQuote);

//   // Show the unlock modal automatically when an unauthenticated seller lands here —
//   // but only AFTER the persisted store has rehydrated, otherwise a logged-in user
//   // sees the modal flash open on reload before `user` is restored from localStorage.
//   const [showLogin, setShowLogin] = useState(false);
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     if (useStore.persist.hasHydrated()) setHydrated(true);
//     return useStore.persist.onFinishHydration(() => setHydrated(true));
//   }, []);

//   useEffect(() => {
//     if (hydrated && !user) setShowLogin(true);
//   }, [hydrated, user]);

//   useEffect(() => {
//     if (!model) {
//       router.replace("/");
//       return;
//     }
//     if (!quote) computeQuote();
//   }, [model, quote, computeQuote, router]);

//   if (!model || !quote) return null;

//   const grade = quoteGrade(quote);
//   const cartTotal = cart.reduce((s, c) => s + c.final, 0);
//   const grandTotal = cartTotal + quote.final;

//   const addAnother = () => {
//     addCurrentToCart();
//     toast(`${model.name} added to your devices`, "success");
//     router.push("/");
//   };

//   return (
//     <div className="mx-auto max-w-xl">
//       <FlowHeader title="Your quote" back="/" />

//       <div
//         className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm animate-m-scale-in"
//       >
//         <div className="bg-gradient-to-b from-primary-50 to-surface px-6 pb-6 pt-8 text-center">
//           <span
//             className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-100 text-success-600 animate-m-pop"
//           >
//             <CheckCircle2 className="h-9 w-9" />
//           </span>
//           <p className="mt-4 text-body-sm font-medium text-text-secondary">
//             Your {model.category === "macbook" ? "MacBook" : "iPhone"} is worth (estimated)
//           </p>
//           <p
//             className={cn(
//               "my-1 font-mono text-[3rem] font-extrabold leading-none tracking-tight text-text-primary animate-m-fade-up",
//               !user && "select-none blur-[10px]"
//             )}
//             aria-hidden={!user}
//           >
//             {user ? fmt(quote.final) : "₹00,000"}
//           </p>
//           {!user && (
//             <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-caption font-semibold text-warning-700">
//               <Lock className="h-3.5 w-3.5" /> Sign in to reveal your price
//             </p>
//           )}
//           <p className="text-body-sm text-text-tertiary">
//             {model.name} · {selectedStorage}
//           </p>
//           <div className="mt-3 flex justify-center">
//             <Badge intent={grade.tone === "great" ? "success" : grade.tone === "good" ? "info" : "warning"}>
//               <Sparkles className="h-3.5 w-3.5" /> {grade.label}
//             </Badge>
//           </div>
//         </div>

//         {/* breakdown */}
//         <div className="border-t border-border p-5">
//           <h3 className="text-label text-text-primary">Price breakdown</h3>
//           <div className={cn("mt-3 space-y-0.5", !user && "select-none blur-[6px]")} aria-hidden={!user}>
//             <Row label="Base price" value={fmt(quote.base)} />
//             {quote.breakdown.length ? (
//               quote.breakdown.map((b, i) => (
//                 <Row
//                   key={i}
//                   label={b.val}
//                   value={`${b.factor < 1 ? "−" : "+"}${Math.abs(Math.round((1 - b.factor) * 100))}%`}
//                   muted
//                   negative={b.factor < 1}
//                 />
//               ))
//             ) : (
//               <Row label="No deductions — great condition!" value="—" muted />
//             )}
//             <div className="mt-1 flex items-center justify-between border-t border-dashed border-border pt-3">
//               <span className="text-body-md font-bold text-text-primary">Estimated offer</span>
//               <span className="font-mono text-body-md font-extrabold text-text-primary">{fmt(quote.final)}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!user ? (
//         /* Cashify/Cellkar-style gate — price stays blurred until the seller signs in */
//         <>
//           <div
//             className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-5 text-center animate-m-fade-up"
//           >
//             <h3 className="flex items-center justify-center gap-2 text-h4 font-bold text-text-primary">
//               <Lock className="h-5 w-5 text-brand" /> Your best price is locked
//             </h3>
//             <p className="mx-auto mt-1 max-w-sm text-body-sm text-text-secondary">
//               Log in with your mobile number to reveal your exact offer and book a free doorstep pickup.
//             </p>
//             <Button size="lg" className="mt-4" onClick={() => setShowLogin(true)} leftIcon={<Lock className="h-[18px] w-[18px]" />}>
//               Login to unlock price
//             </Button>
//           </div>

//           <PriceUnlockModal
//             open={showLogin}
//             onClose={() => setShowLogin(false)}
//             model={model}
//             storage={selectedStorage}
//             onSuccess={() => setShowLogin(false)}
//           />
//         </>
//       ) : (
//         <>
//           {cart.length > 0 && (
//             <div className="mt-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-body-sm text-warning-800">
//               + {cart.length} earlier device{cart.length > 1 ? "s" : ""} already added · combined total{" "}
//               <b className="font-mono">{fmt(grandTotal)}</b>
//             </div>
//           )}

//           <div className="mt-4 grid gap-3 sm:grid-cols-2">
//             <Button variant="secondary" size="lg" onClick={addAnother} leftIcon={<Plus className="h-[18px] w-[18px]" />}>
//               Sell another device
//             </Button>
//             <Button variant="outline" size="lg" onClick={() => router.push("/")} leftIcon={<ChevronLeft className="h-[18px] w-[18px]" />}>
//               Check another model
//             </Button>
//           </div>

//           <StickyBar label={cart.length ? "Total offer" : "Your offer"} value={fmt(grandTotal)} className="mt-6">
//             <Button onClick={() => router.push("/sell/photos")} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
//               Continue
//             </Button>
//           </StickyBar>
//         </>
//       )}
//     </div>
//   );
// }

// function Row({
//   label,
//   value,
//   muted,
//   negative,
// }: {
//   label: string;
//   value: string;
//   muted?: boolean;
//   negative?: boolean;
// }) {
//   return (
//     <div className="flex items-center justify-between gap-4 border-b border-dashed border-border py-2 last:border-0">
//       <span className={muted ? "text-body-sm text-text-secondary" : "text-body-sm text-text-primary"}>{label}</span>
//       <span
//         className={
//           negative
//             ? "font-mono text-body-sm font-semibold text-error-600"
//             : "font-mono text-body-sm font-semibold text-text-primary"
//         }
//       >
//         {value}
//       </span>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, CheckCircle2, Sparkles, ChevronLeft, Lock } from "lucide-react";
import { FlowHeader } from "@/components/shared/FlowHeader";
import { StickyBar } from "@/components/shared/StickyBar";
// import { PriceUnlockModal } from "@/components/shared/PriceUnlockModal"
import { LoginModal } from "@/components/shared/LoginModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore, useActiveModel } from "@/lib/store";
import { quoteGrade } from "@/lib/quote";
import { fmt, cn } from "@/lib/utils";
import { toast } from "@/lib/toast";


export default function QuotePage() {
  const router = useRouter();
  const model = useActiveModel();
  const user = useStore((s) => s.user);
  const selectedStorage = useStore((s) => s.selectedStorage);
  const quote = useStore((s) => s.quote);
  const cart = useStore((s) => s.cart);
  const addCurrentToCart = useStore((s) => s.addCurrentToCart);
  const computeQuote = useStore((s) => s.computeQuote);

  // Show the unlock modal automatically when an unauthenticated seller lands here —
  // but only AFTER the persisted store has rehydrated, otherwise a logged-in user
  // sees the modal flash open on reload before `user` is restored from localStorage.
  const [showLogin, setShowLogin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return useStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && !user) setShowLogin(true);
  }, [hydrated, user]);

  useEffect(() => {
    if (!model) {
      router.replace("/");
      return;
    }
    if (!quote) computeQuote();
  }, [model, quote, computeQuote, router]);

  if (!model || !quote) return null;

  const grade = quoteGrade(quote);
  const cartTotal = cart.reduce((s, c) => s + c.final, 0);
  const grandTotal = cartTotal + quote.final;

  const addAnother = () => {
    addCurrentToCart();
    toast(`${model.name} added to your devices`, "success");
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-xl">
      <FlowHeader title="Your quote" back="/" />

      <div
        className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm animate-m-scale-in"
      >
        <div className="bg-gradient-to-b from-primary-50 to-surface px-6 pb-6 pt-8 text-center">
          <span
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-100 text-success-600 animate-m-pop"
          >
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <p className="mt-4 text-body-sm font-medium text-text-secondary">
            Your {model.category === "macbook" ? "MacBook" : "iPhone"} is worth (estimated)
          </p>
          <p
            className={cn(
              "my-1 font-mono text-[3rem] font-extrabold leading-none tracking-tight text-text-primary animate-m-fade-up",
              !user && "select-none blur-[10px]"
            )}
            aria-hidden={!user}
          >
            {user ? fmt(quote.final) : "₹00,000"}
          </p>
          {!user && (
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-caption font-semibold text-warning-700">
              <Lock className="h-3.5 w-3.5" /> Sign in to reveal your price
            </p>
          )}
          <p className="text-body-sm text-text-tertiary">
            {model.name} · {selectedStorage}
          </p>
          <div className="mt-3 flex justify-center">
            <Badge intent={grade.tone === "great" ? "success" : grade.tone === "good" ? "info" : "warning"}>
              <Sparkles className="h-3.5 w-3.5" /> {grade.label}
            </Badge>
          </div>
        </div>

        {/* breakdown */}
        <div className="border-t border-border p-5">
          <h3 className="text-label text-text-primary">Price breakdown</h3>
          <div className={cn("mt-3 space-y-0.5", !user && "select-none blur-[6px]")} aria-hidden={!user}>
            <Row label="Base price" value={fmt(quote.base)} />
            {quote.breakdown.length ? (
              quote.breakdown.map((b, i) => (
                <Row
                  key={i}
                  label={b.val}
                  value={`${b.factor < 1 ? "−" : "+"}${Math.abs(Math.round((1 - b.factor) * 100))}%`}
                  muted
                  negative={b.factor < 1}
                />
              ))
            ) : (
              <Row label="No deductions — great condition!" value="—" muted />
            )}
            <div className="mt-1 flex items-center justify-between border-t border-dashed border-border pt-3">
              <span className="text-body-md font-bold text-text-primary">Estimated offer</span>
              <span className="font-mono text-body-md font-extrabold text-text-primary">{fmt(quote.final)}</span>
            </div>
          </div>
        </div>
      </div>

      {!user ? (
        /* Cashify/Cellkar-style gate — price stays blurred until the seller signs in */
        <>
          <div
            className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-5 text-center animate-m-fade-up"
          >
            <h3 className="flex items-center justify-center gap-2 text-h4 font-bold text-text-primary">
              <Lock className="h-5 w-5 text-brand" /> Your best price is locked
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-body-sm text-text-secondary">
              Log in with your mobile number to reveal your exact offer and book a free doorstep pickup.
            </p>
            <Button size="lg" className="mt-4" onClick={() => setShowLogin(true)} leftIcon={<Lock className="h-[18px] w-[18px]" />}>
              Login to unlock price
            </Button>
          </div>

   <LoginModal
            open={showLogin}
            onClose={() => setShowLogin(false)}
            model={model}
            storage={selectedStorage}
            onSuccess={() => {
              setShowLogin(false);
              router.push("/sell/checkout");
            }}
          />
        </>
      ) : (
        <>
          {cart.length > 0 && (
            <div className="mt-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-body-sm text-warning-800">
              + {cart.length} earlier device{cart.length > 1 ? "s" : ""} already added · combined total{" "}
              <b className="font-mono">{fmt(grandTotal)}</b>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={addAnother} leftIcon={<Plus className="h-[18px] w-[18px]" />}>
              Sell another device
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/")} leftIcon={<ChevronLeft className="h-[18px] w-[18px]" />}>
              Check another model
            </Button>
          </div>

          <StickyBar label={cart.length ? "Total offer" : "Your offer"} value={fmt(grandTotal)} className="mt-6">
            <Button onClick={() => router.push("/sell/checkout")} rightIcon={<ArrowRight className="h-[18px] w-[18px]" />}>
              Continue
            </Button>
          </StickyBar>
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  negative,
}: {
  label: string;
  value: string;
  muted?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-border py-2 last:border-0">
      <span className={muted ? "text-body-sm text-text-secondary" : "text-body-sm text-text-primary"}>{label}</span>
      <span
        className={
          negative
            ? "font-mono text-body-sm font-semibold text-error-600"
            : "font-mono text-body-sm font-semibold text-text-primary"
        }
      >
        {value}
      </span>
    </div>
  );
}
