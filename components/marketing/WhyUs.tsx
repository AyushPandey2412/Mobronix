// "use client";

// import { Fragment } from "react";
// import { Check, X } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useReveal } from "@/lib/useReveal";

// const FEATURES = [
//   "Best Market Price",
//   "Free Doorstep Pickup",
//   "Instant Payment",
//   "IMEI Verification",
//   "Transparent Process",
// ];

// export function WhyUs() {
//   const { ref, shown } = useReveal<HTMLElement>();
//   return (
//     <section ref={ref} className="container-app py-14 md:py-20">
//       <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
//         {/* Left — heading */}
//         <div className={shown ? "animate-m-fade-up" : "opacity-0"}>
//           <span className="text-overline font-bold uppercase tracking-wider text-brand">Why us</span>
//           <h2 className="mt-2 bg-gradient-to-br from-primary-900 to-primary-600 bg-clip-text text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-transparent md:text-[2.5rem]">
//             Why sellers choose us
//           </h2>
//           <p className="mt-4 max-w-md text-body-lg text-text-secondary">
//             We offer more value, more trust, and a better experience — everything the others make you compromise on.
//           </p>
//         </div>

//         {/* Right — comparison table */}
//         <div
//           style={shown ? { animationDelay: "90ms" } : undefined}
//           className={cn(
//             shown ? "animate-m-fade-up" : "opacity-0",
//             "rounded-2xl border border-border bg-surface p-2.5 shadow-sm sm:p-3"
//           )}
//         >
//           <div className="grid grid-cols-[1.5fr_0.85fr_0.85fr]">
//             {/* Header */}
//             <div className="px-3 py-3.5 text-label text-text-tertiary sm:px-4">Features</div>
//             <div className="px-2 py-3.5 text-center text-label text-text-tertiary">Others</div>
//             <div className="rounded-t-xl bg-brand px-2 py-3.5 text-center text-label font-bold text-white">Us</div>

//             {/* Rows */}
//             {FEATURES.map((f, i) => {
//               const last = i === FEATURES.length - 1;
//               return (
//                 <Fragment key={f}>
//                   <div className="border-t border-border px-3 py-4 text-body-sm font-semibold text-text-primary sm:px-4">
//                     {f}
//                   </div>
//                   <div className="grid place-items-center border-t border-border px-2 py-4">
//                     <X className="h-5 w-5 text-neutral-300" strokeWidth={2.5} />
//                   </div>
//                   <div
//                     className={cn(
//                       "grid place-items-center border-t border-primary-100 bg-primary-50/60 px-2 py-4",
//                       last && "rounded-b-xl"
//                     )}
//                   >
//                     <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white shadow-sm">
//                       <Check className="h-3.5 w-3.5" strokeWidth={3} />
//                     </span>
//                   </div>
//                 </Fragment>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }







"use client";

import { Fragment } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/lib/useReveal";

const FEATURES = [
  "Best Market Price",
  "Free Doorstep Pickup",
  "Instant Payment",
  "IMEI Verification",
  "Transparent Process",
];

export function WhyUs() {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="container-app py-10 md:py-20">
      <div className="grid gap-7 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Left — heading */}
        <div className={shown ? "animate-m-fade-up" : "opacity-0"}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand md:text-overline">Why us</span>
          <h2 className="mt-2 bg-gradient-to-br from-primary-900 to-primary-600 bg-clip-text text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-transparent md:text-[2.5rem]">
            Why sellers choose us
          </h2>
          <p className="mt-3 max-w-md text-[13px] text-text-secondary md:mt-4 md:text-body-lg">
            We offer more value, more trust, and a better experience — everything the others make you compromise on.
          </p>
        </div>

        {/* Right — comparison table */}
        <div
          style={shown ? { animationDelay: "90ms" } : undefined}
          className={cn(
            shown ? "animate-m-fade-up" : "opacity-0",
            "rounded-2xl border border-border bg-surface p-2 shadow-sm sm:p-3"
          )}
        >
          <div className="grid grid-cols-[1.5fr_0.85fr_0.85fr]">
            {/* Header */}
            <div className="px-2.5 py-2.5 text-[11px] font-medium text-text-tertiary sm:px-4 sm:py-3.5 sm:text-label">Features</div>
            <div className="px-1.5 py-2.5 text-center text-[11px] font-medium text-text-tertiary sm:py-3.5 sm:text-label">Others</div>
            <div className="rounded-t-xl bg-brand px-1.5 py-2.5 text-center text-[11px] font-bold text-white sm:py-3.5 sm:text-label">Us</div>

            {/* Rows */}
            {FEATURES.map((f, i) => {
              const last = i === FEATURES.length - 1;
              return (
                <Fragment key={f}>
                  <div className="border-t border-border px-2.5 py-3 text-[12px] font-semibold text-text-primary sm:px-4 sm:py-4 sm:text-body-sm">
                    {f}
                  </div>
                  <div className="grid place-items-center border-t border-border px-1.5 py-3 sm:py-4">
                    <X className="h-4 w-4 text-neutral-300 sm:h-5 sm:w-5" strokeWidth={2.5} />
                  </div>
                  <div
                    className={cn(
                      "grid place-items-center border-t border-primary-100 bg-primary-50/60 px-1.5 py-3 sm:py-4",
                      last && "rounded-b-xl"
                    )}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow-sm sm:h-6 sm:w-6">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}